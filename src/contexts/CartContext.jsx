import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const CART_KEY = 'toanhochay_cart'

function getLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch { return [] }
}

function saveLocalCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState(getLocalCart)
  const [syncing, setSyncing] = useState(false)

  // Sync cart when user logs in
  useEffect(() => {
    if (user && items.length > 0) {
      syncCartToServer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Save to localStorage whenever items change
  useEffect(() => {
    saveLocalCart(items)
  }, [items])

  async function syncCartToServer() {
    if (!user || items.length === 0) return
    try {
      setSyncing(true)
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      })
    } catch (err) {
      console.error('Cart sync error:', err)
    } finally {
      setSyncing(false)
    }
  }

  const addItem = useCallback((product, productType = 'course') => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id && i.product_type === productType)
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id && i.product_type === productType
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, {
        product_id: product.id,
        product_type: productType,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      }]
    })
  }, [])

  const removeItem = useCallback((productId, productType) => {
    setItems(prev => prev.filter(i => !(i.product_id === productId && i.product_type === productType)))
    if (user) {
      fetch(`/api/cart/${productType}/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      }).catch(() => {})
    }
  }, [user])

  const updateQuantity = useCallback((productId, productType, quantity) => {
    if (quantity <= 0) return removeItem(productId, productType)
    setItems(prev => prev.map(i =>
      i.product_id === productId && i.product_type === productType
        ? { ...i, quantity }
        : i
    ))
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    if (user) {
      fetch('/api/cart', { method: 'DELETE', credentials: 'include' }).catch(() => {})
    }
  }, [user])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = items.reduce((sum, i) => sum + (i.price * i.quantity), 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalAmount, syncing,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
