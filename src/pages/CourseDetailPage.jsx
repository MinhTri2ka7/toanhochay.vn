import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Play, Clock, BookOpen, Lock, ShoppingCart, Check, ChevronLeft, Loader2, Eye, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import ScrollReveal from '../components/ScrollReveal'

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

function formatDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  return `${m} phút`
}

export default function CourseDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useCart()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolled, setEnrolled] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        // Load course info (public)
        const res = await fetch(`/api/courses/${slug}`)
        if (!res.ok) {
          setError('Không tìm thấy khóa học')
          return
        }
        const courseData = await res.json()
        setCourse(courseData)

        // Try to load lessons if user is logged in (check enrollment)
        if (user) {
          try {
            const learnRes = await fetch(`/api/learn/${slug}`, { credentials: 'include' })
            if (learnRes.ok) {
              const learnData = await learnRes.json()
              setLessons(learnData.lessons || [])
              setEnrolled(true)
            } else {
              // Not enrolled - try to get preview lessons count
              setEnrolled(false)
            }
          } catch (e) {
            setEnrolled(false)
          }
        }
      } catch (e) {
        setError('Lỗi kết nối')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug, user])

  function handleAddToCart() {
    if (!course) return
    addItem(course, 'course')
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  )

  if (error || !course) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">{error || 'Không tìm thấy'}</h2>
        <Link to="/khoa-hoc" className="text-brand-600 font-semibold hover:underline">← Quay lại danh sách</Link>
      </div>
    </div>
  )

  const hasDiscount = course.old_price && course.old_price > course.price
  const discountPercent = hasDiscount
    ? Math.round(((course.old_price - course.price) / course.old_price) * 100)
    : 0

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0)
  const completedCount = lessons.filter(l => l.completed).length

  return (
    <div className="mt-6 mb-12 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Breadcrumb */}
      <ScrollReveal>
        <div className="mb-6">
          <Link to="/khoa-hoc" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors">
            <ChevronLeft size={16} /> Quay lại danh sách khóa học
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Course header */}
          <ScrollReveal>
            <div className="bg-white rounded-2xl shadow-card p-6 lg:p-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-brand-900 mb-3"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                {course.name}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {course.type && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase">
                    {course.type}
                  </span>
                )}
                {lessons.length > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <BookOpen size={14} /> {lessons.length} bài học
                  </span>
                )}
                {totalDuration > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={14} /> {formatDuration(totalDuration)}
                  </span>
                )}
              </div>

              {/* Description */}
              {course.description && (
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {course.description}
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* Lessons list */}
          <ScrollReveal delay={100}>
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-brand-900" style={{ fontFamily: 'var(--font-heading)' }}>
                  Nội dung khóa học
                </h2>
                {enrolled && lessons.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500 transition-all"
                           style={{ width: `${lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{completedCount}/{lessons.length}</span>
                  </div>
                )}
              </div>

              {enrolled && lessons.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {lessons.map((l, idx) => (
                    <Link key={l.id}
                          to={`/hoc/${course.slug}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-brand-50/50 transition-colors group">
                      <div className="shrink-0">
                        {l.completed ? (
                          <CheckCircle size={20} className="text-emerald-500" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center
                                          group-hover:bg-brand-500 group-hover:text-white transition-colors">
                            <Play size={14} className="text-brand-600 group-hover:text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          <span className="text-gray-400 mr-1">{idx + 1}.</span> {l.title}
                        </p>
                      </div>
                      {l.duration > 0 && (
                        <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                          <Clock size={12} /> {formatDuration(l.duration)}
                        </span>
                      )}
                      {l.is_preview && (
                        <span className="text-xs text-blue-600 font-semibold shrink-0 flex items-center gap-1">
                          <Eye size={12} /> Xem thử
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : enrolled && lessons.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
                  <p>Khóa học này chưa có bài học nào</p>
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-400">
                  <Lock size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Mua khóa học để xem nội dung chi tiết</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Sidebar — Pricing card */}
        <ScrollReveal direction="right" delay={100}>
          <div className="lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* Course image */}
              {course.image && (
                <div className="aspect-video overflow-hidden bg-brand-50">
                  <img src={course.image} alt={course.name}
                       className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-6">
                {/* Price / Owned status */}
                <div className="mb-4">
                  {enrolled ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-emerald-100 text-emerald-700">
                        <CheckCircle size={16} /> Đã mua
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-brand-700">
                          {formatPrice(course.price)}đ
                        </span>
                        {hasDiscount && (
                          <span className="text-base text-gray-400 line-through font-medium">
                            {formatPrice(course.old_price)}đ
                          </span>
                        )}
                      </div>
                      {discountPercent > 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-600">
                          Giảm {discountPercent}%
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                {enrolled ? (
                  <Link to={`/hoc/${course.slug}`}
                        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold
                                   bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm">
                    <Play size={18} /> Vào học ngay
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <button onClick={handleAddToCart}
                            className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold
                                       transition-all shadow-sm
                                       ${added
                                         ? 'bg-green-500 text-white'
                                         : 'bg-brand-600 text-white hover:bg-brand-700'}`}>
                      {added ? (
                        <><Check size={18} /> Đã thêm vào giỏ</>
                      ) : (
                        <><ShoppingCart size={18} /> Thêm vào giỏ hàng</>
                      )}
                    </button>
                    <Link to="/gio-hang"
                          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold
                                     border-2 border-brand-600 text-brand-700 hover:bg-brand-50 transition-colors">
                      Mua ngay
                    </Link>
                  </div>
                )}

                {/* Course features */}
                <div className="mt-6 pt-4 border-t border-gray-100 space-y-3">
                  {lessons.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen size={16} className="text-brand-500 shrink-0" />
                      <span>{lessons.length} bài học</span>
                    </div>
                  )}
                  {totalDuration > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} className="text-brand-500 shrink-0" />
                      <span>Tổng thời lượng: {formatDuration(totalDuration)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Play size={16} className="text-brand-500 shrink-0" />
                    <span>Học mọi lúc, mọi nơi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
