import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePurchases } from '../contexts/PurchaseContext'
import { ImageOff, ShoppingBag, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

export default function CourseCard({ item, type = 'course' }) {
  const [imgError, setImgError] = useState(false)
  const { ownedCourseIds, ownedBookIds } = usePurchases()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Check if user owns this item
  const isOwned = type === 'book'
    ? ownedBookIds.has(item.id)
    : ownedCourseIds.has(item.id) // course + combo both stored in user_courses

  // Link to course detail page using slug
  const href = type === 'book'
    ? (isOwned ? '/sach-cua-toi' : '/sach')
    : (isOwned ? `/hoc/${item.slug || item.id}` : `/khoa-hoc/${item.slug || item.id}`)

  const hasDiscount = item.old_price || item.oldPrice
  const oldPrice = item.old_price || item.oldPrice
  const discountPercent = hasDiscount
    ? Math.round(((oldPrice - item.price) / oldPrice) * 100)
    : 0

  function handleBuyNow(e) {
    e.preventDefault()
    e.stopPropagation()
    if (isOwned) return

    // Books: go to guest buy page (no login required)
    if (type === 'book') {
      navigate(`/sach/${item.id}/mua`)
      return
    }

    // Courses: navigate to checkout (requires login)
    const directItem = {
      product_id: item.id,
      product_type: type,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    }
    if (!user) {
      // Save to session then go login
      sessionStorage.setItem('direct_buy', JSON.stringify(directItem))
      navigate('/login?redirect=/checkout')
    } else {
      navigate('/checkout', { state: { directItem } })
    }
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

        {/* Discount badge — only when NOT owned */}
        {!isOwned && discountPercent > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white
                          text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
            -{discountPercent}%
          </div>
        )}

        {/* Owned badge */}
        {isOwned && (
          <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-white
                          text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm
                          flex items-center gap-1">
            <CheckCircle size={10} /> Đã mua
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1.5 p-3 lg:p-4">
        <h3 className="font-semibold text-xs lg:text-sm line-clamp-2 leading-snug min-h-[2.5em]
                       text-brand-900 group-hover:text-brand-700 transition-colors">
          {item.name}
        </h3>
        {/* Price row + Buy button */}
        <div className="flex items-center justify-between gap-2 mt-auto">
          {isOwned ? (
            /* Owned — show "Đã mua" label */
            <span className="inline-flex items-center gap-1 font-bold text-sm text-emerald-600">
              <CheckCircle size={14} /> Đã mua
            </span>
          ) : (
            /* Not owned — show price */
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
          )}
          {/* Buy Now button — hidden when owned */}
          {!isOwned && (
            <button
              onClick={handleBuyNow}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                          transition-all duration-200 shadow-sm
                          bg-brand-100 text-brand-700 hover:bg-brand-500 hover:text-white active:scale-95"
              title="Mua ngay"
            >
              <ShoppingBag size={14} />
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}
