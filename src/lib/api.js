/**
 * API helper for frontend → backend communication
 * All API calls go through this module for consistency
 */

const API_BASE = '/api'

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

// ============================================
// PUBLIC APIs
// ============================================

export async function fetchCourses() {
  return apiFetch('/courses')
}

export async function fetchCombos() {
  return apiFetch('/combos')
}

export async function fetchBooks() {
  return apiFetch('/books')
}

export async function fetchExams() {
  return apiFetch('/exams')
}

export async function fetchExam(id) {
  return apiFetch(`/exams/${id}`)
}

export async function fetchDocuments() {
  return apiFetch('/documents')
}

export async function fetchFeedbacks(type = 'feedback') {
  return apiFetch(`/feedbacks?type=${type}`)
}

export async function fetchSettings() {
  return apiFetch('/settings')
}

export async function fetchHomepageSections() {
  return apiFetch('/homepage-sections')
}

// ============================================
// EXAM APIs
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
