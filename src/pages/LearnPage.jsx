import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Play, CheckCircle, Lock, ChevronLeft, Menu, X, Clock, BookOpen, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Convert any YouTube URL to embed format with protection params
function toEmbedUrl(url) {
  if (!url) return ''
  let videoId = ''
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) videoId = u.pathname.slice(1)
    else if (u.hostname.includes('youtube.com')) {
      if (u.pathname.includes('/embed/')) return url + (url.includes('?') ? '&' : '?') + 'rel=0&modestbranding=1&disablekb=1&controls=1'
      videoId = u.searchParams.get('v')
    }
  } catch { videoId = url }
  if (!videoId) return ''
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&disablekb=1&controls=1`
}

function formatDuration(sec) {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function LearnPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [lessonDetail, setLessonDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load course + lessons
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/learn/${slug}`, { credentials: 'include' })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Lỗi tải dữ liệu')
          return
        }
        setCourse(data.course)
        setLessons(data.lessons)
        // Auto select first lesson
        if (data.lessons.length > 0) {
          selectLesson(data.lessons[0])
        }
      } catch (e) {
        setError('Lỗi kết nối')
      } finally {
        setLoading(false)
      }
    }
    if (user) load()
    else { setLoading(false); setError('login') }
  }, [slug, user])

  // Select + load lesson detail (with video URL)
  const selectLesson = useCallback(async (lesson) => {
    setActiveLesson(lesson)
    setLoadingLesson(true)
    try {
      const res = await fetch(`/api/lessons/${lesson.id}`, { credentials: 'include' })
      const data = await res.json()
      if (res.ok) setLessonDetail(data)
    } catch (e) { console.error(e) }
    finally { setLoadingLesson(false) }
  }, [])

  // Mark lesson as completed
  const markCompleted = useCallback(async (lessonId) => {
    try {
      await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, completed: true } : l))
    } catch (e) { console.error(e) }
  }, [])

  // Auto next lesson
  const goNext = useCallback(() => {
    if (!activeLesson || !lessons.length) return
    const idx = lessons.findIndex(l => l.id === activeLesson.id)
    if (idx < lessons.length - 1) selectLesson(lessons[idx + 1])
  }, [activeLesson, lessons, selectLesson])

  // Error states
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  if (error === 'login') return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center text-white">
        <Lock size={48} className="mx-auto mb-4 text-gray-500" />
        <h2 className="text-xl font-bold mb-2">Yêu cầu đăng nhập</h2>
        <p className="text-gray-400 mb-6">Bạn cần đăng nhập để truy cập bài học</p>
        <button onClick={() => navigate(`/login?redirect=/hoc/${slug}`)}
                className="px-6 py-2 rounded-lg bg-brand-600 text-white font-semibold">Đăng nhập</button>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center text-white">
        <Lock size={48} className="mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-bold mb-2">{error}</h2>
        <p className="text-gray-400 mb-6">Hãy mua khóa học để truy cập nội dung</p>
        <Link to="/khoa-hoc" className="px-6 py-2 rounded-lg bg-brand-600 text-white font-semibold">Xem khóa học</Link>
      </div>
    </div>
  )

  const completedCount = lessons.filter(l => l.completed).length
  const progressPercent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0
  const embedUrl = lessonDetail ? toEmbedUrl(lessonDetail.video_url) : ''
  const currentIdx = activeLesson ? lessons.findIndex(l => l.id === activeLesson.id) : -1

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-950 border-r border-gray-800 flex flex-col overflow-hidden shrink-0`}>
        {/* Sidebar header */}
        <div className="px-4 py-3 border-b border-gray-800 shrink-0">
          <Link to="/khoa-hoc" className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-1">
            <ChevronLeft size={12} /> Quay lại
          </Link>
          <h2 className="text-white font-bold text-sm line-clamp-2">{course?.name}</h2>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-xs text-gray-400 shrink-0">{completedCount}/{lessons.length}</span>
          </div>
        </div>

        {/* Lesson list */}
        <div className="flex-1 overflow-y-auto">
          {lessons.map((l, idx) => (
            <button key={l.id}
              onClick={() => selectLesson(l)}
              className={`w-full text-left px-4 py-3 border-b border-gray-800/50 flex items-start gap-3 transition-colors
                ${activeLesson?.id === l.id ? 'bg-gray-800/80' : 'hover:bg-gray-800/40'}`}>
              <div className="shrink-0 mt-0.5">
                {l.completed ? (
                  <CheckCircle size={18} className="text-emerald-400" />
                ) : activeLesson?.id === l.id ? (
                  <Play size={18} className="text-brand-400" />
                ) : (
                  <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border border-gray-600 text-[10px] text-gray-500">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug line-clamp-2 ${activeLesson?.id === l.id ? 'text-white font-semibold' : l.completed ? 'text-gray-400' : 'text-gray-300'}`}>
                  {l.title}
                </p>
                {l.duration > 0 && (
                  <span className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                    <Clock size={10} /> {formatDuration(l.duration)}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 bg-gray-950 border-b border-gray-800 flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold line-clamp-1">{activeLesson?.title || 'Chọn bài học'}</p>
          </div>
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button onClick={() => currentIdx > 0 && selectLesson(lessons[currentIdx - 1])}
                    disabled={currentIdx <= 0}
                    className="h-8 px-3 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
              <ChevronLeft size={14} /> Trước
            </button>
            <button onClick={goNext}
                    disabled={currentIdx >= lessons.length - 1}
                    className="h-8 px-3 rounded-lg text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1">
              Tiếp <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 overflow-y-auto">
          {loadingLesson ? (
            <div className="flex items-center justify-center h-96">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : embedUrl ? (
            <>
              {/* Video container with anti-download protection */}
              <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}
                   onContextMenu={e => e.preventDefault()}>
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={activeLesson?.title}
                  referrerPolicy="no-referrer"
                />
                {/* Transparent overlay to prevent easy inspect */}
                <div className="absolute inset-0 pointer-events-none" />
                {/* Dynamic watermark */}
                {user && (
                  <div className="absolute bottom-4 right-4 pointer-events-none opacity-30 text-white text-xs font-bold select-none"
                       style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {user.email}
                  </div>
                )}
              </div>

              {/* Lesson info + actions */}
              <div className="max-w-4xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h1 className="text-xl font-bold text-white">{activeLesson?.title}</h1>
                  <div className="flex items-center gap-2 shrink-0">
                    {!activeLesson?.completed && (
                      <button onClick={() => { markCompleted(activeLesson.id); goNext() }}
                              className="h-9 px-4 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1.5 transition-colors">
                        <CheckCircle size={14} /> Hoàn thành & Tiếp
                      </button>
                    )}
                  </div>
                </div>
                {lessonDetail?.description && (
                  <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
                       dangerouslySetInnerHTML={{ __html: lessonDetail.description }} />
                )}
              </div>
            </>
          ) : activeLesson ? (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <BookOpen size={48} className="mx-auto mb-3 text-gray-700" />
                <p className="font-medium">Bài học này chưa có video</p>
                {lessonDetail?.description && (
                  <div className="mt-6 max-w-2xl mx-auto px-6 text-left prose prose-invert prose-sm text-gray-300"
                       dangerouslySetInnerHTML={{ __html: lessonDetail.description }} />
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <p>Chọn bài học từ danh sách bên trái</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
