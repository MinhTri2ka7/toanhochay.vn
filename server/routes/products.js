import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/courses
router.get('/courses', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('courses').select('*')
      .eq('status', 'active')
      .order('sort_order').order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    console.error('Courses error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/courses/:slug
router.get('/courses/:slug', async (req, res) => {
  try {
    const course = await db.selectOne('courses', { slug: req.params.slug, status: 'active' })
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa học' })
    res.json(course)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/combos
router.get('/combos', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('combos').select('*')
      .eq('status', 'active')
      .order('sort_order').order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/books
router.get('/books', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('books').select('*')
      .eq('status', 'active')
      .order('sort_order').order('created_at', { ascending: false })
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/feedbacks
router.get('/feedbacks', async (req, res) => {
  try {
    const type = req.query.type || 'feedback'
    const items = await db.selectAll('feedbacks', {
      where: { type, status: 'active' },
      order: { column: 'sort_order', ascending: true }
    })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/exams
router.get('/exams', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('mock_tests').select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (error) throw error
    const result = (data || []).map(e => ({ ...e, hasPasscode: !!e.passcode, passcode: undefined }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/exams/:id
router.get('/exams/:id', async (req, res) => {
  try {
    const exam = await db.selectOne('mock_tests', { id: parseInt(req.params.id) })
    if (!exam) return res.status(404).json({ error: 'Không tìm thấy đề thi' })

    if (exam.passcode) {
      return res.json({ ...exam, passcode: undefined, hasPasscode: true, questions: [] })
    }

    const questions = await db.selectAll('questions', {
      where: { test_id: parseInt(req.params.id) },
      order: { column: 'sort_order', ascending: true },
      columns: 'id, question_type, question_text, image, option_a, option_b, option_c, option_d, sort_order'
    })

    res.json({ ...exam, passcode: undefined, hasPasscode: false, questions })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// POST /api/exams/:id/verify-passcode
router.post('/exams/:id/verify-passcode', async (req, res) => {
  try {
    const { passcode } = req.body
    const exam = await db.selectOne('mock_tests', { id: parseInt(req.params.id) })
    if (!exam) return res.status(404).json({ error: 'Không tìm thấy đề thi' })

    if (!exam.passcode || exam.passcode === passcode) {
      const questions = await db.selectAll('questions', {
        where: { test_id: parseInt(req.params.id) },
        order: { column: 'sort_order', ascending: true },
        columns: 'id, question_type, question_text, image, option_a, option_b, option_c, option_d, sort_order'
      })
      return res.json({ success: true, questions })
    }

    res.status(403).json({ error: 'Mật khẩu không đúng' })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// POST /api/exams/:id/submit
router.post('/exams/:id/submit', async (req, res) => {
  try {
    const { answers, timeSpent } = req.body
    const testId = parseInt(req.params.id)

    const exam = await db.selectOne('mock_tests', { id: testId })
    if (!exam) return res.status(404).json({ error: 'Không tìm thấy đề thi' })

    const questions = await db.selectAll('questions', {
      where: { test_id: testId },
      order: { column: 'sort_order', ascending: true },
      columns: 'id, correct_answer, explanation'
    })

    let correctCount = 0
    const results = questions.map(q => {
      const userAnswer = answers?.[q.id] || ''
      const isCorrect = userAnswer === q.correct_answer
      if (isCorrect) correctCount++
      return { questionId: q.id, userAnswer, correctAnswer: q.correct_answer, isCorrect, explanation: q.explanation }
    })

    const score = questions.length > 0 ? (correctCount / questions.length * 10).toFixed(2) : 0

    // Save result if user is logged in
    const userId = req.user?.id || null
    if (userId) {
      await db.insert('test_results', {
        user_id: userId,
        test_id: testId,
        answers: answers || {},
        score: parseFloat(score),
        correct_count: correctCount,
        total_questions: questions.length,
        time_spent: timeSpent || 0,
      })
    }

    res.json({ score: parseFloat(score), correctCount, totalQuestions: questions.length, results })
  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// PUBLIC: Documents
// ============================================
router.get('/documents', async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('documents')
      .select('id, title, description, file_url, file_type, pages, downloads, category')
      .eq('status', 'active')
      .order('sort_order')
    if (error) throw error
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

router.post('/documents/:id/download', async (req, res) => {
  try {
    await db.increment('documents', 'downloads', 1, { id: parseInt(req.params.id) })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// PUBLIC: Site settings
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

// ============================================
// PUBLIC: Homepage Sections (dynamic)
// ============================================
router.get('/homepage-sections', async (req, res) => {
  try {
    // Get active sections ordered by sort_order
    const { data: sections, error } = await db.supabase
      .from('homepage_sections').select('*')
      .eq('status', 'active')
      .order('sort_order')
    if (error) throw error

    // For each section, fetch the matching products
    const result = await Promise.all((sections || []).map(async (section) => {
      let items = []
      const table = section.product_type === 'combo' ? 'combos'
                  : section.product_type === 'book' ? 'books'
                  : 'courses'

      let q = db.supabase.from(table).select('*').eq('status', 'active').order('sort_order')

      // Filter by category: match either the text category OR the section_<id> key
      const sectionKey = `section_${section.id}`
      if (section.category && section.category.trim()) {
        // Section has a named category — match products with that category OR section_<id>
        q = q.or(`category.eq.${section.category},category.eq.${sectionKey}`)
      } else {
        // Section has no category — match products with section_<id> as category, OR empty category (legacy)
        q = q.or(`category.eq.${sectionKey},category.eq.,category.is.null`)
      }

      const { data } = await q
      items = data || []

      return { ...section, items }
    }))

    // Filter out empty sections
    res.json(result.filter(s => s.items.length > 0))
  } catch (err) {
    console.error('Homepage sections error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

export default router
