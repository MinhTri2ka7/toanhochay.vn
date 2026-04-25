import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import {
  authenticateToken, generateToken, setTokenCookie,
  loginLimiter, registerLimiter, sanitizeInput, logSecurity
} from '../middleware/auth.js'

const router = Router()

// ============================================
// POST /api/register
// ============================================
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Mật khẩu xác nhận không khớp' })
    }

    // Check existing email
    const existing = await db.selectOne('users', { email: sanitizeInput(email.toLowerCase()) }, 'id')
    if (existing) {
      return res.status(400).json({ error: 'Email đã được sử dụng' })
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 12)

    // Insert user
    const newUser = await db.insert('users', {
      name: sanitizeInput(name),
      email: sanitizeInput(email.toLowerCase()),
      phone: sanitizeInput(phone || ''),
      password: hashedPassword,
    })

    // Generate token and auto-login
    const token = generateToken(newUser.id)
    setTokenCookie(res, token)

    await logSecurity(newUser.id, 'register', req.ip)

    res.status(201).json({
      message: 'Đăng ký thành công',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role },
      token,
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// POST /api/login
// ============================================
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' })
    }

    const user = await db.selectOne('users', { email: sanitizeInput(email.toLowerCase()) })

    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    // Check locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000)
      return res.status(429).json({ error: `Tài khoản tạm khóa. Thử lại sau ${minutesLeft} phút` })
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' })
    }

    // Check password
    const validPassword = bcrypt.compareSync(password, user.password)

    if (!validPassword) {
      // Increment login attempts
      const attempts = (user.login_attempts || 0) + 1
      if (attempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString()
        await db.update('users', { login_attempts: attempts, locked_until: lockUntil }, { id: user.id })
        await logSecurity(user.id, 'login_locked', req.ip, `${attempts} failed attempts`)
        return res.status(429).json({ error: 'Sai mật khẩu 5 lần. Tài khoản tạm khóa 15 phút' })
      }
      await db.update('users', { login_attempts: attempts }, { id: user.id })
      await logSecurity(user.id, 'login_failed', req.ip)
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }

    // Reset login attempts
    await db.update('users', { login_attempts: 0, locked_until: null }, { id: user.id })

    // Generate token
    const token = generateToken(user.id)
    setTokenCookie(res, token)

    await logSecurity(user.id, 'login_success', req.ip)

    res.json({
      message: 'Đăng nhập thành công',
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
      token,
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Lỗi server' })
  }
})

// ============================================
// POST /api/logout
// ============================================
router.post('/logout', (req, res) => {
  res.clearCookie('token', { path: '/' })
  res.json({ message: 'Đã đăng xuất' })
})

// ============================================
// GET /api/me
// ============================================
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

export default router
