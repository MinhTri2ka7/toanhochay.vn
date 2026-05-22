import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  FileText, Download, CheckCircle, Loader2, CreditCard,
  ArrowLeft, ShieldCheck, LogIn, UserPlus,
} from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useAuth } from '../contexts/AuthContext'
import { usePurchases } from '../contexts/PurchaseContext'
import { useSettings } from '../contexts/SettingsContext'
import { formatPrice } from '../lib/api'

export default function DocumentBuyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const settings = useSettings()
  const { user, loading: authLoading } = useAuth()
  const { ownedDocumentIds, refresh: refreshPurchases } = usePurchases()

  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState(null)
  const [orderStatus, setOrderStatus] = useState('pending')
  const [fileUrl, setFileUrl] = useState(null)

  const pollerRef = useRef(null)

  // Load document info
  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject('not found'))
      .then(data => setDoc(data))
      .catch(() => setDoc(null))
      .finally(() => setLoading(false))
  }, [id])

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

  // If user already owns this document, open the file url directly
  useEffect(() => {
    if (user && doc && ownedDocumentIds.has(String(doc.id))) {
      if (doc.file_url) {
        window.open(doc.file_url, '_blank', 'noopener,noreferrer')
      }
      navigate('/tai-lieu', { replace: true })
    }
  }, [user, doc, ownedDocumentIds, navigate])

  // Poll order status after order is created
  useEffect(() => {
    if (!order || orderStatus === 'paid') return
    pollerRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/orders/${order.orderId}/status`, { credentials: 'include' })
        if (r.ok) {
          const data = await r.json()
          if (data.status === 'paid') {
            setOrderStatus('paid')
            setFileUrl(data.file_url)
            refreshPurchases()
            clearInterval(pollerRef.current)
          }
        }
      } catch {}
    }, 8000)
    return () => clearInterval(pollerRef.current)
  }, [order, orderStatus, refreshPurchases])

  // Auto-redirect: khi thanh toán xong → mở file + về trang tài liệu
  useEffect(() => {
    if (orderStatus === 'paid' && fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
      navigate('/tai-lieu', { replace: true })
    }
  }, [orderStatus, fileUrl, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại')
      return
    }
    const phoneClean = form.phone.replace(/\s/g, '')
    if (!/^0\d{9,10}$/.test(phoneClean)) {
      setError('Số điện thoại không hợp lệ (bắt đầu 0, 10-11 số)')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      // Use authenticated order endpoint
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...form,
          items: [{
            product_type: 'document',
            product_id: id,
            quantity: 1,
          }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrder(data.order)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%] text-center py-24">
        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Tài liệu không tồn tại hoặc đã bị gỡ.</p>
        <Link to="/tai-lieu" className="mt-4 inline-flex items-center gap-1 text-brand-600 text-sm hover:underline">
          <ArrowLeft size={14} /> Quay lại danh sách tài liệu
        </Link>
      </div>
    )
  }

  /* ====== AUTH GATE — require login ====== */
  if (!user) {
    const isPaid = doc.price && doc.price > 0
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-section p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={36} className="text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold text-brand-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Đăng nhập để {isPaid ? 'mua' : 'tải'} tài liệu
            </h1>
            <p className="text-gray-500 mb-6 text-sm">
              Vui lòng đăng nhập hoặc tạo tài khoản để tiếp tục.
            </p>

            {/* Doc preview */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{doc.title}</p>
                <p className="text-sm font-bold text-brand-700 mt-0.5">
                  {isPaid ? `${formatPrice(doc.price)}đ` : 'Miễn phí'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Link to={`/login?redirect=/tai-lieu/${id}/mua`}
                    className="w-full h-12 rounded-xl font-semibold bg-brand-600 text-white shadow-md transition-all flex items-center justify-center gap-2 hover:bg-brand-700">
                <LogIn size={18} /> Đăng nhập
              </Link>
              <Link to={`/register?redirect=/tai-lieu/${id}/mua`}
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

  /* ====== PAID / FREE — show download ====== */
  if (orderStatus === 'paid' && fileUrl) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-section p-8 lg:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-700 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              {order ? 'Thanh toán thành công! 🎉' : 'Tải xuống miễn phí! 🎉'}
            </h1>
            <p className="text-gray-500 mb-8 text-sm">
              {doc.title}
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="w-full h-14 rounded-2xl font-bold text-base bg-emerald-600 text-white
                         flex items-center justify-center gap-3 shadow-lg hover:bg-emerald-700
                         transition-all duration-200 mb-3"
            >
              <Download size={22} />
              Tải xuống tài liệu
            </a>
            <Link
              to="/tai-lieu"
              className="w-full h-12 rounded-2xl font-semibold text-sm border-2 border-brand-200
                         text-brand-700 bg-brand-50 hover:bg-brand-100
                         flex items-center justify-center gap-2 transition-all duration-200 mb-4"
            >
              <ArrowLeft size={16} />
              Về trang Tài liệu
            </Link>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  /* ====== PAYMENT PENDING — show QR ====== */
  if (order) {
    const bankName = (settings.bank_name || 'MBBank').replace(/\s/g, '')
    const bankAccount = settings.bank_account || settings.phone || ''
    const bankHolder = settings.bank_holder || settings.bank_owner || 'Thầy Nam'
    const qrUrl = `https://qr.sepay.vn/img?acc=${bankAccount}&bank=${bankName}&amount=${order.totalAmount}&des=${order.paymentCode}`

    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-section p-8 lg:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
                <CreditCard size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-brand-900" style={{ fontFamily: 'var(--font-heading)' }}>
                  Thanh toán tài liệu
                </h1>
                <p className="text-xs text-gray-400">Chuyển khoản để nhận link tải</p>
              </div>
            </div>

            {/* Doc info */}
            <div className="bg-brand-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-900 line-clamp-1">{doc.title}</p>
                <p className="text-xs text-gray-500">Tài liệu số</p>
              </div>
              <span className="text-base font-bold text-red-600 shrink-0">
                {formatPrice(order.totalAmount)}đ
              </span>
            </div>

            {/* Bank info */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-5 space-y-2 text-sm">
              <h3 className="font-bold text-brand-900 mb-3">Thông tin chuyển khoản</h3>
              <p><span className="text-gray-500">Ngân hàng:</span> <strong>{settings.bank_name || 'MB Bank'}</strong></p>
              <p><span className="text-gray-500">Số TK:</span> <strong>{bankAccount}</strong></p>
              <p><span className="text-gray-500">Chủ TK:</span> <strong>{bankHolder}</strong></p>
              <p><span className="text-gray-500">Số tiền:</span> <strong className="text-red-600">{formatPrice(order.totalAmount)}đ</strong></p>
              <p><span className="text-gray-500">Nội dung CK:</span> <strong className="text-brand-700">{order.paymentCode}</strong></p>
            </div>

            {/* QR */}
            <div className="text-center mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Quét mã QR để thanh toán</p>
              <img
                src={qrUrl}
                alt="QR thanh toán"
                className="w-48 h-48 mx-auto rounded-xl border-2 border-gray-200"
              />
              <p className="text-xs text-gray-400 mt-2">Giữ nguyên nội dung chuyển khoản</p>
            </div>

            <p className="text-xs text-gray-400 animate-pulse text-center mb-4">
              ⏳ Đang chờ xác nhận thanh toán... (tự động kiểm tra mỗi 8 giây)
            </p>

            <Link to="/tai-lieu"
                  className="w-full h-10 rounded-xl text-sm font-medium border border-gray-200
                             text-gray-500 flex items-center justify-center gap-1
                             hover:bg-gray-50 transition-colors">
              <ArrowLeft size={14} /> Quay lại
            </Link>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  /* ====== FORM — fill name & phone (authenticated) ====== */
  const isPaid = doc.price && doc.price > 0

  // Free document — for logged-in user, just open directly
  if (!isPaid) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-lg mx-auto">
            <Link to="/tai-lieu"
                  className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
              <ArrowLeft size={14} /> Quay lại tài liệu
            </Link>
            <div className="bg-white rounded-3xl shadow-section p-7 lg:p-10">
              <div className="flex items-center gap-4 mb-7 pb-5 border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                  <FileText size={26} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base lg:text-lg font-bold text-brand-900 line-clamp-2"
                      style={{ fontFamily: 'var(--font-heading)' }}>
                    {doc.title}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">Miễn phí</span>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-6">Tài liệu này miễn phí, nhấn nút bên dưới để tải ngay.</p>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="w-full h-12 rounded-xl font-bold bg-emerald-600 text-white
                             shadow-md hover:bg-emerald-700
                             flex items-center justify-center gap-2 transition-all"
                >
                  <Download size={18} />
                  Tải xuống miễn phí
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      <ScrollReveal>
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link to="/tai-lieu"
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-5">
            <ArrowLeft size={14} /> Quay lại tài liệu
          </Link>

          <div className="bg-white rounded-3xl shadow-section p-7 lg:p-10">
            {/* Doc preview */}
            <div className="flex items-center gap-4 mb-7 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <FileText size={26} className="text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base lg:text-lg font-bold text-brand-900 line-clamp-2"
                    style={{ fontFamily: 'var(--font-heading)' }}>
                  {doc.title}
                </h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
                  {doc.file_type && (
                    <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-500 font-semibold">{doc.file_type}</span>
                  )}
                  {doc.pages > 0 && <span>{doc.pages} trang</span>}
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-bold">
                    {formatPrice(doc.price)}đ
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-sm font-bold text-brand-900 mb-4">
              Xác nhận thông tin đặt mua
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required placeholder="Nguyễn Văn A"
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200
                             focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                             text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  required placeholder="0xxx xxx xxx"
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200
                             focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                             text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (tuỳ chọn)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full h-11 px-4 rounded-xl border-2 border-gray-200
                             focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                             text-sm outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl font-bold bg-brand-600 text-white
                           shadow-md hover:bg-brand-700 disabled:opacity-50
                           flex items-center justify-center gap-2 transition-all"
              >
                {submitting
                  ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</>
                  : <><CreditCard size={18} /> Đặt mua — {formatPrice(doc.price)}đ</>
                }
              </button>

              <p className="text-xs text-gray-400 text-center">
                Đăng nhập bằng: {user.email} · Lịch sử mua hàng sẽ được lưu lại
              </p>
            </form>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
