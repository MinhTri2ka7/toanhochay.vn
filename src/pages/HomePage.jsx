import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookCopy, LibraryBig, BookText, ChevronRight, ChevronDown, Sparkles, Loader2, GraduationCap, Users, Trophy, Zap, ArrowRight } from 'lucide-react'
import CourseCard from '../components/CourseCard'
import ImageCarousel from '../components/ImageCarousel'
import ScrollReveal from '../components/ScrollReveal'
import { useSettings } from '../contexts/SettingsContext'
import { fetchHomepageSections, fetchFeedbacks } from '../lib/api'

const sectionIcons = {
  COMBOS: BookCopy,
  COURSES: LibraryBig,
  BOOKS: BookText,
}

/* ========== Trust Stats Marquee ========== */
const trustStats = [
  { icon: GraduationCap, text: '8+ năm kinh nghiệm' },
  { icon: Users, text: '170K+ học sinh theo học' },
  { icon: Trophy, text: 'Top 1 Livestream Toán VN' },
  { icon: Zap, text: 'Thủ khoa ĐH 28 điểm' },
]

function TrustBar() {
  const doubled = useMemo(() => [...trustStats, ...trustStats, ...trustStats, ...trustStats], [])

  return (
    <div className="overflow-hidden bg-brand-800 py-3">
      <div className="flex marquee gap-8 whitespace-nowrap">
        {doubled.map((s, i) => {
          const Icon = s.icon
          return (
            <span key={i} className="inline-flex items-center gap-2 text-sm font-medium text-brand-200 shrink-0">
              <Icon size={16} className="text-brand-400" />
              {s.text}
              <span className="text-brand-600 mx-2">•</span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ========== Quick Nav Cards ========== */
const quickNavCards = [
  {
    title: 'Khoá học Online',
    desc: 'Lớp 1 → 6, Toán tư duy TIMO, SASMO',
    icon: '/Online Courses Icon.png',
    link: '/khoa-hoc',
    bgLight: 'bg-amber-50',
  },
  {
    title: 'Sách luyện thi',
    desc: 'Giáo trình & sách bổ trợ chính hãng',
    icon: '/Book Icon.png',
    link: '/sach',
    bgLight: 'bg-blue-50',
  },
  {
    title: 'Thi thử',
    desc: 'Đề thi thử sát đề thật, chấm tự động',
    icon: '/Exam Icon.png',
    link: '/de-thi',
    bgLight: 'bg-emerald-50',
  },
]

function QuickNavStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4">
      {quickNavCards.map((card, i) => (
        <ScrollReveal key={card.title} delay={i * 100}>
          <Link to={card.link}
                className={`group relative flex items-center gap-4 ${card.bgLight}
                            rounded-2xl p-4 lg:p-5 border border-white/60
                            shadow-card hover:shadow-card-hover
                            transition-all duration-400 hover:-translate-y-1`}>
            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white shadow-sm
                            flex items-center justify-center p-2.5 shrink-0
                            group-hover:scale-105 transition-transform duration-300">
              <img alt={card.title} src={card.icon} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm lg:text-base font-bold text-brand-900"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                {card.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{card.desc}</p>
            </div>
            <ChevronRight size={18} className="text-brand-400 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </ScrollReveal>
      ))}
    </div>
  )
}

/* ========== Product Section ========== */
function ProductSection({ section, index }) {
  const [expanded, setExpanded] = useState(section.type === 'COMBOS')
  const Icon = sectionIcons[section.type] || LibraryBig
  const linkPath = section.type === 'BOOKS' ? '/sach' : '/khoa-hoc'
  const cardType = section.type === 'COMBOS' ? 'combo' : section.type === 'BOOKS' ? 'book' : 'course'

  const visibleItems = expanded ? section.items : section.items.slice(0, 4)

  return (
    <ScrollReveal delay={index * 80}>
      <div className="bg-white/50 rounded-3xl p-4 lg:p-6 border border-brand-100/60">
        {/* Section Header — horizontal layout */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-500 shrink-0
                            flex items-center justify-center shadow-sm">
              <Icon size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide">
                {section.title}
              </p>
              <h2 className="text-base lg:text-xl font-bold text-brand-900 line-clamp-1"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                {section.subtitle}
              </h2>
            </div>
          </div>
          <Link
            to={linkPath}
            className="inline-flex items-center gap-1.5 px-4 h-9 text-sm
                       rounded-xl font-bold whitespace-nowrap
                       bg-brand-600 text-white
                       shadow-sm hover:bg-brand-700 hover:shadow-md active:translate-y-0 transition-all duration-200 shrink-0"
          >
            Xem tất cả
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          {visibleItems.map((item) => (
            <CourseCard key={item.id} item={item} type={cardType} />
          ))}
        </div>

        {/* Expand/Collapse */}
        {section.items.length > 4 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center h-10 px-6 rounded-full font-semibold text-sm
                         bg-brand-100 text-brand-800
                         hover:bg-brand-200 active:translate-y-0
                         transition-all duration-300"
            >
              <ChevronDown
                size={18}
                className={`mr-1.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              />
              {expanded ? 'Thu gọn' : `Xem thêm (${section.items.length - 4})`}
            </button>
          </div>
        )}
      </div>
    </ScrollReveal>
  )
}

/* ========== MAIN HOMEPAGE ========== */
export default function HomePage() {
  const [sections, setSections] = useState([])
  const [honors, setHonors] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  // Use settings from context — no double fetch
  const settings = useSettings()

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const [sectionsData, honorsData, feedbackData] = await Promise.all([
          fetchHomepageSections().catch(() => []),
          fetchFeedbacks('honor'),
          fetchFeedbacks('feedback'),
        ])

        if (cancelled) return

        // Map sections from API to the format used by ProductSection component
        const builtSections = sectionsData.map(s => ({
          id: s.id,
          type: s.product_type === 'combo' ? 'COMBOS' : s.product_type === 'book' ? 'BOOKS' : 'COURSES',
          title: s.title,
          subtitle: s.subtitle,
          items: s.items || [],
        }))

        setSections(builtSections)

        // Feedbacks: extract image URLs from API data
        setHonors(honorsData.map(h => h.image).filter(Boolean))
        setFeedback(feedbackData.map(f => f.image).filter(Boolean))
      } catch (err) {
        console.error('Failed to load homepage data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand-500" />
          <p className="text-sm text-gray-400 font-medium">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* ========== HERO SECTION — Split layout ========== */}
      <div className="relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-300/20 rounded-full blur-3xl blob" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-brand-400/15 rounded-full blur-3xl blob" style={{ animationDelay: '4s' }} />
        
        <div className="relative mx-4 lg:mx-8 2xl:mx-[10%] 3xl:mx-[15%] mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4 lg:gap-6 items-stretch">
            {/* Left: Text + Stats */}
            <ScrollReveal direction="left">
              <div className="flex flex-col justify-between h-full gap-4">
                {/* Welcome card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-card p-5 lg:p-7 flex-1
                                border border-brand-100/50">
                  <h1 className="text-2xl lg:text-4xl font-bold text-brand-900 leading-tight"
                      style={{ fontFamily: 'var(--font-heading)' }}>
                    {settings.hero_title || 'Chinh phục Toán học'}
                    <br />
                    <span className="text-gradient">{settings.hero_subtitle || 'cùng Thầy Tuấn'}</span>
                  </h1>
                  <p className="text-sm lg:text-base text-gray-500 mt-3 leading-relaxed max-w-md">
                    {settings.site_description || 'Hệ thống khóa học từ lớp 10 đến 12, thiết kế khoa học, giúp bạn đạt điểm cao trong mọi kỳ thi.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-5">
                    <Link to="/khoa-hoc"
                          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm
                                     bg-brand-600 text-white shadow-md hover:bg-brand-700 hover:shadow-lg
                                     transition-all duration-200">
                      Khám phá khoá học
                      <ArrowRight size={16} />
                    </Link>
                    <Link to="/kich-hoat"
                          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-sm
                                     bg-brand-100 text-brand-800
                                     transition-all duration-200 hover:bg-brand-200">
                      <Sparkles size={16} />
                      Kích hoạt
                    </Link>
                  </div>
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { num: settings.stat_1_value || '170K+', label: settings.stat_1_label || 'Học sinh' },
                    { num: settings.stat_2_value || '#1', label: settings.stat_2_label || 'Livestream' },
                    { num: settings.stat_3_value || '8+', label: settings.stat_3_label || 'Năm KN' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-card p-3 text-center
                                            border border-brand-100/50">
                      <p className="text-lg lg:text-xl font-bold text-brand-800"
                         style={{ fontFamily: 'var(--font-heading)' }}>
                        {s.num}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Banner Image */}
            <ScrollReveal delay={100}>
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-card h-full min-h-[200px]">
                <picture>
                  <source media="(max-width: 47.9375em)" srcSet="/banner_general/banner_general_mobile_1.png" />
                  <source media="(min-width: 48em)" srcSet="/banner_general/banner_general_1.png" />
                  <img
                    alt="Banner homepage"
                    src="/banner_general/banner_general_1.png"
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ========== TRUST BAR ========== */}
      <div className="mt-6 rounded-2xl mx-4 lg:mx-8 2xl:mx-[10%] 3xl:mx-[15%] overflow-hidden">
        <TrustBar />
      </div>

      <div className="mx-4 lg:mx-8 2xl:mx-[10%] 3xl:mx-[15%]">
        {/* ========== QUICK NAV CARDS ========== */}
        <div className="mt-6">
          <QuickNavStrip />
        </div>

        {/* ========== PRODUCT SECTIONS ========== */}
        <div className="flex flex-col gap-5 mt-8">
          {sections.map((section, i) => (
            <ProductSection key={section.id} section={section} index={i} />
          ))}

          {/* ========== BẢNG VINH DANH ========== */}
          {honors.length > 0 && (
            <ScrollReveal>
              <div className="bg-white/50 rounded-3xl p-4 lg:p-6 border border-brand-100/60">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 shrink-0
                                  flex items-center justify-center shadow-sm">
                    <Trophy size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                      Thành tích
                    </p>
                    <h2 className="text-base lg:text-xl font-bold text-brand-900"
                        style={{ fontFamily: 'var(--font-heading)' }}>
                      Bảng vinh danh học sinh xuất sắc
                    </h2>
                  </div>
                </div>
                <ImageCarousel images={honors} altPrefix="Honor" useDirectUrl />
              </div>
            </ScrollReveal>
          )}

          {/* ========== FEEDBACK ========== */}
          {feedback.length > 0 && (
            <ScrollReveal>
              <div className="bg-white/50 rounded-3xl p-4 lg:p-6 border border-brand-100/60">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 shrink-0
                                  flex items-center justify-center shadow-sm">
                    <Users size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Phản hồi
                    </p>
                    <h2 className="text-base lg:text-xl font-bold text-brand-900"
                        style={{ fontFamily: 'var(--font-heading)' }}>
                      Feedback từ học sinh
                    </h2>
                  </div>
                </div>
                <ImageCarousel images={feedback} altPrefix="Feedback" useDirectUrl />
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </div>
  )
}
