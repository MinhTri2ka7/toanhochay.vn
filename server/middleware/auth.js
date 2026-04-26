import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import db from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('⚠️ JWT_SECRET not set — using fallback for dev only')
}
const SECRET = JWT_SECRET || 'dev-only-fallback-' + Date.now()
const JWT_EXPIRES = '7d'

// ============================================
// JWT Auth Middleware
// ============================================
export async function authenticateToken(req, res, next) {
  // Check cookie first, then Authorization header
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Chưa đăng nhập' })
  }

  try {
    const decoded = jwt.verify(token, SECRET)
    const user = await db.selectOne('users', { id: decoded.userId }, 'id, name, email, phone, role, status')

    if (!user) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại' })
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' })
    }

    req.user = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token không hợp lệ' })
  }
}

// Optional auth - doesn't fail if no token
export async function optionalAuth(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, SECRET)
    const user = await db.selectOne('users', { id: decoded.userId }, 'id, name, email, phone, role, status')
    if (user && user.status === 'active') req.user = user
  } catch (err) {
    // Token invalid, continue as guest
  }
  next()
}

// Admin only middleware
export function requireAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'staff')) {
    return res.status(403).json({ error: 'Không có quyền truy cập' })
  }
  next()
}

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, SECRET, { expiresIn: JWT_EXPIRES })
}

// Set cookie
export function setTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  })
}

// ============================================
// Rate Limiting
// ============================================
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Quá nhiều lần đăng ký, vui lòng thử lại sau 1 giờ' },
})

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Quá nhiều request, vui lòng thử lại sau' },
})

// ============================================
// Input Sanitization
// ============================================
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str
  return str.trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// Security log
export async function logSecurity(userId, action, ip, details = '') {
  try {
    await db.insert('security_logs', { user_id: userId, action, ip, details })
  } catch (err) {
    console.error('Security log error:', err.message)
  }
}
