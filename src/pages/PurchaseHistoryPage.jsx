import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Loader2, Lock, Package, CheckCircle, Clock, XCircle,
  BookOpen, FileText, GraduationCap, ExternalLink, ChevronDown, ChevronUp,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePurchases } from '../contexts/PurchaseContext'
import ScrollReveal from '../components/ScrollReveal'
import { formatPrice } from '../lib/api'

const STATUS_MAP = {
  paid: { label: 'Đã thanh toán', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  pending: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700', icon: Clock },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const TYPE_MAP = {
  course: { label: 'Khóa học', icon: GraduationCap, color: 'text-blue-500 bg-blue-100' },
  combo: { label: 'Combo', icon: Package, color: 'text-purple-500 bg-purple-100' },
  book: { label: 'Sách', icon: BookOpen, color: 'text-amber-500 bg-amber-100' },
  document: { label: 'Tài liệu', icon: FileText, color: 'text-red-500 bg-red-100' },
}

export default function PurchaseHistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const { ownedBookIds, ownedDocumentIds, ownedCourseIds } = usePurchases()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    fetch('/api/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data)
        else setError('Lỗi tải dữ liệu')
      })
      .catch(() => setError('Lỗi kết nối'))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  function handleItemClick(item) {
    const type = item.product_type
    const id = item.product_id

    if (type === 'book') {
      if (ownedBookIds.has(id)) {
        // Fetch book PDF link (authenticated) and open directly
        fetch(`/api/books/${id}/link`, { credentials: 'include' })
          .then(r => r.json())
          .then(data => {
            if (data.pdf_url) {
              window.open(data.pdf_url, '_blank', 'noopener,noreferrer')
            } else {
              navigate('/sach-cua-toi')
            }
          })
          .catch(() => navigate('/sach-cua-toi'))
      } else {
        navigate(`/sach/${id}/mua`)
      }
    } else if (type === 'document') {
      if (ownedDocumentIds.has(String(id))) {
        // Fetch the document file_url and open it (with credentials)
        fetch(`/api/documents/${id}`, { credentials: 'include' })
          .then(r => r.json())
          .then(doc => {
            if (doc.file_url) {
              window.open(doc.file_url, '_blank', 'noopener,noreferrer')
            }
          })
          .catch(() => {})
      } else {
        navigate(`/tai-lieu/${id}/mua`)
      }
    } else if (type === 'course' || type === 'combo') {
      if (ownedCourseIds.has(id)) {
        // Navigate to the course's learn page
        fetch(`/api/courses/${id}`, { credentials: 'include' })
          .then(r => r.json())
          .then(course => {
            if (course.slug) navigate(`/hoc/${course.slug}`)
            else navigate('/khoa-hoc')
          })
          .catch(() => navigate('/khoa-hoc'))
      } else {
        navigate('/khoa-hoc')
      }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Lock size={48} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Yêu cầu đăng nhập</h2>
          <p className="text-gray-400 mb-4">Bạn cần đăng nhập để xem lịch sử mua hàng</p>
          <Link to="/login?redirect=/lich-su-mua-hang" className="px-6 py-2 rounded-lg bg-brand-600 text-white font-semibold">
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 mb-12 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Banner */}
      <ScrollReveal>
        <div className="mb-6">
          <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-card"
               style={{
                 background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 50%, #C7D2FE 100%)',
                 padding: '2.5rem 1.5rem',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 minHeight: '120px',
               }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: 0,
              background: 'linear-gradient(180deg, #4F46E5 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Lịch Sử Mua Hàng</h2>
          </div>
        </div>
      </ScrollReveal>

      {/* Header */}
      <ScrollReveal delay={100}>
        <div className="flex bg-white p-4 rounded-2xl shadow-card items-center mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500
                          flex items-center justify-center mr-3">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <p className="font-semibold text-brand-900"
             style={{ fontFamily: 'var(--font-heading)' }}>
            Đơn hàng của bạn
          </p>
          <div className="flex-1" />
          <span className="text-xs text-gray-400 font-medium">{orders.length} đơn hàng</span>
        </div>
      </ScrollReveal>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <ScrollReveal delay={200}>
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có đơn hàng nào</h3>
            <p className="text-gray-400 mb-6">Bạn chưa mua sản phẩm nào. Hãy khám phá ngay!</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/khoa-hoc" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors text-sm">
                <GraduationCap size={16} /> Khóa học
              </Link>
              <Link to="/sach" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors text-sm">
                <BookOpen size={16} /> Sách
              </Link>
              <Link to="/tai-lieu" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors text-sm">
                <FileText size={16} /> Tài liệu
              </Link>
            </div>
          </div>
        </ScrollReveal>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending
            const StatusIcon = statusInfo.icon
            const isExpanded = expandedId === order.id
            const date = new Date(order.created_at)

            return (
              <ScrollReveal key={order.id} delay={i * 60}>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300 hover:shadow-card-hover">
                  {/* Order header — clickable to expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusInfo.color}`}>
                      <StatusIcon size={18} />
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-brand-900">
                          #{order.payment_code}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span>{date.toLocaleDateString('vi-VN')} {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span>{order.items?.length || 0} sản phẩm</span>
                      </div>
                    </div>

                    {/* Total + chevron */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-bold text-red-600">
                        {formatPrice(order.total_amount)}đ
                      </span>
                      {isExpanded
                        ? <ChevronUp size={18} className="text-gray-400" />
                        : <ChevronDown size={18} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {/* Expanded items */}
                  {isExpanded && order.items && (
                    <div className="border-t border-gray-100 px-5 pb-5">
                      <div className="space-y-3 mt-4">
                        {order.items.map((item, idx) => {
                          const typeInfo = TYPE_MAP[item.product_type] || TYPE_MAP.course
                          const TypeIcon = typeInfo.icon
                          const isOwned = item.product_type === 'book'
                            ? ownedBookIds.has(item.product_id)
                            : item.product_type === 'document'
                            ? ownedDocumentIds.has(String(item.product_id))
                            : item.product_type === 'course' || item.product_type === 'combo'
                            ? ownedCourseIds.has(item.product_id)
                            : false

                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                                ${isOwned && order.status === 'paid'
                                  ? 'bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer'
                                  : 'bg-gray-50'
                                }`}
                              onClick={() => {
                                if (isOwned && order.status === 'paid') handleItemClick(item)
                              }}
                            >
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeInfo.color}`}>
                                <TypeIcon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                  {item.product_name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-medium text-gray-400">{typeInfo.label}</span>
                                  {item.quantity > 1 && (
                                    <span className="text-[10px] text-gray-400">× {item.quantity}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-sm font-bold text-brand-700">
                                  {formatPrice(item.price * (item.quantity || 1))}đ
                                </span>
                                {isOwned && order.status === 'paid' && (
                                  <ExternalLink size={14} className="text-emerald-500" />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Order details */}
                      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 space-y-1">
                        <p>Người mua: <span className="text-gray-600 font-medium">{order.name}</span></p>
                        <p>SĐT: <span className="text-gray-600 font-medium">{order.phone}</span></p>
                        {order.email && <p>Email: <span className="text-gray-600 font-medium">{order.email}</span></p>}
                        {order.note && <p>Ghi chú: <span className="text-gray-600">{order.note}</span></p>}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
