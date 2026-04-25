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

  const href = type === 'combo'
    ? `/combo/${item.id}`
    : type === 'book'
      ? `/sach/${item.id}`
      : `/khoa-hoc/${item.slug || item.id}`

  function handleAddToCart(e) {
    e.preventDefault()
    e.stopPropagation()
    addItem(item, type)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link to={href}
          className="flex flex-col bg-white rounded-2xl lg:rounded-3xl
                     shadow-card
                     transition-all duration-300 overflow-hidden h-full">

      {/* Image — square 1:1 like original site */}
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        {!imgError && item.image ? (
          <img
            alt={item.name}
            src={item.image}
            onError={() => setImgError(true)}
            className={`w-full h-full
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

        {/* Cart button overlay — always visible */}
        <button
          onClick={handleAddToCart}
          className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-xl flex items-center justify-center
                      shadow-lg transition-all duration-200
                      ${added
                        ? 'bg-green-500 text-white scale-110'
                        : 'bg-white/90 backdrop-blur-sm text-brand-700'}`}
          title="Thêm vào giỏ hàng"
        >
          {added ? <Check size={16} strokeWidth={3} /> : <ShoppingCart size={16} />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1.5 p-3 lg:p-4">
        <h3 className="font-semibold text-xs lg:text-sm line-clamp-2 leading-snug min-h-[2.5em]
                       text-brand-900">
          {item.name}
        </h3>
        <div className="flex items-center gap-2 mt-auto">
          <span className="font-extrabold text-sm lg:text-base text-brand-700">
            {formatPrice(item.price)}đ
          </span>
          {(item.old_price || item.oldPrice) ? (
            <span className="text-gray-400 text-[11px] lg:text-xs line-through font-medium">
              {formatPrice(item.old_price || item.oldPrice)}đ
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
