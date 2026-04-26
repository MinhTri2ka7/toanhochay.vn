import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, ChevronRight, Loader2, Lock } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { fetchExams } from '../lib/api'

const difficultyConfig = {
  'easy': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Dễ' },
  'medium': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Trung bình' },
  'hard': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Khó' },
  'very_hard': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Rất khó' },
}

export default function ExamsPage() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchExams()
      .then(setExams)
      .catch(console.error)
      .finally(() => setLoading(false))
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
          <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-card"
               style={{
                 background: '#FFF8E1',
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
              background: 'linear-gradient(180deg, #F5C518 0%, #E8751A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Thi Thử</h2>
          </div>
        </div>
      </ScrollReveal>

      {/* Section Header */}
      <ScrollReveal delay={100}>
        <div className="accent-line mb-6">
          <p className="text-sm text-brand-700 font-bold">THI THỬ</p>
          <h1 className="text-xl lg:text-2xl font-bold text-brand-900"
              style={{ fontFamily: 'var(--font-heading)' }}>
            Danh sách đề thi
          </h1>
        </div>
      </ScrollReveal>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
        {exams.map((exam, i) => {
          const config = difficultyConfig[exam.difficulty] || difficultyConfig['medium']
          return (
            <ScrollReveal key={exam.id} delay={i * 60}>
              <div
                className="bg-white rounded-2xl shadow-card p-5
                           flex flex-col gap-3 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/de-thi/${exam.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100
                                  flex items-center justify-center shrink-0">
                    <FileText size={22} className="text-brand-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm lg:text-base line-clamp-2">{exam.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{exam.total_questions} câu hỏi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Clock size={14} /> {exam.duration} phút
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold ${config.bg} ${config.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                  {exam.hasPasscode && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold bg-purple-50 text-purple-600">
                      <Lock size={12} /> Có mật khẩu
                    </span>
                  )}
                </div>

                <button className="w-full h-10 rounded-xl font-bold text-sm
                                   bg-brand-600 text-white shadow-md
                                   transition-all duration-200 flex items-center justify-center gap-1">
                  Làm bài <ChevronRight size={16} />
                </button>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </div>
  )
}
