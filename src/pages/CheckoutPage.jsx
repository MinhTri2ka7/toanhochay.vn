import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle, CreditCard, LogIn, UserPlus, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import ScrollReveal from '../components/ScrollReveal'
import { formatPrice } from '../lib/api'

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const { items, totalAmount, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    note: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [orderPaid, setOrderPaid] = useState(false)

  // Poll order status every 10 seconds after order created
  useEffect(() => {
    if (!order || orderPaid) return
    const interval = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${order.orderId}/status`, { credentials: 'include' })
        if (r.ok) {
          const data = await r.json()
          if (data.status === 'paid') {
            setOrderPaid(true)
            clearInterval(interval)
          }
        }
      } catch (e) { /* ignore */ }
    }, 10000)
    return () => clearInterval(interval)
  }, [order, orderPaid])

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (items.length === 0) return setError('Giỏ hàng trống')
    if (!form.name || !form.phone) return setError('Vui lòng nhập họ tên và số điện thoại')

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          items: items.map(i => ({
            product_type: i.product_type,
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrder(data.order)
      clearCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Order success view
  if (order) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-section p-8 lg:p-12 text-center">
            {orderPaid ? (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-emerald-700 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Thanh toán thành công! 🎉
                </h1>
                <p className="text-gray-500 mb-6">Đơn hàng đã được xác nhận. Khóa học sẽ được mở cho bạn ngay.</p>
                <button onClick={() => navigate('/')}
                        className="w-full h-12 rounded-xl font-semibold bg-emerald-600 text-white shadow-md transition-all">
                  Về trang chủ
                </button>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-brand-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  Đặt hàng thành công!
                </h1>
                <p className="text-gray-500 mb-6">Mã đơn hàng: <strong>{order.paymentCode}</strong></p>

                <div className="bg-brand-50 rounded-2xl p-6 mb-6 text-left">
                  <h3 className="font-bold text-brand-900 mb-3">Thông tin chuyển khoản</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Ngân hàng:</span> <strong>MB Bank</strong></p>
                    <p><span className="text-gray-500">Số TK:</span> <strong>0869998668</strong></p>
                    <p><span className="text-gray-500">Chủ TK:</span> <strong>HO THUC THUAN</strong></p>
                    <p><span className="text-gray-500">Số tiền:</span> <strong className="text-red-600">{formatPrice(order.totalAmount)}đ</strong></p>
                    <p><span className="text-gray-500">Nội dung CK:</span> <strong className="text-brand-700">{order.paymentCode}</strong></p>
                  </div>
                </div>

                {/* SePay QR Code */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Quét mã QR để thanh toán</p>
                  <img
                    src={`https://qr.sepay.vn/img?acc=0869998668&bank=MBBank&amount=${order.totalAmount}&des=${order.paymentCode}`}
                    alt="QR thanh toán"
                    className="w-48 h-48 mx-auto rounded-xl border-2 border-gray-200"
                  />
                  <p className="text-xs text-gray-400 mt-2">Quý khách vui lòng giữ nguyên nội dung chuyển khoản</p>
                </div>

                <p className="text-xs text-gray-400 mb-4 animate-pulse">⏳ Đang chờ thanh toán... (tự động kiểm tra mỗi 10 giây)</p>

                <button
                  onClick={() => navigate('/')}
                  className="w-full h-12 rounded-xl font-semibold bg-brand-600 text-white shadow-md transition-all"
                >
                  Về trang chủ
                </button>
              </>
            )}
          </div>
        </ScrollReveal>
      </div>
    )
  }
  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Auth gate — require login before checkout
  if (!user) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-section p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={36} className="text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-brand-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Đăng nhập để thanh toán
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              Vui lòng đăng nhập hoặc tạo tài khoản để tiếp tục đặt hàng. Giỏ hàng của bạn sẽ được giữ nguyên.
            </p>

            {/* Cart preview */}
            {items.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
                <p className="text-xs font-semibold text-gray-500 mb-2">Giỏ hàng của bạn ({items.length} sản phẩm)</p>
                <div className="space-y-2 mb-3">
                  {items.slice(0, 3).map(item => (
                    <div key={item.product_id} className="flex items-center gap-2">
                      {item.image && <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />}
                      <span className="text-xs text-gray-700 flex-1 line-clamp-1">{item.name}</span>
                      <span className="text-xs font-bold text-brand-700">{formatPrice(item.price)}đ</span>
                    </div>
                  ))}
                  {items.length > 3 && <p className="text-xs text-gray-400">... và {items.length - 3} sản phẩm khác</p>}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-xs font-semibold text-gray-600">Tổng cộng</span>
                  <span className="text-sm font-bold text-red-600">{formatPrice(totalAmount)}đ</span>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="text-left mb-6 space-y-2">
              {[
                'Theo dõi đơn hàng & lịch sử mua',
                'Tự động mở khóa khóa học sau thanh toán',
                'Nhận thông báo khi có ưu đãi mới',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Link to="/login?redirect=/checkout"
                    className="w-full h-12 rounded-xl font-semibold bg-brand-600 text-white shadow-md transition-all flex items-center justify-center gap-2 hover:bg-brand-700">
                <LogIn size={18} /> Đăng nhập
              </Link>
              <Link to="/register?redirect=/checkout"
                    className="w-full h-12 rounded-xl font-semibold border-2 border-brand-500 text-brand-700 transition-all flex items-center justify-center gap-2 hover:bg-brand-50">
                <UserPlus size={18} /> Tạo tài khoản mới
              </Link>
            </div>

            <button onClick={() => navigate(-1)} className="mt-4 text-xs text-gray-400 hover:text-gray-600">
              ← Quay lại
            </button>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      <ScrollReveal>
        <div className="max-w-2xl mx-auto">
          <div className="flex bg-white p-4 rounded-2xl shadow-card items-center mb-6">
            <CreditCard size={20} className="text-brand-600 mr-3" />
            <p className="font-semibold text-brand-900" style={{ fontFamily: 'var(--font-heading)' }}>
              Thanh toán
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white rounded-2xl shadow-card p-6 space-y-4">
              <h3 className="font-bold text-brand-900">Thông tin nhận hàng</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input type="text" value={form.name} onChange={e => updateField('name', e.target.value)}
                       required placeholder="Nguyễn Văn A"
                       className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)}
                       required placeholder="0xxx xxx xxx"
                       className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                       placeholder="your@email.com"
                       className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-sm outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea value={form.note} onChange={e => updateField('note', e.target.value)}
                          rows={3} placeholder="Ghi chú thêm..."
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 text-sm outline-none transition-all resize-none" />
              </div>

              <button type="submit" disabled={loading || items.length === 0}
                      className="w-full h-12 rounded-xl font-semibold bg-brand-600 text-white
                                 disabled:opacity-50
                                 shadow-md transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><CreditCard size={18} /> Đặt hàng</>}
              </button>
            </form>

            {/* Order summary */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 self-start">
              <h3 className="font-bold text-brand-900 mb-4">Đơn hàng ({items.length})</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.product_id} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-brand-700">{formatPrice(item.price * item.quantity)}đ</p>
                  </div>
                ))}
              </div>
              <hr className="border-gray-100 mb-3" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-xl font-bold text-red-600">{formatPrice(totalAmount)}đ</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
