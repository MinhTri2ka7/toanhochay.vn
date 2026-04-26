import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { ImageOff, ShoppingCart, Check } from 'lucide-react'

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

export default function CourseCard({ item, type = 'course' }) {
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  // Link to listing page (no detail pages yet)
  const href = type === 'book' ? '/sach' : '/khoa-hoc'

  const hasDiscount = item.old_price || item.oldPrice
  const oldPrice = item.old_price || item.oldPrice
  const discountPercent = hasDiscount
    ? Math.round(((oldPrice - item.price) / oldPrice) * 100)
    : 0

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    addItem(item, type)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={href}
          className="group flex flex-col bg-white rounded-2xl
                     shadow-card hover:shadow-card-hover
                     transition-all duration-400 overflow-hidden h-full
                     hover:-translate-y-1">

      {/* Image — square 1:1 */}
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        {!imgError && item.image ? (
          <img
            alt={item.name}
            src={item.image}
            onError={() => setImgError(true)}
            className={`w-full h-full transition-transform duration-500 group-hover:scale-105
                       ${type === 'book' ? 'object-contain p-4 bg-white' : 'object-cover'}`}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-brand-100
                          flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center
                            shadow-sm">
              <ImageOff size={24} className="text-brand-500" />
            </div>
            <span className="text-xs text-brand-700 font-medium text-center line-clamp-2">
              {item.name}
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white
                          text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1.5 p-3 lg:p-4">
        <h3 className="font-semibold text-xs lg:text-sm line-clamp-2 leading-snug min-h-[2.5em]
                       text-brand-900 group-hover:text-brand-700 transition-colors">
          {item.name}
        </h3>
        {/* Price row + Cart button */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-extrabold text-sm lg:text-base text-brand-700">
              {formatPrice(item.price)}đ
            </span>
            {hasDiscount && (
              <span className="text-gray-400 text-[11px] lg:text-xs line-through font-medium">
                {formatPrice(oldPrice)}đ
              </span>
            )}
          </div>
          {/* Cart button — always visible */}
          <button
            onClick={handleAddToCart}
            className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                        transition-all duration-200 shadow-sm
                        ${added
                          ? 'bg-green-500 text-white scale-110'
                          : 'bg-brand-100 text-brand-700 hover:bg-brand-500 hover:text-white active:scale-95'}`}
            title="Thêm vào giỏ hàng"
          >
            {added ? <Check size={14} strokeWidth={3} /> : <ShoppingCart size={14} />}
          </button>
        </div>
      </div>
    </Link>
  )
}
