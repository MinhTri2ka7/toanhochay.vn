import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, ArrowLeft, Send, Loader2, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ScrollReveal from '../components/ScrollReveal'

export default function ExamTakingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [passcodeError, setPasscodeError] = useState('')
  const [passcodeVerified, setPasscodeVerified] = useState(false)

  // Load exam
  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch(`/api/exams/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setExam(data)
        setTimeLeft(data.duration * 60)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadExam()
  }, [id])

  // Countdown timer
  useEffect(() => {
    if (submitted || timeLeft <= 0 || !exam) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [submitted, timeLeft, exam])

  function selectAnswer(questionId, answer) {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)

    try {
      const res = await fetch(`/api/exams/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          answers,
          timeSpent: exam ? (exam.duration * 60 - timeLeft) : 0,
        }),
      })
      const data = await res.json()
      setResults(data)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [answers, exam, id, timeLeft, submitting, submitted])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-500">Không tìm thấy đề thi</p>
        <button onClick={() => navigate('/de-thi')} className="mt-4 text-brand-600 font-semibold">← Quay lại</button>
      </div>
    )
  }

  // Login gate - only logged in users can take exams
  if (!user && !submitted) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-section p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Yêu cầu đăng nhập</h2>
            <p className="text-gray-500 text-sm mb-6">Bạn cần đăng nhập để làm bài thi thử</p>
            <button onClick={() => navigate(`/login?redirect=/de-thi/${id}`)}
                    className="w-full h-11 rounded-xl font-semibold bg-brand-600 text-white shadow-md transition-all">
              Đăng nhập
            </button>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  // Passcode gate
  if (exam.hasPasscode && !passcodeVerified && !submitted) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <ScrollReveal>
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-section p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-brand-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Đề thi có mật khẩu</h2>
            <p className="text-gray-500 text-sm mb-4">{exam.title}</p>
            {passcodeError && <p className="text-red-500 text-sm mb-3">{passcodeError}</p>}
            <form onSubmit={async (e) => {
              e.preventDefault()
              setPasscodeError('')
              try {
                const res = await fetch(`/api/exams/${id}/verify-passcode`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ passcode: passcodeInput }),
                })
                const data = await res.json()
                if (res.ok && data.success) {
                  setExam(prev => ({ ...prev, questions: data.questions }))
                  setPasscodeVerified(true)
                } else {
                  setPasscodeError(data.error || 'Mật khẩu không đúng')
                }
              } catch (err) {
                setPasscodeError('Lỗi xác minh mật khẩu')
              }
            }}>
              <input type="text" value={passcodeInput} onChange={e => setPasscodeInput(e.target.value)}
                     placeholder="Nhập mật khẩu đề thi"
                     className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 text-sm text-center font-semibold tracking-wider
                                focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none mb-3" />
              <button type="submit" className="w-full h-11 rounded-xl font-semibold bg-brand-600 text-white shadow-md transition-all">
                Xác nhận
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    )
  }

  // Results view
  if (submitted && results) {
    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%] max-w-3xl mx-auto">
        <ScrollReveal>
          <div className="bg-white rounded-3xl shadow-section p-8 text-center mb-6">
            <h1 className="text-2xl font-bold text-brand-900 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Kết quả bài thi
            </h1>
            <p className="text-gray-500 mb-6">{exam.title}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-brand-50 rounded-2xl p-4">
                <p className="text-3xl font-bold text-brand-700">{results.score}</p>
                <p className="text-xs text-gray-500">Điểm</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4">
                <p className="text-3xl font-bold text-emerald-600">{results.correctCount}</p>
                <p className="text-xs text-gray-500">Đúng</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4">
                <p className="text-3xl font-bold text-red-500">{results.totalQuestions - results.correctCount}</p>
                <p className="text-xs text-gray-500">Sai</p>
              </div>
            </div>

            <button onClick={() => navigate('/de-thi')}
                    className="inline-flex items-center gap-2 h-10 px-6 rounded-xl font-semibold
                               bg-brand-600 text-white
                               transition-all">
              <ArrowLeft size={16} /> Danh sách đề thi
            </button>
          </div>
        </ScrollReveal>

        {/* Question review */}
        <div className="space-y-4">
          {exam.questions?.map((q, idx) => {
            const result = results.results?.find(r => r.questionId === q.id)
            const isCorrect = result?.isCorrect
            return (
              <div key={q.id} className={`bg-white rounded-2xl shadow-card p-5 border-l-4
                                          ${isCorrect ? 'border-emerald-500' : 'border-red-400'}`}>
                <p className="font-semibold text-sm mb-3">
                  <span className="text-gray-400 mr-2">Câu {idx + 1}.</span>
                  {q.question_text}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const isUserAnswer = result?.userAnswer === opt
                    const isCorrectAnswer = result?.correctAnswer === opt
                    let cls = 'border-gray-200 bg-gray-50'
                    if (isCorrectAnswer) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    else if (isUserAnswer && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-600'
                    return (
                      <div key={opt} className={`px-3 py-2 rounded-lg border ${cls} flex items-center gap-2`}>
                        <span className="font-bold w-5">{opt}.</span>
                        {q[`option_${opt.toLowerCase()}`]}
                        {isCorrectAnswer && <CheckCircle size={14} className="ml-auto text-emerald-500" />}
                        {isUserAnswer && !isCorrect && <XCircle size={14} className="ml-auto text-red-400" />}
                      </div>
                    )
                  })}
                </div>
                {result?.explanation && (
                  <p className="mt-3 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                    💡 {result.explanation}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Exam taking view
  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Sticky timer header */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md rounded-2xl shadow-card p-4 mb-6
                      flex items-center justify-between">
        <div>
          <h1 className="font-bold text-brand-900 text-sm lg:text-base line-clamp-1">{exam.title}</h1>
          <p className="text-xs text-gray-400">{exam.questions?.length || 0} câu hỏi</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm
                           ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-brand-100 text-brand-700'}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-xl font-semibold text-sm
                             bg-brand-600 text-white
                             transition-all">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Nộp bài
          </button>
        </div>
      </div>

      {/* Questions */}
      <div className="max-w-3xl mx-auto space-y-5">
        {exam.questions?.map((q, idx) => (
          <ScrollReveal key={q.id} delay={idx * 50}>
            <div className="bg-white rounded-2xl shadow-card p-5">
              <p className="font-semibold text-sm lg:text-base mb-4">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg
                                 bg-brand-100 text-brand-700 text-xs font-bold mr-2">
                  {idx + 1}
                </span>
                {q.question_text}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(q.id, opt)}
                    className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium
                                transition-all duration-200 flex items-center gap-2
                                ${answers[q.id] === opt
                                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                                  : 'border-gray-200'}`}
                  >
                    <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0
                                     ${answers[q.id] === opt ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300'}">
                      {opt}
                    </span>
                    {q[`option_${opt.toLowerCase()}`]}
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Bottom submit bar */}
      <div className="max-w-3xl mx-auto mt-6">
        <div className="bg-white rounded-2xl shadow-card p-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Đã làm: <strong>{Object.keys(answers).length}</strong> / {exam.questions?.length || 0}
          </p>
          <button onClick={handleSubmit} disabled={submitting}
                  className="flex items-center gap-2 h-10 px-6 rounded-xl font-semibold
                             bg-brand-600 text-white
                             shadow-md transition-all">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  )
}
