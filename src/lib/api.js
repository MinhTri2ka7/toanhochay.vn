/**
 * API helper for frontend → backend communication
 * All API calls go through this module for consistency
 * Includes in-memory cache to avoid redundant fetches on tab switching
 */

const API_BASE = '/api'

// ============================================
// IN-MEMORY CACHE — prevents re-fetching on navigation
// ============================================
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() })
}

// Invalidate cache for a specific prefix (e.g. after admin edits)
export function invalidateCache(prefix = '') {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// ============================================
// CORE FETCH
// ============================================
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API Error ${res.status}`)
  }
  return res.json()
}

// Cached GET — returns cache instantly, skips network if fresh
async function cachedFetch(endpoint) {
  const cached = getCached(endpoint)
  if (cached) return cached
  const data = await apiFetch(endpoint)
  setCache(endpoint, data)
  return data
}

// ============================================
// PUBLIC APIs (cached)
// ============================================

export async function fetchCourses() {
  return cachedFetch('/courses')
}

export async function fetchCombos() {
  return cachedFetch('/combos')
}

export async function fetchBooks() {
  return cachedFetch('/books')
}

export async function fetchExams() {
  return cachedFetch('/exams')
}

export async function fetchExam(id) {
  return cachedFetch(`/exams/${id}`)
}

export async function fetchDocuments() {
  return cachedFetch('/documents')
}

export async function fetchFeedbacks(type = 'feedback') {
  return cachedFetch(`/feedbacks?type=${type}`)
}

export async function fetchSettings() {
  return cachedFetch('/settings')
}

export async function fetchHomepageSections() {
  return cachedFetch('/homepage-sections')
}

// ============================================
// EXAM APIs (not cached — mutations)
// ============================================

export async function verifyExamPasscode(id, passcode) {
  return apiFetch(`/exams/${id}/verify-passcode`, {
    method: 'POST',
    body: JSON.stringify({ passcode }),
  })
}

export async function submitExam(id, answers, timeSpent) {
  return apiFetch(`/exams/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers, timeSpent }),
  })
}

// ============================================
// DOCUMENT APIs
// ============================================

export async function trackDocumentDownload(id) {
  return apiFetch(`/documents/${id}/download`, { method: 'POST' })
}

// ============================================
// UTILITIES
// ============================================

export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

export default apiFetch
