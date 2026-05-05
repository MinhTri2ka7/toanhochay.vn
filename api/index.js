import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import multer from 'multer'

// On Vercel, env vars come from the dashboard — dotenv is not needed
// but won't hurt if .env doesn't exist
import dotenv from 'dotenv'
dotenv.config()

import { apiLimiter, optionalAuth, authenticateToken, requireAdmin } from '../server/middleware/auth.js'
import authRoutes from '../server/routes/auth.js'
import productRoutes from '../server/routes/products.js'
import orderRoutes from '../server/routes/orders.js'
import adminRoutes from '../server/routes/admin.js'
import db from '../server/db.js'

const app = express()

// ============================================
// SECURITY MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))

app.use(cors({
  origin: true,
  credentials: true,
}))

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limit
app.use('/api', apiLimiter)

// ============================================
// FILE UPLOAD (Supabase Storage)
// ============================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Chỉ chấp nhận ảnh JPEG, PNG, WebP, GIF'))
  },
})

app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Chưa chọn file' })

    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'png'
    const fileName = `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 6)}.${ext}`
    const filePath = `images/${fileName}`

    // Upload to Supabase Storage
    const { data, error } = await db.supabase.storage
      .from('uploads')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage upload error:', error)
      return res.status(500).json({ error: `Lỗi upload: ${error.message}` })
    }

    // Get public URL
    const { data: urlData } = db.supabase.storage.from('uploads').getPublicUrl(filePath)
    res.json({ url: urlData.publicUrl, filename: fileName })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: err.message || 'Lỗi upload ảnh' })
  }
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File quá lớn (tối đa 5MB)' })
    return res.status(400).json({ error: `Lỗi upload: ${err.message}` })
  }
  if (err.message?.includes('Chỉ chấp nhận')) return res.status(400).json({ error: err.message })
  next(err)
})

// ============================================
// API ROUTES
// ============================================
app.use('/api', authRoutes)
app.use('/api', optionalAuth, productRoutes)
app.use('/api', orderRoutes)
app.use('/api/admin', adminRoutes)

// ============================================
// SEPAY WEBHOOK — Auto payment verification
// Docs: https://docs.sepay.vn/tich-hop-webhooks.html
// ============================================
app.post('/api/webhook/sepay', async (req, res) => {
  try {
    // 1. API Key authentication (optional but recommended)
    const sepayApiKey = process.env.SEPAY_API_KEY
    if (sepayApiKey) {
      const authHeader = req.headers['authorization'] || ''
      const providedKey = authHeader.replace(/^Apikey\s+/i, '').trim()
      if (providedKey !== sepayApiKey) {
        console.warn('SePay webhook: Invalid API Key')
        return res.status(401).json({ success: false, message: 'Unauthorized' })
      }
    }

    // 2. Extract SePay webhook fields (official format)
    const {
      id: sepayId,          // ID giao dịch trên SePay (dùng để chống trùng)
      gateway,              // Tên ngân hàng
      transactionDate,
      accountNumber,
      code,                 // Mã thanh toán (SePay tự nhận diện)
      content,              // Nội dung chuyển khoản
      transferType,         // "in" = tiền vào, "out" = tiền ra
      transferAmount,       // Số tiền giao dịch
      accumulated,
      subAccount,
      referenceCode,        // Mã tham chiếu SMS
      description,          // Toàn bộ nội dung SMS
    } = req.body

    // Only process incoming transfers
    if (transferType === 'out') {
      return res.json({ success: true, message: 'Outgoing transfer ignored' })
    }

    if (!transferAmount || transferAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transfer amount' })
    }

    // 3. Deduplication
    if (sepayId) {
      const existing = await db.selectOne('payments', { sepay_transaction_id: sepayId })
      if (existing) {
        return res.json({ success: true, message: 'Already processed' })
      }
    }

    // 4. Find matching pending order
    let order = null

    if (code) {
      const { data, error } = await db.supabase
        .from('orders').select('*')
        .eq('payment_code', code.trim().toUpperCase())
        .eq('status', 'pending')
        .maybeSingle()
      if (error) throw error
      order = data
    }

    if (!order && content) {
      const contentUpper = content.toUpperCase().replace(/\s+/g, '')
      const { data: pendingOrders, error } = await db.supabase
        .from('orders').select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      if (pendingOrders) {
        order = pendingOrders.find(o =>
          o.payment_code && contentUpper.includes(o.payment_code.toUpperCase())
        )
      }
    }

    if (!order) {
      return res.json({ success: true, message: 'No matching order' })
    }

    // 5. Verify amount and update
    if (transferAmount >= order.total_amount) {
      await db.update('orders', { status: 'paid', updated_at: new Date().toISOString() }, { id: order.id })
      await db.insert('payments', {
        order_id: order.id, method: 'sepay', amount: transferAmount,
        transaction_id: referenceCode || String(sepayId || ''),
        sepay_transaction_id: sepayId || null,
        status: 'completed', raw_data: req.body,
      })

      // Auto-activate courses/combos
      const items = await db.selectAll('order_items', { where: { order_id: order.id } })
      for (const item of items) {
        if (item.product_type === 'course') {
          try {
            await db.upsert('user_courses', { user_id: order.user_id, course_id: item.product_id }, { onConflict: 'user_id, course_id' })
          } catch (e) { /* ignore */ }
        } else if (item.product_type === 'combo') {
          try {
            const comboItems = await db.selectAll('combo_items', { where: { combo_id: item.product_id } })
            for (const ci of comboItems) {
              await db.upsert('user_courses', { user_id: order.user_id, course_id: ci.course_id }, { onConflict: 'user_id, course_id' })
            }
          } catch (e) { /* ignore */ }
        }
      }
      console.log(`✅ SePay: Order #${order.id} paid — ${transferAmount}đ via ${gateway}`)
    } else {
      await db.insert('payments', {
        order_id: order.id, method: 'sepay', amount: transferAmount,
        transaction_id: referenceCode || String(sepayId || ''),
        sepay_transaction_id: sepayId || null,
        status: 'partial', raw_data: req.body,
      })
    }

    res.json({ success: true })
  } catch (err) {
    console.error('SePay webhook error:', err)
    res.status(500).json({ success: false, message: 'Internal error' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: 'supabase', runtime: 'vercel-serverless' })
})

// File upload for documents (admin only)
const fileUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })
app.post('/api/upload-file', authenticateToken, requireAdmin, fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Chưa chọn file' })
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    const fileName = `${Date.now().toString(36)}_${safeName}`
    const filePath = `lessons/${fileName}`
    const { data, error } = await db.supabase.storage.from('files').upload(filePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false })
    if (error) return res.status(500).json({ error: `Lỗi upload: ${error.message}` })
    const { data: urlData } = db.supabase.storage.from('files').getPublicUrl(filePath)
    res.json({ url: urlData.publicUrl, name: req.file.originalname, size: req.file.size, type: req.file.mimetype })
  } catch (err) { res.status(500).json({ error: err.message || 'Lỗi upload file' }) }
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
