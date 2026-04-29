import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, ArrowLeft, Send, Loader2, Lock, MinusCircle } from 'lucide-react'
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

  // Results view with score + leaderboard
  if (submitted && results) {
    const pct = results.maxScore > 0 ? Math.round((results.score / results.maxScore) * 100) : 0
    const circumference = 2 * Math.PI * 54 // radius = 54
    const dashOffset = circumference - (pct / 100) * circumference
    const scoreColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'
    const timeStr = results.timeSpent ? `${Math.floor(results.timeSpent / 60)}p ${results.timeSpent % 60}s` : ''

    return (
      <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Score + Stats (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <ScrollReveal>
              <div className="bg-white rounded-3xl shadow-section p-8">
                <h1 className="text-xl font-bold text-brand-900 text-center mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  Kết quả bài thi
                </h1>
                <p className="text-gray-400 text-center text-sm mb-8">{exam.title}</p>

                {/* Score circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                      <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="8"
                              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black" style={{ color: scoreColor }}>{results.score}</span>
                      <span className="text-xs text-gray-400">/ {results.maxScore} điểm</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-brand-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-brand-700">{pct}%</p>
                    <p className="text-xs text-gray-500">Tỷ lệ</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{results.correctCount}</p>
                    <p className="text-xs text-gray-500">Đúng</p>
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">{results.wrongCount}</p>
                    <p className="text-xs text-gray-500">Sai</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-400">{results.unansweredCount}</p>
                    <p className="text-xs text-gray-500">Bỏ qua</p>
                  </div>
                </div>

                {timeStr && (
                  <p className="text-center text-sm text-gray-400 mb-4">
                    <Clock size={14} className="inline mr-1" /> Thời gian: <strong>{timeStr}</strong>
                  </p>
                )}

                <div className="flex justify-center gap-3">
                  <button onClick={() => navigate('/de-thi')}
                          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl font-semibold
                                     bg-brand-600 text-white transition-all text-sm">
                    <ArrowLeft size={16} /> Danh sách đề
                  </button>
                  <button onClick={() => { setSubmitted(false); setResults(null); setAnswers({}); setTimeLeft(exam.duration * 60) }}
                          className="inline-flex items-center gap-2 h-10 px-5 rounded-xl font-semibold
                                     border border-brand-300 text-brand-700 transition-all text-sm hover:bg-brand-50">
                    Thi lại
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Question review */}
            <div className="space-y-4">
              {exam.questions?.map((q, idx) => {
                const result = results.results?.find(r => r.questionId === q.id)
                const isCorrect = result?.isCorrect
                const isUnanswered = result?.isUnanswered
                return (
                  <div key={q.id} className={`bg-white rounded-2xl shadow-card p-5 border-l-4
                                              ${isCorrect ? 'border-emerald-500' : isUnanswered ? 'border-gray-300' : 'border-red-400'}`}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="font-semibold text-sm">
                        <span className="text-gray-400 mr-2">Câu {idx + 1}.</span>
                        {q.question_text}
                      </p>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold
                        ${isCorrect ? 'bg-emerald-100 text-emerald-700' : isUnanswered ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-600'}`}>
                        {result?.pointsEarned > 0 ? `+${result.pointsEarned}` : result?.pointsEarned ?? 0}
                      </span>
                    </div>
                    {q.image && <img src={q.image} alt="" className="max-h-48 rounded-lg border border-gray-200 mb-3 object-contain" />}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {['A', 'B', 'C', 'D', 'E'].map(opt => {
                        const optText = q[`option_${opt.toLowerCase()}`]
                        const optImg = q[`option_${opt.toLowerCase()}_image`]
                        if (!optText && !optImg) return null
                        const isUserAnswer = result?.userAnswer === opt
                        const isCorrectAnswer = result?.correctAnswer === opt
                        let cls = 'border-gray-200 bg-gray-50'
                        if (isCorrectAnswer) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        else if (isUserAnswer && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-600'
                        return (
                          <div key={opt} className={`px-3 py-2 rounded-lg border ${cls} flex flex-col gap-1`}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-5">{opt}.</span>
                              <span className="flex-1">{optText}</span>
                              {isCorrectAnswer && <CheckCircle size={14} className="ml-auto text-emerald-500 shrink-0" />}
                              {isUserAnswer && !isCorrect && <XCircle size={14} className="ml-auto text-red-400 shrink-0" />}
                            </div>
                            {optImg && <img src={optImg} alt="" className="max-h-24 rounded object-contain" />}
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

          {/* RIGHT — Leaderboard (1 col) */}
          <div className="lg:col-span-1">
            <ScrollReveal delay={200}>
              <div className="bg-white rounded-3xl shadow-section p-5 sticky top-20">
                <h2 className="text-base font-bold text-brand-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
                  🏆 Bảng xếp hạng
                </h2>

                {results.leaderboard?.length > 0 ? (
                  <div className="space-y-1.5">
                    {results.leaderboard.map((entry) => {
                      const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null
                      return (
                        <div key={entry.rank}
                             className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all
                               ${entry.isMe ? 'bg-amber-50 border border-amber-200 ring-1 ring-amber-300' : 'hover:bg-gray-50'}`}>
                          {/* Rank */}
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0
                            ${entry.rank <= 3 ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-500'}`}>
                            {medal || entry.rank}
                          </span>
                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm truncate ${entry.isMe ? 'text-amber-800' : 'text-gray-800'}`}>
                              {entry.name} {entry.isMe && <span className="text-[10px] text-amber-500">(Bạn)</span>}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {entry.correctCount}/{entry.totalQuestions} đúng
                              {entry.timeSpent > 0 && ` • ${Math.floor(entry.timeSpent / 60)}p${entry.timeSpent % 60}s`}
                            </p>
                          </div>
                          {/* Score */}
                          <span className={`font-bold text-sm shrink-0 ${entry.rank <= 3 ? 'text-brand-700' : 'text-gray-600'}`}>
                            {entry.score}đ
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>Chưa có dữ liệu xếp hạng</p>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
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
          <p className="text-xs text-gray-400">
            {exam.questions?.length || 0} câu hỏi
            {exam.points_wrong > 0 && <span className="text-red-500 ml-2">• Sai trừ {exam.points_wrong} điểm</span>}
          </p>
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
              {q.image && <img src={q.image} alt="" className="max-h-56 rounded-lg border border-gray-200 mb-4 object-contain" />}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D', 'E'].map(opt => {
                  const optText = q[`option_${opt.toLowerCase()}`]
                  const optImg = q[`option_${opt.toLowerCase()}_image`]
                  if (!optText && !optImg) return null
                  return (
                    <button
                      key={opt}
                      onClick={() => selectAnswer(q.id, opt)}
                      className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium
                                  transition-all duration-200 flex flex-col gap-1
                                  ${answers[q.id] === opt
                                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                                    : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0
                                         ${answers[q.id] === opt ? 'border-brand-500 bg-brand-500 text-white' : 'border-gray-300'}`}>
                          {opt}
                        </span>
                        {optText && <span>{optText}</span>}
                      </div>
                      {optImg && <img src={optImg} alt="" className="max-h-32 rounded-lg object-contain mt-1 ml-8" />}
                    </button>
                  )
                })}
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
