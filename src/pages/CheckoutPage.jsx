import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Loader2, CheckCircle, CreditCard, LogIn, UserPlus, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'
import { usePurchases } from '../contexts/PurchaseContext'
import ScrollReveal from '../components/ScrollReveal'
import { formatPrice } from '../lib/api'

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth()
  const settings = useSettings()
  const { refresh: refreshPurchases } = usePurchases()
  const navigate = useNavigate()
  const location = useLocation()

  // Direct buy item: from route state (navigate) or sessionStorage (after login)
  const [directItem, setDirectItem] = useState(() => {
    if (location.state?.directItem) return location.state.directItem
    try {
      const stored = sessionStorage.getItem('direct_buy')
      if (stored) {
        sessionStorage.removeItem('direct_buy')
        return JSON.parse(stored)
      }
    } catch {}
    return null
  })

  // The items to checkout = directItem array (single item purchase)
  const items = directItem ? [directItem] : []
  const totalAmount = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0)

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    note: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [orderPaid, setOrderPaid] = useState(false)

  // Pre-fill form when user data becomes available
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

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
            refreshPurchases()
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
    if (loading) return
    if (items.length === 0) return setError('Không có sản phẩm để thanh toán')
    if (!form.name || !form.phone) return setError('Vui lòng nhập họ tên và số điện thoại')
    const phoneClean = form.phone.replace(/\s/g, '')
    if (!/^0\d{9,10}$/.test(phoneClean)) {
      return setError('Số điện thoại không hợp lệ (bắt đầu bằng 0, 10-11 chữ số)')
    }

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
            quantity: i.quantity || 1,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrder(data.order)
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
                    <p><span className="text-gray-500">Ngân hàng:</span> <strong>{settings.bank_name || 'MB Bank'}</strong></p>
                    <p><span className="text-gray-500">Số TK:</span> <strong>{settings.bank_account || settings.phone || '0984511618'}</strong></p>
                    <p><span className="text-gray-500">Chủ TK:</span> <strong>{settings.bank_holder || settings.bank_owner || 'Thầy Nam'}</strong></p>
                    <p><span className="text-gray-500">Số tiền:</span> <strong className="text-red-600">{formatPrice(order.totalAmount)}đ</strong></p>
                    <p><span className="text-gray-500">Nội dung CK:</span> <strong className="text-brand-700">{order.paymentCode}</strong></p>
                  </div>
                </div>

                {/* SePay QR Code */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Quét mã QR để thanh toán</p>
                  <img
                    src={`https://qr.sepay.vn/img?acc=${settings.bank_account || settings.phone || '0984511618'}&bank=${(settings.bank_name || 'MBBank').replace(/\s/g, '')}&amount=${order.totalAmount}&des=${order.paymentCode}`}
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
              Vui lòng đăng nhập hoặc tạo tài khoản để tiếp tục đặt hàng.
            </p>

            {/* Item preview */}
            {directItem && (
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left flex items-center gap-3">
                {directItem.image && <img src={directItem.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{directItem.name}</p>
                  <p className="text-sm font-bold text-brand-700 mt-0.5">{formatPrice(directItem.price)}đ</p>
                </div>
              </div>
            )}

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

  // No item to checkout
  if (items.length === 0) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-section p-8 text-center">
            <p className="text-gray-500 mb-4">Không có sản phẩm để thanh toán.</p>
            <Link to="/khoa-hoc" className="text-brand-600 font-semibold hover:underline">← Xem khóa học</Link>
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
              <h3 className="font-bold text-brand-900">Thông tin người mua</h3>

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

              <button type="submit" disabled={loading}
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
                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{item.product_type === 'course' ? 'Khóa học' : item.product_type === 'book' ? 'Sách' : item.product_type}</p>
                    </div>
                    <p className="text-sm font-bold text-brand-700 shrink-0">{formatPrice(item.price)}đ</p>
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
