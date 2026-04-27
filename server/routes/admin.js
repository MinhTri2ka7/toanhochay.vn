import { Router } from 'express'
import db from '../db.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import bcrypt from 'bcryptjs'

const router = Router()

// All admin routes require auth + admin role
router.use(authenticateToken, requireAdmin)

// ============================================
// DASHBOARD STATS
// ============================================
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await db.count('users')
    const totalOrders = await db.count('orders')
    const totalCourses = await db.count('courses')
    const totalBooks = await db.count('books')
    const pendingOrders = await db.count('orders', { status: 'pending' })

    // Total revenue (paid orders)
    const { data: revenueData } = await db.supabase
      .from('orders').select('total_amount')
      .eq('status', 'paid')
    const totalRevenue = (revenueData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)

    // Today's stats
    const today = new Date().toISOString().split('T')[0]
    const { data: todayData } = await db.supabase
      .from('orders').select('total_amount')
      .eq('status', 'paid')
      .gte('created_at', today + 'T00:00:00')
      .lt('created_at', today + 'T23:59:59')
    const todayRevenue = (todayData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const todayOrders = (todayData || []).length

    // This month
    const monthStart = new Date().toISOString().slice(0, 7) + '-01'
    const { data: monthData } = await db.supabase
      .from('orders').select('total_amount')
      .eq('status', 'paid')
      .gte('created_at', monthStart + 'T00:00:00')
    const monthRevenue = (monthData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0)
    const monthOrders = (monthData || []).length

    res.json({
      totalUsers, totalOrders, totalRevenue, totalCourses, totalBooks, pendingOrders,
      todayRevenue, todayOrders, monthRevenue, monthOrders,
    })
  } catch (err) {
    console.error('Stats error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// Revenue chart data
router.get('/revenue-chart', async (req, res) => {
  try {
    const { from, to } = req.query
    const startDate = from || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const endDate = to || new Date().toISOString().split('T')[0]

    const { data, error } = await db.supabase
      .from('orders').select('total_amount, created_at')
      .eq('status', 'paid')
      .gte('created_at', startDate + 'T00:00:00')
      .lte('created_at', endDate + 'T23:59:59')
      .order('created_at')
    if (error) throw error

    // Group by day
    const grouped = {}
    for (const o of data || []) {
      const day = o.created_at.split('T')[0]
      if (!grouped[day]) grouped[day] = { day, revenue: 0, order_count: 0 }
      grouped[day].revenue += o.total_amount || 0
      grouped[day].order_count++
    }
    res.json(Object.values(grouped))
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// Orders for a specific day
router.get('/orders-by-day', async (req, res) => {
  try {
    const { day } = req.query
    if (!day) return res.status(400).json({ error: 'Missing day parameter' })

    const { data: orders, error } = await db.supabase
      .from('orders').select('id, total_amount, status, name, email, phone, payment_code, created_at, user_id')
      .eq('status', 'paid')
      .gte('created_at', day + 'T00:00:00')
      .lt('created_at', day + 'T23:59:59')
      .order('created_at', { ascending: false })
    if (error) throw error

    const result = await Promise.all((orders || []).map(async (o) => {
      const user = await db.selectOne('users', { id: o.user_id }, 'name')
      const items = await db.selectAll('order_items', { where: { order_id: o.id }, columns: 'product_name, price, quantity' })
      return { ...o, user_name: user?.name, items }
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// USERS MANAGEMENT
// ============================================
router.get('/users', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('users').select('id, name, email, phone, role, status, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (req.params.id === req.user.id && status === 'blocked') {
      return res.status(400).json({ error: 'Không thể tự khóa tài khoản của mình' })
    }
    await db.update('users', { status }, { id: req.params.id })
    res.json({ message: 'Cập nhật trạng thái thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const newPassword = bcrypt.hashSync('12345678', 12)
    await db.update('users', { password: newPassword, login_attempts: 0, locked_until: null }, { id: req.params.id })
    res.json({ message: 'Đã reset mật khẩu về 12345678' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// COURSES CRUD
// ============================================
router.get('/courses', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('courses').select('*')
      .order('sort_order').order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/courses', async (req, res) => {
  try {
    const { id, slug, name, description, content, price, old_price, image, type, featured, status, category } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tên khóa học không được để trống' })
    if (price < 0) return res.status(400).json({ error: 'Giá không được âm' })
    const courseId = id || Date.now().toString(36) + Math.random().toString(36).substr(2)
    const courseSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    await db.insert('courses', {
      id: courseId, slug: courseSlug, name, description: description || '', content: content || '',
      price: price || 0, old_price: old_price || 0, image: image || '',
      type: type || 'live', featured: featured || false, status: status || 'active',
      category: category || '',
    })
    res.status(201).json({ message: 'Tạo khóa học thành công', id: courseId })
  } catch (err) {
    console.error('Create course error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/courses/:id', async (req, res) => {
  try {
    const { slug, name, description, content, price, old_price, image, type, featured, status, category } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tên khóa học không được để trống' })
    if (price < 0) return res.status(400).json({ error: 'Giá không được âm' })
    await db.update('courses', { slug, name, description, content, price, old_price, image, type, featured, status, category: category || '' }, { id: req.params.id })
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/courses/:id', async (req, res) => {
  try {
    await db.remove('courses', { id: req.params.id })
    res.json({ message: 'Đã xóa' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// BOOKS CRUD
// ============================================
router.get('/books', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('books').select('*')
      .order('sort_order').order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/books', async (req, res) => {
  try {
    const { name, description, price, old_price, image, stock, category } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tên sách không được để trống' })
    if (price < 0) return res.status(400).json({ error: 'Giá không được âm' })
    const bookId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    await db.insert('books', {
      id: bookId, name, description: description || '',
      price: price || 0, old_price: old_price || 0, image: image || '', stock: stock || 0,
      category: category || '',
    })
    res.status(201).json({ message: 'Tạo sách thành công', id: bookId })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/books/:id', async (req, res) => {
  try {
    const { name, description, price, old_price, image, stock, status, category } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tên sách không được để trống' })
    if (price < 0) return res.status(400).json({ error: 'Giá không được âm' })
    await db.update('books', { name, description, price, old_price, image, stock: stock ?? 0, status: status || 'active', category: category || '' }, { id: req.params.id })
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/books/:id/stock', async (req, res) => {
  try {
    await db.update('books', { stock: req.body.stock }, { id: req.params.id })
    res.json({ message: 'Cập nhật tồn kho thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/books/:id', async (req, res) => {
  try {
    await db.remove('books', { id: req.params.id })
    res.json({ message: 'Đã xóa' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// FEEDBACKS & HONORS CRUD
// ============================================
router.get('/feedbacks', async (req, res) => {
  try {
    const type = req.query.type || 'all'
    let query = db.supabase.from('feedbacks').select('*')
    if (type !== 'all') query = query.eq('type', type)
    const { data, error } = await query.order('type').order('sort_order')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/feedbacks', async (req, res) => {
  try {
    const { student_name, content, image, score, type, sort_order } = req.body
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2)
    await db.insert('feedbacks', {
      id, student_name: student_name || '', content: content || '', image: image || '',
      score: score || '', type: type || 'feedback', sort_order: sort_order || 0, status: 'active',
    })
    res.status(201).json({ message: 'Thêm thành công', id })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/feedbacks/:id', async (req, res) => {
  try {
    const { student_name, content, image, score, type, sort_order, status } = req.body
    await db.update('feedbacks', {
      student_name, content, image, score, type, sort_order: sort_order || 0, status: status || 'active',
    }, { id: req.params.id })
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/feedbacks/:id/toggle', async (req, res) => {
  try {
    const item = await db.selectOne('feedbacks', { id: req.params.id }, 'status')
    if (!item) return res.status(404).json({ error: 'Không tìm thấy' })
    const newStatus = item.status === 'active' ? 'hidden' : 'active'
    await db.update('feedbacks', { status: newStatus }, { id: req.params.id })
    res.json({ message: 'Cập nhật thành công', status: newStatus })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/feedbacks/:id', async (req, res) => {
  try {
    await db.remove('feedbacks', { id: req.params.id })
    res.json({ message: 'Đã xóa' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// ORDERS MANAGEMENT
// ============================================
router.get('/orders', async (req, res) => {
  try {
    const { data: orders, error } = await db.supabase
      .from('orders').select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    const result = await Promise.all((orders || []).map(async (o) => {
      const user = await db.selectOne('users', { id: o.user_id }, 'name, email')
      const items = await db.selectAll('order_items', { where: { order_id: o.id } })
      return { ...o, user_name: user?.name, user_email: user?.email, items }
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await db.update('orders', { status, updated_at: new Date().toISOString() }, { id: parseInt(req.params.id) })

    if (status === 'paid') {
      const order = await db.selectOne('orders', { id: parseInt(req.params.id) })
      const items = await db.selectAll('order_items', { where: { order_id: parseInt(req.params.id) } })

      for (const item of items) {
        if (item.product_type === 'course' || item.product_type === 'combo') {
          try {
            await db.upsert('user_courses', { user_id: order.user_id, course_id: item.product_id }, { onConflict: 'user_id, course_id' })
          } catch (e) { /* ignore duplicates */ }
        }
      }

      try {
        await db.insert('payments', { order_id: parseInt(req.params.id), method: 'manual', amount: order.total_amount, status: 'completed' })
      } catch (e) { /* ignore */ }
    }

    res.json({ message: 'Cập nhật trạng thái đơn hàng thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// TRANSACTION HISTORY
// ============================================
router.get('/transactions', async (req, res) => {
  try {
    const { data: payments, error } = await db.supabase
      .from('payments').select('*')
      .order('created_at', { ascending: false })
    if (error) throw error

    const result = await Promise.all((payments || []).map(async (p) => {
      const order = p.order_id ? await db.selectOne('orders', { id: p.order_id }, 'payment_code, name, email, total_amount') : null
      return {
        ...p,
        payment_code: order?.payment_code, customer_name: order?.name,
        customer_email: order?.email, order_total: order?.total_amount,
      }
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// EXAM RESULTS
// ============================================
router.get('/exam-results', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('test_results').select('*')
      .order('completed_at', { ascending: false })
    if (error) throw error

    const result = await Promise.all((data || []).map(async (tr) => {
      const user = tr.user_id ? await db.selectOne('users', { id: tr.user_id }, 'name, email') : null
      const exam = await db.selectOne('mock_tests', { id: tr.test_id }, 'title')
      return { ...tr, student_name: user?.name, student_email: user?.email, exam_title: exam?.title }
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// MOCK TESTS CRUD
// ============================================
router.get('/exams', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('mock_tests').select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/exams', async (req, res) => {
  try {
    const { title, subject, duration, difficulty, passcode, points_correct, points_wrong } = req.body
    if (!title || !title.trim()) return res.status(400).json({ error: 'Tiêu đề không được để trống' })
    const exam = await db.insert('mock_tests', {
      title, subject: subject || 'math', duration: duration || 90,
      total_questions: 0, difficulty: difficulty || 'medium', passcode: passcode || null,
      points_correct: points_correct ?? 1, points_wrong: points_wrong ?? 0,
    })
    res.status(201).json({ message: 'Tạo đề thi thành công', id: exam.id })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/exams/:id', async (req, res) => {
  try {
    const { title, subject, duration, difficulty, passcode, status, points_correct, points_wrong } = req.body
    if (!title || !title.trim()) return res.status(400).json({ error: 'Tiêu đề không được để trống' })
    await db.update('mock_tests', {
      title, subject, duration, difficulty, passcode: passcode || null, status,
      points_correct: points_correct ?? 1, points_wrong: points_wrong ?? 0,
    }, { id: parseInt(req.params.id) })
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/exams/:id/toggle', async (req, res) => {
  try {
    const exam = await db.selectOne('mock_tests', { id: parseInt(req.params.id) }, 'status')
    if (!exam) return res.status(404).json({ error: 'Không tìm thấy' })
    const newStatus = exam.status === 'active' ? 'inactive' : 'active'
    await db.update('mock_tests', { status: newStatus }, { id: parseInt(req.params.id) })
    res.json({ message: 'Cập nhật thành công', status: newStatus })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/exams/:id', async (req, res) => {
  try {
    await db.remove('mock_tests', { id: parseInt(req.params.id) })
    res.json({ message: 'Đã xóa' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// Questions for a test
router.get('/exams/:id/questions', async (req, res) => {
  try {
    const questions = await db.selectAll('questions', {
      where: { test_id: parseInt(req.params.id) },
      order: { column: 'sort_order', ascending: true }
    })
    res.json(questions)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/exams/:id/questions', async (req, res) => {
  try {
    const { question_type, question_text, image, option_a, option_b, option_c, option_d,
            option_a_image, option_b_image, option_c_image, option_d_image,
            correct_answer, explanation } = req.body
    if (!question_text) return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống' })
    const count = await db.count('questions', { test_id: parseInt(req.params.id) })
    await db.insert('questions', {
      test_id: parseInt(req.params.id), question_type: question_type || 'multiple_choice',
      question_text, image: image || null, option_a: option_a || null, option_b: option_b || null,
      option_c: option_c || null, option_d: option_d || null,
      option_a_image: option_a_image || '', option_b_image: option_b_image || '',
      option_c_image: option_c_image || '', option_d_image: option_d_image || '',
      correct_answer: correct_answer || null,
      explanation: explanation || '', sort_order: count + 1,
    })
    // Update total_questions
    const newCount = await db.count('questions', { test_id: parseInt(req.params.id) })
    await db.update('mock_tests', { total_questions: newCount }, { id: parseInt(req.params.id) })
    res.status(201).json({ message: 'Thêm câu hỏi thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/exams/:testId/questions/:qId', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('questions').delete()
      .eq('id', parseInt(req.params.qId))
      .eq('test_id', parseInt(req.params.testId))
    if (error) throw error

    const newCount = await db.count('questions', { test_id: parseInt(req.params.testId) })
    await db.update('mock_tests', { total_questions: newCount }, { id: parseInt(req.params.testId) })
    res.json({ message: 'Đã xóa câu hỏi' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// DOCUMENTS MANAGEMENT
// ============================================
router.get('/documents', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('documents').select('*')
      .order('sort_order').order('id', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/documents', async (req, res) => {
  try {
    const { title, description, file_url, file_type, pages, category, status } = req.body
    if (!title) return res.status(400).json({ error: 'Tiêu đề không được để trống' })
    const count = await db.count('documents')
    await db.insert('documents', {
      title, description: description || '', file_url: file_url || '',
      file_type: file_type || 'PDF', pages: pages || 0,
      category: category || 'general', status: status || 'active', sort_order: count + 1,
    })
    res.status(201).json({ message: 'Thêm tài liệu thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/documents/:id', async (req, res) => {
  try {
    const { title, description, file_url, file_type, pages, category, status } = req.body
    if (!title) return res.status(400).json({ error: 'Tiêu đề không được để trống' })
    await db.update('documents', {
      title, description: description || '', file_url: file_url || '',
      file_type: file_type || 'PDF', pages: pages || 0,
      category: category || 'general', status: status || 'active',
    }, { id: parseInt(req.params.id) })
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/documents/:id', async (req, res) => {
  try {
    await db.remove('documents', { id: parseInt(req.params.id) })
    res.json({ message: 'Đã xóa' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// SITE SETTINGS
// ============================================
router.get('/settings', async (req, res) => {
  try {
    const rows = await db.selectAll('site_settings')
    const settings = {}
    for (const row of rows) settings[row.key] = row.value
    res.json(settings)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/settings', async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await db.upsert('site_settings', { key, value: String(value || '') }, { onConflict: 'key' })
    }
    res.json({ message: 'Cập nhật cài đặt thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// HOMEPAGE SECTIONS MANAGEMENT
// ============================================
router.get('/homepage-sections', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('homepage_sections').select('*')
      .order('sort_order')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/homepage-sections', async (req, res) => {
  try {
    const { title, subtitle, product_type, category, icon, sort_order } = req.body
    if (!title || !title.trim()) return res.status(400).json({ error: 'Tiêu đề không được để trống' })
    if (!product_type) return res.status(400).json({ error: 'Loại sản phẩm không được để trống' })
    const count = await db.count('homepage_sections')
    await db.insert('homepage_sections', {
      title, subtitle: subtitle || '', product_type,
      category: category || '', icon: icon || 'LibraryBig',
      sort_order: sort_order || count + 1,
    })
    res.status(201).json({ message: 'Tạo nhóm thành công' })
  } catch (err) {
    console.error('Create section error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/homepage-sections/:id', async (req, res) => {
  try {
    const { title, subtitle, product_type, category, icon, sort_order, status } = req.body
    if (!title || !title.trim()) return res.status(400).json({ error: 'Tiêu đề không được để trống' })
    await db.update('homepage_sections', {
      title, subtitle: subtitle || '', product_type, category: category || '',
      icon: icon || 'LibraryBig', sort_order: sort_order || 0, status: status || 'active',
    }, { id: parseInt(req.params.id) })
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/homepage-sections/:id', async (req, res) => {
  try {
    await db.remove('homepage_sections', { id: parseInt(req.params.id) })
    res.json({ message: 'Đã xóa' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// CATEGORIES (derived from homepage sections — every section is a group)
// ============================================
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('homepage_sections').select('id, title, product_type, category')
      .order('sort_order')
    if (error) throw error
    // Every section becomes a selectable category.
    // Use section.category if set, otherwise use "section_<id>" as the category key.
    const categories = (data || []).map(s => ({
      category: s.category && s.category.trim() ? s.category : `section_${s.id}`,
      product_type: s.product_type,
      title: s.title,
      section_id: s.id,
    }))
    res.json(categories)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// COMBOS CRUD
// ============================================
router.get('/combos', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('combos').select('*')
      .order('sort_order').order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/combos', async (req, res) => {
  try {
    const { name, description, price, old_price, image, category } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tên combo không được để trống' })
    const comboId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    await db.insert('combos', {
      id: comboId, name, description: description || '',
      price: price || 0, old_price: old_price || 0, image: image || '',
      category: category || '',
    })
    res.status(201).json({ message: 'Tạo combo thành công', id: comboId })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.put('/combos/:id', async (req, res) => {
  try {
    const { name, description, price, old_price, image, status, category } = req.body
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tên combo không được để trống' })
    await db.update('combos', {
      name, description, price, old_price, image, status: status || 'active', category: category || '',
    }, { id: req.params.id })
    res.json({ message: 'Cập nhật thành công' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.delete('/combos/:id', async (req, res) => {
  try {
    await db.remove('combos', { id: req.params.id })
    res.json({ message: 'Đã xóa' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

export default router
