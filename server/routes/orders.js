import { Router } from 'express'
import db from '../db.js'
import { authenticateToken, sanitizeInput } from '../middleware/auth.js'

const router = Router()

// ============================================
// GET /api/cart — get user's cart
// ============================================
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const cartItems = await db.selectAll('cart_items', { where: { user_id: req.user.id } })

    // Enrich with product info
    const enriched = await Promise.all(cartItems.map(async (ci) => {
      let product = null
      if (ci.product_type === 'course') product = await db.selectOne('courses', { id: ci.product_id }, 'name, price, image')
      else if (ci.product_type === 'combo') product = await db.selectOne('combos', { id: ci.product_id }, 'name, price, image')
      else if (ci.product_type === 'book') product = await db.selectOne('books', { id: ci.product_id }, 'name, price, image')
      else if (ci.product_type === 'document') product = await db.selectOne('documents', { id: ci.product_id }, 'title as name, price, image')
      return { ...ci, name: product?.name, price: product?.price, image: product?.image }
    }))

    res.json(enriched)
  } catch (err) {
    console.error('Cart error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// POST /api/cart/sync — sync localStorage cart to DB
// ============================================
router.post('/cart/sync', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Invalid cart data' })

    for (const item of items) {
      if (item.product_type && item.product_id && item.quantity > 0) {
        await db.upsert('cart_items', {
          user_id: req.user.id,
          product_type: item.product_type,
          product_id: item.product_id,
          quantity: item.quantity,
        }, { onConflict: 'user_id, product_type, product_id' })
      }
    }

    res.json({ message: 'Cart synced' })
  } catch (err) {
    console.error('Cart sync error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// DELETE /api/cart/:productType/:productId
// ============================================
router.delete('/cart/:productType/:productId', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_type', req.params.productType)
      .eq('product_id', req.params.productId)
    if (error) throw error
    res.json({ message: 'Removed from cart' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// DELETE /api/cart — clear cart
// ============================================
router.delete('/cart', authenticateToken, async (req, res) => {
  try {
    await db.remove('cart_items', { user_id: req.user.id })
    res.json({ message: 'Cart cleared' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// POST /api/orders — create order
// ============================================
router.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { name, phone, email, address, note, items } = req.body

    if (!name || !phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' })
    }

    // Duplicate order protection: check for pending orders in last 60 seconds
    const recentCutoff = new Date(Date.now() - 60000).toISOString()
    const { data: recentOrders } = await db.supabase
      .from('orders').select('id')
      .eq('user_id', req.user.id)
      .eq('status', 'pending')
      .gte('created_at', recentCutoff)
    if (recentOrders && recentOrders.length > 0) {
      return res.status(429).json({ error: 'Bạn vừa đặt hàng, vui lòng chờ 1 phút trước khi đặt lại' })
    }

    const paymentCode = 'TT' + Date.now().toString(36).toUpperCase()

    // Calculate total & resolve product names
    let totalAmount = 0
    const orderItems = []
    for (const item of items) {
      let product
      if (item.product_type === 'course') product = await db.selectOne('courses', { id: item.product_id }, 'name, price')
      else if (item.product_type === 'combo') product = await db.selectOne('combos', { id: item.product_id }, 'name, price')
      else if (item.product_type === 'book') product = await db.selectOne('books', { id: item.product_id }, 'name, price')
      else if (item.product_type === 'document') {
        const doc = await db.selectOne('documents', { id: parseInt(item.product_id) }, 'title, price')
        if (doc) product = { name: doc.title, price: doc.price }
      }
      if (!product) throw new Error(`Product not found: ${item.product_id}`)
      const price = product.price * (item.quantity || 1)
      totalAmount += price
      orderItems.push({ ...item, product_name: product.name, price: product.price })
    }

    // Create order
    const order = await db.insert('orders', {
      user_id: req.user.id,
      total_amount: totalAmount,
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      email: sanitizeInput(email || ''),
      address: sanitizeInput(address || ''),
      note: sanitizeInput(note || ''),
      payment_code: paymentCode,
    })

    // Insert order items
    for (const item of orderItems) {
      await db.insert('order_items', {
        order_id: order.id,
        product_type: item.product_type,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity || 1,
      })
    }

    // Clear user's cart
    await db.remove('cart_items', { user_id: req.user.id })

    res.status(201).json({
      message: 'Đặt hàng thành công',
      order: { orderId: order.id, totalAmount, paymentCode },
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: err.message || 'Lỗi tạo đơn hàng' })
  }
})

// ============================================
// GET /api/orders — user's orders
// ============================================
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { data: orders, error } = await db.supabase
      .from('orders').select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
    if (error) throw error

    // Attach items
    const result = await Promise.all((orders || []).map(async (order) => {
      const items = await db.selectAll('order_items', { where: { order_id: order.id } })
      return { ...order, items }
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// GET /api/orders/:id
// ============================================
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await db.selectOne('orders', { id: parseInt(req.params.id), user_id: req.user.id })
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
    order.items = await db.selectAll('order_items', { where: { order_id: order.id } })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// GET /api/orders/:id/status
// ============================================
router.get('/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const order = await db.selectOne('orders', { id: parseInt(req.params.id), user_id: req.user.id }, 'id, status')
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })
    res.json({ status: order.status })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// POST /api/orders/guest-document — guest (no auth) buy a single document
// ============================================
router.post('/orders/guest-document', async (req, res) => {
  try {
    const { document_id, name, phone, email } = req.body
    if (!document_id || !name || !phone) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin (tên, số điện thoại, mã tài liệu)' })
    }

    const doc = await db.selectOne('documents', { id: parseInt(document_id) }, 'id, title, price, file_url, status')
    if (!doc || doc.status !== 'active') return res.status(404).json({ error: 'Tài liệu không tồn tại' })

    // If free, return file_url immediately
    if (!doc.price || doc.price <= 0) {
      return res.json({ free: true, file_url: doc.file_url, title: doc.title })
    }

    const paymentCode = 'DOC' + Date.now().toString(36).toUpperCase()
    const order = await db.insert('orders', {
      user_id: null,
      total_amount: doc.price,
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      email: sanitizeInput(email || ''),
      address: '',
      note: `Tài liệu: ${doc.title}`,
      payment_code: paymentCode,
    })

    await db.insert('order_items', {
      order_id: order.id,
      product_type: 'document',
      product_id: String(doc.id),
      product_name: doc.title,
      price: doc.price,
      quantity: 1,
    })

    res.status(201).json({
      message: 'Đặt hàng thành công',
      order: {
        orderId: order.id,
        totalAmount: doc.price,
        paymentCode,
        docTitle: doc.title,
      },
    })
  } catch (err) {
    console.error('Guest document order error:', err)
    res.status(500).json({ error: err.message || 'Lỗi tạo đơn hàng' })
  }
})

// ============================================
// POST /api/orders/guest-book — guest (no auth) buy a single book
// ============================================
router.post('/orders/guest-book', async (req, res) => {
  try {
    const { book_id, name, phone, email } = req.body
    if (!book_id || !name || !phone) {
      return res.status(400).json({ error: 'Vui lòng điền đủ thông tin (tên, số điện thoại)' })
    }

    const book = await db.selectOne('books', { id: book_id }, 'id, name, price, image, status')
    if (!book || book.status !== 'active') return res.status(404).json({ error: 'Sách không tồn tại' })

    // If free, return immediately
    if (!book.price || book.price <= 0) {
      return res.json({ free: true, title: book.name })
    }

    const paymentCode = 'BOOK' + Date.now().toString(36).toUpperCase()
    const order = await db.insert('orders', {
      user_id: null,
      total_amount: book.price,
      name: sanitizeInput(name),
      phone: sanitizeInput(phone),
      email: sanitizeInput(email || ''),
      address: '',
      note: `Sách: ${book.name}`,
      payment_code: paymentCode,
    })

    await db.insert('order_items', {
      order_id: order.id,
      product_type: 'book',
      product_id: String(book.id),
      product_name: book.name,
      price: book.price,
      quantity: 1,
    })

    res.status(201).json({
      message: 'Đặt hàng thành công',
      order: {
        orderId: order.id,
        totalAmount: book.price,
        paymentCode,
        bookTitle: book.name,
        bookImage: book.image,
      },
    })
  } catch (err) {
    console.error('Guest book order error:', err)
    res.status(500).json({ error: err.message || 'Lỗi tạo đơn hàng' })
  }
})

// ============================================
// GET /api/orders/guest/:id/status — poll order status (no auth)
// ============================================
router.get('/orders/guest/:id/status', async (req, res) => {
  try {
    const order = await db.selectOne('orders', { id: parseInt(req.params.id) }, 'id, status')
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' })

    let file_url = null
    if (order.status === 'paid') {
      // Fetch document file_url from order items
      const items = await db.selectAll('order_items', { where: { order_id: order.id } })
      if (items.length > 0 && items[0].product_type === 'document') {
        const doc = await db.selectOne('documents', { id: parseInt(items[0].product_id) }, 'file_url')
        file_url = doc?.file_url || null
      }
    }

    res.json({ status: order.status, file_url })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

export default router
