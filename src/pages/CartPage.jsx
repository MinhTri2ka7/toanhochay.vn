import { ShoppingCart, ArrowRight, Trash2, Plus, Minus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import ScrollReveal from '../components/ScrollReveal'
import { formatPrice } from '../lib/api'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, totalItems } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleCheckout() {
    if (!user) {
      navigate('/login?redirect=/checkout')
    } else {
      navigate('/checkout')
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="flex bg-white p-4 rounded-2xl shadow-card items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center mr-3">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <p className="font-semibold text-brand-900" style={{ fontFamily: 'var(--font-heading)' }}>Giỏ hàng</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="bg-white rounded-3xl shadow-card p-12 lg:p-16 text-center max-w-lg mx-auto">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-brand-100 flex items-center justify-center">
                <ShoppingCart size={36} className="text-brand-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-brand-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Giỏ hàng trống</h2>
            <p className="text-gray-400 mb-8 text-sm">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to="/khoa-hoc"
                  className="inline-flex items-center h-12 px-8 rounded-2xl font-semibold bg-brand-600 text-white
                             shadow-md transition-all gap-2">
              Khám phá khóa học <ArrowRight size={18} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      <ScrollReveal>
        <div className="flex bg-white p-4 rounded-2xl shadow-card items-center mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center mr-3">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <p className="font-semibold text-brand-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Giỏ hàng ({totalItems})
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => (
            <ScrollReveal key={`${item.product_type}-${item.product_id}`} delay={i * 60}>
              <div className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-2">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-1 capitalize">{item.product_type}</p>
                  <p className="text-sm font-bold text-red-600 mt-1">{formatPrice(item.price)}đ</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => updateQuantity(item.product_id, item.product_type, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, item.product_type, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center transition-colors">
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => removeItem(item.product_id, item.product_type)}
                        className="w-8 h-8 rounded-lg text-red-400 flex items-center justify-center transition-all shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Summary */}
        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl shadow-card p-6 self-start sticky top-20">
            <h3 className="font-bold text-brand-900 mb-4">Tóm tắt đơn hàng</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Số sản phẩm</span>
                <span className="font-medium">{totalItems}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-xl font-bold text-red-600">{formatPrice(totalAmount)}đ</span>
              </div>
            </div>
            <button onClick={handleCheckout}
                    className="w-full h-12 rounded-xl font-semibold bg-brand-600 text-white
                               shadow-md transition-all flex items-center justify-center gap-2">
              Thanh toán <ArrowRight size={18} />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
