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
// FILE UPLOAD (uses /tmp on Vercel serverless)
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, '/tmp'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()
    cb(null, Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6) + '.' + ext)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) cb(null, true)
    else cb(new Error('Chỉ chấp nhận ảnh JPEG, PNG, WebP, GIF'))
  },
})

app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Chưa chọn file' })
  res.json({ url: `/tmp/${req.file.filename}`, filename: req.file.filename })
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File quá lớn (tối đa 5MB)' })
    return res.status(400).json({ error: err.message })
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

// SePay webhook
app.post('/api/webhook/sepay', async (req, res) => {
  try {
    const { transferAmount, description, transactionId } = req.body
    if (!description || !transferAmount) return res.status(400).json({ error: 'Missing data' })
    const { data: order, error: orderErr } = await db.supabase
      .from('orders').select('*').eq('payment_code', description.trim()).eq('status', 'pending').maybeSingle()
    if (orderErr) throw orderErr
    if (!order) return res.status(404).json({ error: 'Order not found' })
    if (transferAmount >= order.total_amount) {
      await db.update('orders', { status: 'paid', updated_at: new Date().toISOString() }, { id: order.id })
      await db.insert('payments', {
        order_id: order.id, method: 'sepay', amount: transferAmount,
        transaction_id: transactionId, status: 'completed', raw_data: req.body,
      })
      const items = await db.selectAll('order_items', { where: { order_id: order.id } })
      for (const item of items) {
        if (item.product_type === 'course' || item.product_type === 'combo') {
          try { await db.upsert('user_courses', { user_id: order.user_id, course_id: item.product_id }, { onConflict: 'user_id, course_id' }) } catch (e) { /* ignore */ }
        }
      }
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(500).json({ error: 'Internal error' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), database: 'supabase', runtime: 'vercel-serverless' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
