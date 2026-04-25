import { useState, useEffect } from 'react'
import { BookOpen, Package, ChevronRight, Loader2 } from 'lucide-react'
import CourseCard from '../components/CourseCard'
import ScrollReveal from '../components/ScrollReveal'
import { fetchCourses, fetchCombos } from '../lib/api'

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [courses, setCourses] = useState([])
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, combosData] = await Promise.all([
          fetchCourses(),
          fetchCombos(),
        ])
        setCourses(coursesData)
        setCombos(combosData)
      } catch (err) {
        console.error('Failed to load courses:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Banner */}
      <ScrollReveal>
        <div className="mb-6">
          <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-card">
            <picture>
              <source media="(max-width: 47.9375em)" srcSet="/banner_general/banner_general_mobile_1.png" />
              <source media="(min-width: 48em)" srcSet="/banner_general/banner_general_1.png" />
              <img alt="Banner Khóa học" src="/banner_general/banner_general_1.png"
                   className="w-full object-cover rounded-2xl lg:rounded-3xl" />
            </picture>
          </div>
        </div>
      </ScrollReveal>

      {/* Mobile Tab Bar */}
      <div className="block lg:hidden">
        <ScrollReveal>
          <div className="flex mb-5 bg-white rounded-2xl shadow-card p-1.5 gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                           font-semibold text-sm transition-all duration-300
                           ${activeTab === 'all'
                             ? 'bg-brand-600 text-white shadow-sm'
                             : 'text-gray-500'}`}
            >
              <BookOpen size={16} /> Tất cả khóa học
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
                           font-semibold text-sm transition-all duration-300
                           ${activeTab === 'roadmap'
                             ? 'bg-brand-600 text-white shadow-sm'
                             : 'text-gray-500'}`}
            >
              <Package size={16} /> Lộ trình
            </button>
          </div>
        </ScrollReveal>

        {activeTab === 'all' && (
          <ScrollReveal>
            <div className="flex flex-col gap-4">
              <div className="flex bg-white p-4 rounded-2xl shadow-card items-center">
                <p className="font-semibold text-sm text-brand-900">Tất cả khóa học</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                {courses.map(c => <CourseCard key={c.id} item={c} type="course" />)}
              </div>
            </div>
          </ScrollReveal>
        )}

        {activeTab === 'roadmap' && (
          <ScrollReveal>
            <div className="flex flex-col gap-4">
              <div className="flex bg-white p-4 rounded-2xl shadow-card items-center">
                <p className="font-semibold text-sm text-brand-900">Lộ trình khóa học</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                {combos.map(c => <CourseCard key={c.id} item={c} type="combo" />)}
              </div>
            </div>
          </ScrollReveal>
        )}
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
                {selectedCategory === 'roadmap' ? 'Lộ trình khóa học' : 'Tất cả khóa học'}
              </p>
              <div className="flex-1" />
              <span className="text-xs text-gray-400 font-medium">
                {selectedCategory === 'roadmap' ? combos.length : courses.length} sản phẩm
              </span>
            </div>

            {selectedCategory === 'roadmap' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
                {combos.map(c => <CourseCard key={c.id} item={c} type="combo" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
                {courses.map(c => <CourseCard key={c.id} item={c} type="course" />)}
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
