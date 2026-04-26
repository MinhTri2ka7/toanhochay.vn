import { useState, useEffect } from 'react'
import { BookOpen, Package, ChevronRight, Loader2, LibraryBig } from 'lucide-react'
import CourseCard from '../components/CourseCard'
import ScrollReveal from '../components/ScrollReveal'
import { fetchCourses, fetchCombos, fetchHomepageSections } from '../lib/api'

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [courses, setCourses] = useState([])
  const [combos, setCombos] = useState([])
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  // Mobile tab state
  const [mobileTab, setMobileTab] = useState('all')

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, combosData, sectionsData] = await Promise.all([
          fetchCourses(),
          fetchCombos(),
          fetchHomepageSections(),
        ])
        setCourses(coursesData)
        setCombos(combosData)
        // Extract course + combo sections for sidebar
        const courseSections = (sectionsData || []).filter(s =>
          (s.product_type === 'course' || s.product_type === 'combo') && s.status === 'active'
        )
        setSections(courseSections)
      } catch (err) {
        console.error('Failed to load courses:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter courses/combos based on selected category
  function getFilteredItems() {
    if (selectedCategory === 'all') return { items: courses, type: 'course', label: 'Tất cả khóa học' }
    if (selectedCategory === 'roadmap') return { items: combos, type: 'combo', label: 'Lộ trình khóa học' }

    // Category-based filter (e.g., 2k7, 2k8)
    const section = sections.find(s => s.category === selectedCategory)
    if (section) {
      if (section.product_type === 'combo') {
        const filtered = section.category
          ? combos.filter(c => c.category === section.category)
          : combos
        return { items: filtered, type: 'combo', label: section.title }
      } else {
        const filtered = section.category
          ? courses.filter(c => c.category === section.category)
          : courses
        return { items: filtered, type: 'course', label: section.title }
      }
    }

    return { items: courses, type: 'course', label: 'Tất cả khóa học' }
  }

  // Mobile: filtered items
  function getMobileItems() {
    if (mobileTab === 'roadmap') return { items: combos, type: 'combo' }
    if (mobileTab === 'all') return { items: courses, type: 'course' }
    // Category filter
    const section = sections.find(s => s.category === mobileTab)
    if (section?.product_type === 'combo') {
      return { items: combos.filter(c => c.category === mobileTab), type: 'combo' }
    }
    return { items: courses.filter(c => c.category === mobileTab), type: 'course' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  const { items: filteredItems, type: filteredType, label: filteredLabel } = getFilteredItems()

  // Get unique categories from sections for tabs
  const categoryTabs = sections.filter(s => s.category && s.product_type === 'course')

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Banner */}
      <ScrollReveal>
        <div className="mb-6">
          <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-card"
               style={{
                 background: 'linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0891b2 100%)',
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
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textShadow: '0 2px 12px rgba(0,0,0,0.18)',
              margin: 0,
            }}>Khóa Học</h2>
          </div>
        </div>
      </ScrollReveal>

      {/* Mobile Tab Bar */}
      <div className="block lg:hidden">
        <ScrollReveal>
          <div className="flex flex-wrap mb-4 bg-white rounded-2xl shadow-card p-1.5 gap-1.5">
            <button
              onClick={() => setMobileTab('all')}
              className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl
                           font-semibold text-xs transition-all duration-300
                           ${mobileTab === 'all'
                             ? 'bg-brand-600 text-white shadow-sm'
                             : 'text-gray-500'}`}
            >
              <BookOpen size={14} /> Tất cả
            </button>
            <button
              onClick={() => setMobileTab('roadmap')}
              className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl
                           font-semibold text-xs transition-all duration-300
                           ${mobileTab === 'roadmap'
                             ? 'bg-brand-600 text-white shadow-sm'
                             : 'text-gray-500'}`}
            >
              <Package size={14} /> Lộ trình
            </button>
            {categoryTabs.map(s => (
              <button
                key={s.category}
                onClick={() => setMobileTab(s.category)}
                className={`flex-1 min-w-[45%] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl
                             font-semibold text-xs transition-all duration-300
                             ${mobileTab === s.category
                               ? 'bg-brand-600 text-white shadow-sm'
                               : 'text-gray-500'}`}
              >
                <LibraryBig size={14} /> {s.title.replace('KHÓA HỌC ', '')}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
              {getMobileItems().items.map(c => <CourseCard key={c.id} item={c} type={getMobileItems().type} />)}
            </div>
            {getMobileItems().items.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
                Chưa có khóa học nào trong nhóm này
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-[260px_1fr] gap-5">
        <ScrollReveal direction="left">
          <div className="w-[260px] bg-white p-5 rounded-2xl shadow-card sticky top-20 self-start
                          max-h-[calc(100vh-6rem)] overflow-y-auto">
            <h3 className="text-lg font-bold leading-tight mb-4 text-brand-900"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Danh mục khóa học
            </h3>
            <div className="h-px bg-brand-300/40 mb-4" />
            <div className="flex flex-col gap-1">
              {/* Combo / Lộ trình */}
              <button
                onClick={() => setSelectedCategory('roadmap')}
                className={`relative flex items-center h-10 px-4 rounded-xl text-sm font-semibold text-start
                            transition-all duration-200
                            ${selectedCategory === 'roadmap'
                              ? 'bg-brand-100/80 text-brand-800'
                              : 'text-gray-600'}`}
              >
                {selectedCategory === 'roadmap' && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-brand-500" />
                )}
                <Package size={16} className="mr-2 shrink-0" /> Lộ trình khóa học
              </button>

              {/* Dynamic category buttons from homepage sections */}
              {categoryTabs.map(section => (
                <button
                  key={section.category}
                  onClick={() => setSelectedCategory(section.category)}
                  className={`relative flex items-center h-10 px-4 rounded-xl text-sm font-semibold text-start
                              transition-all duration-200
                              ${selectedCategory === section.category
                                ? 'bg-brand-100/80 text-brand-800'
                                : 'text-gray-600'}`}
                >
                  {selectedCategory === section.category && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-brand-500" />
                  )}
                  <LibraryBig size={16} className="mr-2 shrink-0" /> {section.title}
                </button>
              ))}

              {/* Tất cả */}
              <button
                onClick={() => setSelectedCategory('all')}
                className={`relative flex items-center h-10 px-4 rounded-xl text-sm font-semibold text-start
                            transition-all duration-200
                            ${selectedCategory === 'all'
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'text-gray-600'}`}
              >
                <ChevronRight size={16} className="mr-2 shrink-0" /> Tất cả khóa học
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={100}>
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex bg-white p-4 rounded-2xl shadow-card items-center">
              <p className="font-semibold text-brand-900" style={{ fontFamily: 'var(--font-heading)' }}>
                {filteredLabel}
              </p>
              <div className="flex-1" />
              <span className="text-xs text-gray-400 font-medium">
                {filteredItems.length} sản phẩm
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
              {filteredItems.map(c => <CourseCard key={c.id} item={c} type={filteredType} />)}
            </div>

            {filteredItems.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
                Chưa có khóa học nào trong nhóm này
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
