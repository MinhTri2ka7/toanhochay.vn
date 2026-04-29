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

// In-flight request dedup — prevents multiple concurrent fetches for the same endpoint
const inflight = new Map()

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

// Cached GET — returns cache instantly, deduplicates in-flight requests
async function cachedFetch(endpoint) {
  // 1. Return from cache instantly (synchronous path)
  const cached = getCached(endpoint)
  if (cached) return cached

  // 2. Deduplicate: if this endpoint is already being fetched, reuse the promise
  if (inflight.has(endpoint)) {
    return inflight.get(endpoint)
  }

  // 3. Start fetch and track the promise
  const promise = apiFetch(endpoint)
    .then(data => {
      setCache(endpoint, data)
      inflight.delete(endpoint)
      return data
    })
    .catch(err => {
      inflight.delete(endpoint)
      throw err
    })

  inflight.set(endpoint, promise)
  return promise
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
// PREFETCH — fire & forget to warm cache
// ============================================
export function prefetchPublicData() {
  // Warm cache for all commonly-visited pages
  fetchCourses().catch(() => {})
  fetchCombos().catch(() => {})
  fetchBooks().catch(() => {})
  fetchExams().catch(() => {})
  fetchDocuments().catch(() => {})
  fetchHomepageSections().catch(() => {})
  fetchSettings().catch(() => {})
  fetchFeedbacks('honor').catch(() => {})
  fetchFeedbacks('feedback').catch(() => {})
}

// ============================================
// USER PURCHASES (requires auth)
// ============================================

/**
 * Fetch user's purchased course IDs and book IDs
 * Returns { courseIds: string[], bookIds: string[] }
 */
export async function fetchMyPurchases() {
  const [courses, books] = await Promise.all([
    apiFetch('/my-courses').catch(() => []),
    apiFetch('/my-books').catch(() => []),
  ])
  return {
    courseIds: (courses || []).map(c => c.id),
    bookIds: (books || []).map(b => b.id),
  }
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
