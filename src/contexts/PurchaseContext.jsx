import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { fetchMyPurchases } from '../lib/api'

const PurchaseContext = createContext({ ownedCourseIds: new Set(), ownedBookIds: new Set(), refresh: () => {} })

export function PurchaseProvider({ children }) {
  const { user } = useAuth()
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set())
  const [ownedBookIds, setOwnedBookIds] = useState(new Set())

  const refresh = useCallback(async () => {
    if (!user) {
      setOwnedCourseIds(new Set())
      setOwnedBookIds(new Set())
      return
    }
    try {
      const { courseIds, bookIds } = await fetchMyPurchases()
      setOwnedCourseIds(new Set(courseIds))
      setOwnedBookIds(new Set(bookIds))
    } catch {
      // silently fail
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <PurchaseContext.Provider value={{ ownedCourseIds, ownedBookIds, refresh }}>
      {children}
    </PurchaseContext.Provider>
  )
}

export function usePurchases() {
  return useContext(PurchaseContext)
}
