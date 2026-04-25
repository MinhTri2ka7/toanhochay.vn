import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (err) {
      // Not logged in
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password, remember = false) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, remember }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setUser(data.user)
    if (remember && data.token) {
      localStorage.setItem('auth_token', data.token)
    }
    return data
  }

  async function register(name, email, phone, password, confirmPassword) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, phone, password, confirmPassword }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setUser(data.user)
    return data
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
