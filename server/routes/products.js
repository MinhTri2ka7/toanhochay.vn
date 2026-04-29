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

    // Get attempt counts per test
    const testIds = (data || []).map(e => e.id)
    let attemptMap = {}
    if (testIds.length > 0) {
      const { data: results } = await db.supabase
        .from('test_results').select('test_id')
        .in('test_id', testIds)
      // Count attempts per test_id
      for (const r of (results || [])) {
        attemptMap[r.test_id] = (attemptMap[r.test_id] || 0) + 1
      }
    }

    const result = (data || []).map(e => ({
      ...e,
      hasPasscode: !!e.passcode,
      passcode: undefined,
      attempt_count: attemptMap[e.id] || 0,
    }))
    res.json(result)
  } catch (err) {
    console.error('Exams error:', err)
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
      columns: 'id, question_type, question_text, image, option_a, option_b, option_c, option_d, option_e, sort_order'
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
        columns: 'id, question_type, question_text, image, option_a, option_b, option_c, option_d, option_e, sort_order'
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
      columns: 'id, correct_answer, explanation, points_correct, points_wrong'
    })

    let correctCount = 0
    let wrongCount = 0
    let unansweredCount = 0
    let totalScore = 0
    let maxScore = 0

    const resultsArr = questions.map(q => {
      const pc = q.points_correct ?? 1
      const pw = q.points_wrong ?? 0
      maxScore += pc

      const userAnswer = answers?.[q.id] || ''
      if (!userAnswer) {
        unansweredCount++
        return { questionId: q.id, userAnswer: '', correctAnswer: q.correct_answer, isCorrect: false, isUnanswered: true, explanation: q.explanation, pointsCorrect: pc, pointsWrong: pw, pointsEarned: 0 }
      }
      const isCorrect = userAnswer === q.correct_answer
      let earned = 0
      if (isCorrect) {
        correctCount++
        earned = pc
      } else {
        wrongCount++
        earned = -pw
      }
      totalScore += earned
      return { questionId: q.id, userAnswer, correctAnswer: q.correct_answer, isCorrect, isUnanswered: false, explanation: q.explanation, pointsCorrect: pc, pointsWrong: pw, pointsEarned: earned }
    })

    const score = Math.max(0, parseFloat(totalScore.toFixed(2)))
    maxScore = parseFloat(maxScore.toFixed(2))

    // Save result if user is logged in
    const userId = req.user?.id || null
    if (userId) {
      await db.insert('test_results', {
        user_id: userId,
        test_id: testId,
        answers: answers || {},
        score,
        correct_count: correctCount,
        total_questions: questions.length,
        time_spent: timeSpent || 0,
      })
    }

    // Fetch leaderboard (top 20)
    let leaderboard = []
    try {
      const { data: lbData } = await db.supabase
        .from('test_results')
        .select('user_id, score, correct_count, total_questions, time_spent, completed_at')
        .eq('test_id', testId)
        .order('score', { ascending: false })
        .order('time_spent', { ascending: true })
        .limit(50)

      // Group by user — keep best score per user
      const userBest = {}
      for (const r of (lbData || [])) {
        if (!userBest[r.user_id] || r.score > userBest[r.user_id].score ||
            (r.score === userBest[r.user_id].score && r.time_spent < userBest[r.user_id].time_spent)) {
          userBest[r.user_id] = r
        }
      }

      const sortedEntries = Object.values(userBest)
        .sort((a, b) => b.score - a.score || a.time_spent - b.time_spent)
        .slice(0, 20)

      // Fetch user names
      const userIds = sortedEntries.map(e => e.user_id).filter(Boolean)
      let userMap = {}
      if (userIds.length > 0) {
        const { data: users } = await db.supabase
          .from('users').select('id, name')
          .in('id', userIds)
        for (const u of (users || [])) userMap[u.id] = u.name
      }

      leaderboard = sortedEntries.map((e, i) => ({
        rank: i + 1,
        name: userMap[e.user_id] || 'Ẩn danh',
        score: e.score,
        correctCount: e.correct_count,
        totalQuestions: e.total_questions,
        timeSpent: e.time_spent,
        isMe: e.user_id === userId,
      }))
    } catch (lbErr) {
      console.error('Leaderboard error:', lbErr)
    }

    res.json({
      score, maxScore, correctCount, wrongCount, unansweredCount,
      totalQuestions: questions.length,
      timeSpent: timeSpent || 0,
      results: resultsArr,
      leaderboard,
    })
  } catch (err) {
    console.error('Submit error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/exams/:id/leaderboard
router.get('/exams/:id/leaderboard', async (req, res) => {
  try {
    const testId = parseInt(req.params.id)
    const { data: lbData } = await db.supabase
      .from('test_results')
      .select('user_id, score, correct_count, total_questions, time_spent, completed_at')
      .eq('test_id', testId)
      .order('score', { ascending: false })
      .order('time_spent', { ascending: true })
      .limit(50)

    const userBest = {}
    for (const r of (lbData || [])) {
      if (!userBest[r.user_id] || r.score > userBest[r.user_id].score ||
          (r.score === userBest[r.user_id].score && r.time_spent < userBest[r.user_id].time_spent)) {
        userBest[r.user_id] = r
      }
    }

    const sortedEntries = Object.values(userBest)
      .sort((a, b) => b.score - a.score || a.time_spent - b.time_spent)
      .slice(0, 20)

    const userIds = sortedEntries.map(e => e.user_id).filter(Boolean)
    let userMap = {}
    if (userIds.length > 0) {
      const { data: users } = await db.supabase
        .from('users').select('id, name')
        .in('id', userIds)
      for (const u of (users || [])) userMap[u.id] = u.name
    }

    const userId = req.user?.id || null
    res.json(sortedEntries.map((e, i) => ({
      rank: i + 1,
      name: userMap[e.user_id] || 'Ẩn danh',
      score: e.score,
      correctCount: e.correct_count,
      totalQuestions: e.total_questions,
      timeSpent: e.time_spent,
      isMe: e.user_id === userId,
    })))
  } catch (err) {
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
      const table = section.product_type === 'combo' ? 'combos'
                  : section.product_type === 'book' ? 'books'
                  : 'courses'

      let q = db.supabase.from(table).select('*').eq('status', 'active').order('sort_order')

      // Build category filter: match named category AND/OR section_<id> key
      const sectionKey = `section_${section.id}`
      if (section.category && section.category.trim()) {
        // Section has a named category — match products with that exact category OR section_<id>
        q = q.or(`category.eq.${section.category},category.eq.${sectionKey}`)
      } else {
        // Section has no named category — only match products explicitly assigned via section_<id>
        q = q.eq('category', sectionKey)
      }

      const { data } = await q

      return { ...section, items: data || [] }
    }))

    // Filter out empty sections
    res.json(result.filter(s => s.items.length > 0))
  } catch (err) {
    console.error('Homepage sections error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// LEARNING: My Courses, Lessons, Progress
// ============================================
import { authenticateToken } from '../middleware/auth.js'

// GET /api/my-courses — list user's purchased courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('user_courses').select('course_id, activated_at')
      .eq('user_id', req.user.id)
    if (error) throw error
    if (!data?.length) return res.json([])

    const courseIds = data.map(uc => uc.course_id)
    const { data: courses } = await db.supabase
      .from('courses').select('id, slug, name, image, type')
      .in('id', courseIds)
      .eq('status', 'active')

    // Get lesson counts per course
    const { data: lessonCounts } = await db.supabase
      .from('lessons').select('course_id')
      .in('course_id', courseIds)
      .eq('status', 'active')

    // Get progress counts
    const { data: progressData } = await db.supabase
      .from('lesson_progress').select('lesson_id')
      .eq('user_id', req.user.id)
      .eq('completed', true)

    const progressLessonIds = new Set((progressData || []).map(p => p.lesson_id))

    res.json((courses || []).map(c => {
      const totalLessons = (lessonCounts || []).filter(l => l.course_id === c.id).length
      return { ...c, totalLessons, activatedAt: data.find(uc => uc.course_id === c.id)?.activated_at }
    }))
  } catch (err) {
    console.error('My courses error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/my-books — list user's purchased books with download links
router.get('/my-books', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await db.supabase
      .from('user_books').select('book_id, activated_at')
      .eq('user_id', req.user.id)
    if (error) throw error
    if (!data?.length) return res.json([])

    const bookIds = data.map(ub => ub.book_id)
    const { data: books } = await db.supabase
      .from('books').select('id, name, image, pdf_url, description')
      .in('id', bookIds)

    res.json((books || []).map(b => ({
      ...b,
      activatedAt: data.find(ub => ub.book_id === b.id)?.activated_at,
    })))
  } catch (err) {
    console.error('My books error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/books/:id/link — get download link for purchased book
router.get('/books/:id/link', authenticateToken, async (req, res) => {
  try {
    // Check ownership
    const { data: ownership } = await db.supabase
      .from('user_books').select('id')
      .eq('user_id', req.user.id)
      .eq('book_id', req.params.id)
      .maybeSingle()

    if (!ownership) {
      return res.status(403).json({ error: 'Bạn chưa mua sách này' })
    }

    const book = await db.selectOne('books', { id: req.params.id })
    if (!book) return res.status(404).json({ error: 'Không tìm thấy sách' })

    res.json({ pdf_url: book.pdf_url || '', name: book.name })
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/learn/:slug — get course + lessons for learning (requires enrollment)
router.get('/learn/:slug', authenticateToken, async (req, res) => {
  try {
    const course = await db.selectOne('courses', { slug: req.params.slug, status: 'active' })
    if (!course) return res.status(404).json({ error: 'Không tìm thấy khóa học' })

    // Check enrollment
    const { data: enrollment } = await db.supabase
      .from('user_courses').select('id')
      .eq('user_id', req.user.id)
      .eq('course_id', course.id)
      .maybeSingle()

    if (!enrollment) {
      return res.status(403).json({ error: 'Bạn chưa mua khóa học này', enrolled: false })
    }

    // Get lessons (active only, hide video_url for security — only send via lesson detail)
    const { data: lessons } = await db.supabase
      .from('lessons').select('id, title, description, sort_order, is_preview, status, duration')
      .eq('course_id', course.id)
      .eq('status', 'active')
      .order('sort_order')

    // Get user progress
    const lessonIds = (lessons || []).map(l => l.id)
    let progress = []
    if (lessonIds.length > 0) {
      const { data: prog } = await db.supabase
        .from('lesson_progress').select('lesson_id, completed, last_position')
        .eq('user_id', req.user.id)
        .in('lesson_id', lessonIds)
      progress = prog || []
    }

    res.json({
      course: { id: course.id, slug: course.slug, name: course.name, image: course.image },
      lessons: (lessons || []).map(l => ({
        ...l,
        completed: progress.find(p => p.lesson_id === l.id)?.completed || false,
        lastPosition: progress.find(p => p.lesson_id === l.id)?.last_position || 0,
      })),
    })
  } catch (err) {
    console.error('Learn error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// GET /api/lessons/:id — get single lesson content + video (requires enrollment)
router.get('/lessons/:id', authenticateToken, async (req, res) => {
  try {
    const { data: lesson, error } = await db.supabase
      .from('lessons').select('*')
      .eq('id', parseInt(req.params.id))
      .eq('status', 'active')
      .maybeSingle()
    if (error) throw error
    if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học' })

    // Check enrollment
    const { data: enrollment } = await db.supabase
      .from('user_courses').select('id')
      .eq('user_id', req.user.id)
      .eq('course_id', lesson.course_id)
      .maybeSingle()

    if (!enrollment) {
      return res.status(403).json({ error: 'Bạn chưa mua khóa học này' })
    }

    res.json(lesson)
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// POST /api/lessons/:id/progress — update progress
router.post('/lessons/:id/progress', authenticateToken, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id)
    const { completed, lastPosition } = req.body

    await db.upsert('lesson_progress', {
      user_id: req.user.id,
      lesson_id: lessonId,
      completed: completed || false,
      completed_at: completed ? new Date().toISOString() : null,
      last_position: lastPosition || 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, lesson_id' })

    res.json({ success: true })
  } catch (err) {
    console.error('Progress error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

export default router
