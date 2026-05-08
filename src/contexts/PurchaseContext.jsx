import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { fetchMyPurchases } from '../lib/api'

const PurchaseContext = createContext({ ownedCourseIds: new Set(), ownedBookIds: new Set(), ownedDocumentIds: new Set(), refresh: () => {} })

export function PurchaseProvider({ children }) {
  const { user } = useAuth()
  const [ownedCourseIds, setOwnedCourseIds] = useState(new Set())
  const [ownedBookIds, setOwnedBookIds] = useState(new Set())
  const [ownedDocumentIds, setOwnedDocumentIds] = useState(new Set())

  const refresh = useCallback(async () => {
    if (!user) {
      setOwnedCourseIds(new Set())
      setOwnedBookIds(new Set())
      setOwnedDocumentIds(new Set())
      return
    }
    try {
      const { courseIds, bookIds, documentIds } = await fetchMyPurchases()
      setOwnedCourseIds(new Set(courseIds))
      setOwnedBookIds(new Set(bookIds))
      setOwnedDocumentIds(new Set((documentIds || []).map(String)))
    } catch {
      // silently fail
    }
  }, [user])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <PurchaseContext.Provider value={{ ownedCourseIds, ownedBookIds, ownedDocumentIds, refresh }}>
      {children}
    </PurchaseContext.Provider>
  )
}

export function usePurchases() {
  return useContext(PurchaseContext)
}
