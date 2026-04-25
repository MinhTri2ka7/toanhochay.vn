import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookCopy, LibraryBig, BookText, ChevronRight, ChevronDown, Sparkles, Loader2 } from 'lucide-react'
import CourseCard from '../components/CourseCard'
import ImageCarousel from '../components/ImageCarousel'
import ScrollReveal from '../components/ScrollReveal'
import { fetchHomepageSections, fetchFeedbacks } from '../lib/api'

const sectionIcons = {
  COMBOS: BookCopy,
  COURSES: LibraryBig,
  BOOKS: BookText,
}

function ProductSection({ section, index }) {
  const [expanded, setExpanded] = useState(section.type === 'COMBOS')
  const Icon = sectionIcons[section.type] || LibraryBig
  const linkPath = section.type === 'BOOKS' ? '/sach' : '/khoa-hoc'
  const cardType = section.type === 'COMBOS' ? 'combo' : section.type === 'BOOKS' ? 'book' : 'course'

  const visibleItems = expanded ? section.items : section.items.slice(0, 4)

  return (
    <ScrollReveal delay={index * 100}>
      <div>
        {/* Section Header */}
        <div className="flex justify-between items-center gap-6">
          <div className="accent-line">
            <div className="flex items-center text-brand-700 gap-2 font-bold">
              <div className="w-8 h-8 rounded-lg bg-brand-500
                              flex items-center justify-center">
                <Icon size={16} className="text-white" />
              </div>
              <p className="text-sm lg:text-lg flex items-center gap-2 line-clamp-1"
                 style={{ fontFamily: 'var(--font-heading)' }}>
                {section.title}
              </p>
            </div>
            <p className="text-base lg:text-2xl text-start line-clamp-1 font-extrabold mt-1 text-brand-900"
               style={{ fontFamily: 'var(--font-heading)' }}>
              {section.subtitle}
            </p>
          </div>
          <Link
            to={linkPath}
            className="inline-flex items-center justify-center px-4 lg:px-5 h-9 lg:h-10 text-sm
                       rounded-xl font-bold
                       bg-brand-600 text-white
                       shadow-md active:translate-y-0 transition-all duration-200 shrink-0"
          >
            Xem tất cả
          </Link>
        </div>

        {/* Cards Grid */}
        <div className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
            {visibleItems.map((item) => (
              <CourseCard key={item.id} item={item} type={cardType} />
            ))}
          </div>
        </div>

        {/* Expand/Collapse */}
        {section.items.length > 4 && (
          <div className="relative px-16 mt-8 mb-6">
            <hr className="border-brand-200/40" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center h-9 px-5 rounded-full font-semibold text-sm
                           bg-white text-brand-800 shadow-card
                           active:translate-y-0
                           transition-all duration-300"
              >
                <ChevronDown
                  size={18}
                  className={`mr-1.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                />
                {expanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
  )
}

export default function HomePage() {
  const [sections, setSections] = useState([])
  const [honors, setHonors] = useState([])
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [sectionsData, honorsData, feedbackData] = await Promise.all([
          fetchHomepageSections().catch(() => []),
          fetchFeedbacks('honor'),
          fetchFeedbacks('feedback'),
        ])

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
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* ========== HERO BANNER ========== */}
      <div className="relative overflow-hidden">
        <div className="relative mx-4 lg:mx-8 2xl:mx-[10%] 3xl:mx-[15%] mt-4">
          <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-card">
            <picture>
              <source media="(max-width: 47.9375em)" srcSet="/banner_general/banner_general_mobile_1.png" />
              <source media="(min-width: 48em)" srcSet="/banner_general/banner_general_1.png" />
              <img
                alt="Banner homepage"
                src="/banner_general/banner_general_1.png"
                className="w-full object-cover"
              />
            </picture>
          </div>
        </div>
      </div>

      <div className="mx-4 lg:mx-8 2xl:mx-[10%] 3xl:mx-[15%]">
        {/* ========== 3 CATEGORY CARDS + CTA ========== */}
        <ScrollReveal>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
            {[
              {
                title: 'Khoá học',
                desc: 'Hệ thống khóa học từ lớp 10 đến lớp 12 hướng đến những học sinh mục tiêu điểm cao',
                icon: '/Online Courses Icon.png',
                link: '/khoa-hoc',
                cta: 'Tham khảo',
                bg: 'bg-amber-50',
                borderColor: 'border-amber-200/60',
              },
              {
                title: 'Sách',
                desc: 'Hệ thống sách tham khảo bổ trợ đắc lực cho việc ôn thi',
                icon: '/Book Icon.png',
                link: '/sach',
                cta: 'Tham khảo',
                bg: 'bg-blue-50',
                borderColor: 'border-blue-200/60',
              },
              {
                title: 'Thi thử',
                desc: 'Thực chiến làm đề thi từ giữa kì, cuối kì đến đề thi THPT QG',
                icon: '/Exam Icon.png',
                link: '/de-thi',
                cta: 'Làm ngay',
                bg: 'bg-emerald-50',
                borderColor: 'border-emerald-200/60',
              },
            ].map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 120} className="h-full">
                <div className={`flex flex-col items-start gap-4 h-full ${card.bg}
                                rounded-2xl lg:rounded-3xl py-5 px-6 border ${card.borderColor}
                                shadow-card transition-all duration-300`}>
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/80 shadow-sm
                                    flex items-center justify-center p-2 shrink-0">
                      <img alt={card.title} src={card.icon} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-brand-900"
                          style={{ fontFamily: 'var(--font-heading)' }}>
                        {card.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                  <Link
                    to={card.link}
                    className="inline-flex items-center h-10 px-5 rounded-xl font-bold text-sm
                               bg-brand-600 text-white
                               shadow-md transition-all duration-200 mt-auto"
                  >
                    {card.cta}
                    <ChevronRight size={18} className="ml-1" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        {/* ========== KÍCH HOẠT KHOÁ HỌC — inline with spacing ========== */}
        <ScrollReveal>
          <div className="text-center mt-5 mb-8">
            <Link
              to="/kich-hoat"
              className="inline-flex items-center gap-3 text-base lg:text-lg px-7 py-3.5
                         rounded-2xl font-bold text-white bg-brand-600
                         shadow-lg active:translate-y-0 transition-all duration-300"
            >
              <Sparkles size={20} />
              Kích hoạt khoá học
            </Link>
          </div>
        </ScrollReveal>

        {/* ========== PRODUCT SECTIONS ========== */}
        <div className="flex flex-col gap-8">
          {sections.map((section, i) => (
            <div key={section.id}>
              {i > 0 && <div className="h-px bg-brand-200/50 mb-8" />}
              <ProductSection section={section} index={i} />
            </div>
          ))}

          {/* ========== BẢNG VINH DANH ========== */}
          {honors.length > 0 && (
            <>
              <div className="h-px bg-brand-200/50" />
              <ScrollReveal>
                <div>
                  <div className="accent-line mb-5">
                    <h2 className="text-lg xl:text-2xl font-bold text-brand-900"
                        style={{ fontFamily: 'var(--font-heading)' }}>
                      BẢNG VINH DANH 2K6 LIVE VIP CTG
                    </h2>
                  </div>
                  <ImageCarousel images={honors} altPrefix="Honor" useDirectUrl />
                </div>
              </ScrollReveal>
            </>
          )}

          {/* ========== FEEDBACK ========== */}
          {feedback.length > 0 && (
            <>
              <div className="h-px bg-brand-200/50" />
              <ScrollReveal>
                <div>
                  <div className="accent-line mb-5">
                    <h2 className="text-lg xl:text-2xl font-bold text-brand-900"
                        style={{ fontFamily: 'var(--font-heading)' }}>
                      FEEDBACK HỌC SINH 2K6 - LIVE VIP CTG
                    </h2>
                  </div>
                  <ImageCarousel images={feedback} altPrefix="Feedback" useDirectUrl />
                </div>
              </ScrollReveal>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
