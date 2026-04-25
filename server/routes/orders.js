import { Router } from 'express'
import db from '../db.js'
import { authenticateToken } from '../middleware/auth.js'

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

    const paymentCode = 'TT' + Date.now().toString(36).toUpperCase()

    // Calculate total & resolve product names
    let totalAmount = 0
    const orderItems = []
    for (const item of items) {
      let product
      if (item.product_type === 'course') product = await db.selectOne('courses', { id: item.product_id }, 'name, price')
      else if (item.product_type === 'combo') product = await db.selectOne('combos', { id: item.product_id }, 'name, price')
      else if (item.product_type === 'book') product = await db.selectOne('books', { id: item.product_id }, 'name, price')
      if (!product) throw new Error(`Product not found: ${item.product_id}`)
      const price = product.price * (item.quantity || 1)
      totalAmount += price
      orderItems.push({ ...item, product_name: product.name, price: product.price })
    }

    // Create order
    const order = await db.insert('orders', {
      user_id: req.user.id,
      total_amount: totalAmount,
      name, phone,
      email: email || '',
      address: address || '',
      note: note || '',
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

export default router
