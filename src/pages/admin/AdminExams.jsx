import { useState, useEffect } from 'react'
import { Plus, X, Trash2, ToggleLeft, ToggleRight, FileText, PenLine, List, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

const emptyExam = { title: '', subject: 'math', duration: 90, difficulty: 'medium', passcode: '', status: 'active', points_correct: 1, points_wrong: 0 }
const emptyQ = {
  question_type: 'multiple_choice', question_text: '', image: '',
  option_a: '', option_b: '', option_c: '', option_d: '', option_e: '',
  option_a_image: '', option_b_image: '', option_c_image: '', option_d_image: '', option_e_image: '',
  correct_answer: 'A', explanation: '', points_correct: 1, points_wrong: 0,
}

export default function AdminExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyExam)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Questions overlay
  const [qOverlayExam, setQOverlayExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loadingQ, setLoadingQ] = useState(false)
  const [showQModal, setShowQModal] = useState(false)
  const [qForm, setQForm] = useState(emptyQ)
  const [savingQ, setSavingQ] = useState(false)

  const diffColors = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-orange-100 text-orange-700',
    very_hard: 'bg-red-100 text-red-700',
  }

  useEffect(() => { loadExams() }, [])

  async function loadExams() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/exams', { credentials: 'include' })
      const data = await r.json()
      setExams(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() { setEditing(null); setForm(emptyExam); setError(''); setShowModal(true) }

  function openEdit(exam) {
    setEditing(exam)
    setForm({
      title: exam.title, subject: exam.subject, duration: exam.duration,
      difficulty: exam.difficulty, passcode: exam.passcode || '', status: exam.status,
      points_correct: exam.points_correct ?? 1, points_wrong: exam.points_wrong ?? 0,
    })
    setError(''); setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Tiêu đề không được để trống')
    setSaving(true); setError('')
    try {
      const url = editing ? `/api/admin/exams/${editing.id}` : '/api/admin/exams'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
      setShowModal(false); loadExams()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function toggleExam(id) {
    const r = await fetch(`/api/admin/exams/${id}/toggle`, { method: 'PUT', credentials: 'include' })
    const data = await r.json()
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: data.status } : e))
  }

  async function deleteExam(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này?')) return
    await fetch(`/api/admin/exams/${id}`, { method: 'DELETE', credentials: 'include' })
    setExams(prev => prev.filter(e => e.id !== id))
    if (qOverlayExam?.id === id) setQOverlayExam(null)
  }

  // Open questions overlay
  async function openQuestions(exam) {
    setQOverlayExam(exam)
    setLoadingQ(true)
    try {
      const r = await fetch(`/api/admin/exams/${exam.id}/questions`, { credentials: 'include' })
      const data = await r.json()
      setQuestions(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoadingQ(false) }
  }

  async function addQuestion(e) {
    e.preventDefault()
    if (!qForm.question_text.trim()) return
    setSavingQ(true)
    try {
      await fetch(`/api/admin/exams/${qOverlayExam.id}/questions`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qForm),
      })
      setShowQModal(false); setQForm(emptyQ)
      const r = await fetch(`/api/admin/exams/${qOverlayExam.id}/questions`, { credentials: 'include' })
      const data = await r.json()
      setQuestions(Array.isArray(data) ? data : [])
      loadExams()
    } catch (err) { console.error(err) }
    finally { setSavingQ(false) }
  }

  async function deleteQuestion(qId) {
    if (!confirm('Xóa câu hỏi này?')) return
    await fetch(`/api/admin/exams/${qOverlayExam.id}/questions/${qId}`, { method: 'DELETE', credentials: 'include' })
    setQuestions(prev => prev.filter(q => q.id !== qId))
    loadExams()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý đề thi</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Tạo đề thi
        </button>
      </div>

      {/* Exam list */}
      <div className="space-y-3">
        {exams.map(e => (
          <div key={e.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3">
              <button onClick={() => openQuestions(e)}
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 hover:bg-brand-100 hover:text-brand-700 transition-colors"
                      title="Xem câu hỏi">
                <List size={14} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm line-clamp-1">{e.title}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span>{e.duration} phút</span>
                  <span>•</span>
                  <span>{e.total_questions} câu</span>
                  <span>•</span>
                  <span className="text-emerald-600">+{e.points_correct ?? 1}</span>
                  {(e.points_wrong ?? 0) > 0 && <span className="text-red-500">−{e.points_wrong}</span>}
                  {e.passcode && <><span>•</span><span className="text-purple-600">🔒 Có mật khẩu</span></>}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${diffColors[e.difficulty] || 'bg-gray-100'}`}>
                {e.difficulty}
              </span>
              <button onClick={() => toggleExam(e.id)} title={e.status === 'active' ? 'Đang bật' : 'Đang tắt'} className="shrink-0">
                {e.status === 'active'
                  ? <ToggleRight size={28} className="text-emerald-500" />
                  : <ToggleLeft size={28} className="text-gray-300" />}
              </button>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(e)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">Sửa</button>
                <button onClick={() => deleteExam(e.id)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200">Xóa</button>
              </div>
            </div>
          </div>
        ))}
        {exams.length === 0 && <p className="text-center text-gray-400 py-12">Chưa có đề thi nào</p>}
      </div>

      {/* =====================================================
          QUESTIONS OVERLAY
          ===================================================== */}
      {qOverlayExam && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setQOverlayExam(null)} />
          <div className="ml-auto relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col"
               style={{ animation: 'slideDrawerIn 0.25s ease-out' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Câu hỏi đề thi</h2>
                <p className="text-sm text-gray-500 line-clamp-1">{qOverlayExam.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setQForm({...emptyQ, points_correct: qOverlayExam.points_correct ?? 1, points_wrong: qOverlayExam.points_wrong ?? 0}); setShowQModal(true) }}
                        className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700">
                  <Plus size={12} /> Thêm câu hỏi
                </button>
                <button onClick={() => setQOverlayExam(null)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Question list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {loadingQ ? (
                <div className="text-center py-12"><div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : questions.length === 0 ? (
                <div className="text-center py-16">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400">Chưa có câu hỏi nào</p>
                  <button onClick={() => { setQForm({...emptyQ, points_correct: qOverlayExam.points_correct ?? 1, points_wrong: qOverlayExam.points_wrong ?? 0}); setShowQModal(true) }}
                          className="mt-3 text-sm text-brand-600 font-semibold hover:underline">
                    + Thêm câu hỏi đầu tiên
                  </button>
                </div>
              ) : questions.map((q, idx) => (
                <div key={q.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">Câu {idx + 1}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold
                          ${q.question_type === 'essay' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {q.question_type === 'essay' ? '✏️ Tự luận' : '📝 Trắc nghiệm'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">+{q.points_correct ?? 1}</span>
                        {(q.points_wrong ?? 0) > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">−{q.points_wrong}</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{q.question_text}</p>
                    </div>
                    <button onClick={() => deleteQuestion(q.id)} className="shrink-0 text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Question image */}
                  {q.image && (
                    <div className="mt-2">
                      <img src={q.image} alt="Question" className="max-h-40 rounded-lg border border-gray-200 object-contain" />
                    </div>
                  )}

                  {/* Options (only for multiple choice) */}
                  {q.question_type !== 'essay' && (
                    <div className="grid grid-cols-2 gap-1.5 mt-3">
                      {['A', 'B', 'C', 'D', 'E'].map(opt => {
                        const val = q[`option_${opt.toLowerCase()}`]
                        const img = q[`option_${opt.toLowerCase()}_image`]
                        if (!val && !img) return null
                        return (
                          <div key={opt} className={`px-2.5 py-1.5 rounded-lg text-xs border
                            ${q.correct_answer === opt
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                              : 'bg-white border-gray-200 text-gray-600'}`}>
                            <span className="font-bold">{opt}.</span> {val}
                            {img && <img src={img} alt={`Option ${opt}`} className="mt-1 max-h-16 rounded object-contain" />}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Explanation */}
                  {q.explanation && (
                    <p className="text-xs text-gray-400 mt-2 italic">💡 {q.explanation}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Footer stats */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 flex items-center justify-between shrink-0">
              <span>Tổng: {questions.length} câu hỏi</span>
              <span>
                {questions.filter(q => q.question_type !== 'essay').length} trắc nghiệm • {questions.filter(q => q.question_type === 'essay').length} tự luận
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={ev => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Sửa đề thi' : 'Tạo đề thi mới'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian (phút)</label>
                  <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: +e.target.value }))} min="1"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
                  <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                    <option value="very_hard">Rất khó</option>
                  </select>
                </div>
              </div>

              {/* Scoring config */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-2">⚡ Cấu hình điểm</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Đúng được (+)</label>
                    <input type="number" value={form.points_correct} onChange={e => setForm(f => ({ ...f, points_correct: +e.target.value }))}
                           min="0" step="0.25"
                           className="w-full h-9 px-3 rounded-lg border border-blue-200 text-sm bg-white focus:border-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-red-600 mb-1">Sai bị trừ (−)</label>
                    <input type="number" value={form.points_wrong} onChange={e => setForm(f => ({ ...f, points_wrong: +e.target.value }))}
                           min="0" step="0.25"
                           className="w-full h-9 px-3 rounded-lg border border-red-200 text-sm bg-white focus:border-brand-500 outline-none" />
                  </div>
                </div>
                <p className="text-[11px] text-blue-600 mt-2">
                  VD: Đúng +1, Sai −0.25 → Trả lời đúng 8/10 câu = 8×1 − 2×0.25 = <strong>7.5 điểm</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu đề thi (để trống = công khai)</label>
                <input type="text" value={form.passcode} onChange={e => setForm(f => ({ ...f, passcode: e.target.value }))}
                       placeholder="VD: THPT2025"
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <button type="submit" disabled={saving}
                      className="w-full h-10 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo mới')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showQModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowQModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={ev => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Thêm câu hỏi</h2>
              <button onClick={() => setShowQModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={addQuestion} className="space-y-3">
              {/* Question type toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại câu hỏi</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setQForm(f => ({ ...f, question_type: 'multiple_choice' }))}
                          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold border-2 transition-all
                            ${qForm.question_type === 'multiple_choice'
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <PenLine size={14} /> Trắc nghiệm
                  </button>
                  <button type="button" onClick={() => setQForm(f => ({ ...f, question_type: 'essay' }))}
                          className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold border-2 transition-all
                            ${qForm.question_type === 'essay'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <FileText size={14} /> Tự luận
                  </button>
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi *</label>
                <textarea value={qForm.question_text} onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} rows={3} required
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
              </div>

              {/* Image upload */}
              <ImageUpload value={qForm.image} onChange={v => setQForm(f => ({ ...f, image: v }))} label="Ảnh đính kèm câu hỏi (tuỳ chọn)" />

              {/* Multiple choice options */}
              {qForm.question_type === 'multiple_choice' && (
                <>
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D', 'E'].map(opt => {
                      const key = opt.toLowerCase()
                      return (
                        <div key={opt} className={`rounded-xl border-2 p-3 transition-all
                          ${qForm.correct_answer === opt ? 'border-emerald-400 bg-emerald-50/50' : 'border-gray-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <button type="button" onClick={() => setQForm(f => ({ ...f, correct_answer: opt }))}
                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all
                                      ${qForm.correct_answer === opt
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : 'border-gray-300 text-gray-400 hover:border-gray-400'}`}>
                              {opt}
                            </button>
                            <input type="text" value={qForm[`option_${key}`]}
                                   onChange={e => setQForm(f => ({ ...f, [`option_${key}`]: e.target.value }))}
                                   placeholder={`Nội dung đáp án ${opt}`}
                                   className="flex-1 h-8 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                          </div>
                          {/* Option image upload */}
                          <ImageUpload
                            value={qForm[`option_${key}_image`]}
                            onChange={v => setQForm(f => ({ ...f, [`option_${key}_image`]: v }))}
                            label={`Ảnh đáp án ${opt} (tuỳ chọn)`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-xs text-gray-400">Bấm vào chữ cái (A/B/C/D/E) để chọn đáp án đúng. Đáp án E là tuỳ chọn. Ảnh đáp án là tuỳ chọn.</p>
                </>
              )}

              {/* Per-question scoring */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-amber-800 mb-2">⚡ Điểm cho câu này</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-emerald-700 mb-1">Đúng được (+)</label>
                    <input type="number" value={qForm.points_correct} onChange={e => setQForm(f => ({ ...f, points_correct: +e.target.value }))}
                           min="0" step="0.25"
                           className="w-full h-8 px-3 rounded-lg border border-amber-200 text-sm bg-white focus:border-brand-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-red-600 mb-1">Sai bị trừ (−)</label>
                    <input type="number" value={qForm.points_wrong} onChange={e => setQForm(f => ({ ...f, points_wrong: +e.target.value }))}
                           min="0" step="0.25"
                           className="w-full h-8 px-3 rounded-lg border border-amber-200 text-sm bg-white focus:border-brand-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {qForm.question_type === 'essay' ? 'Đáp án mẫu / Hướng dẫn chấm' : 'Giải thích'}
                </label>
                <textarea value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
              </div>

              <button type="submit" disabled={savingQ}
                      className="w-full h-10 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {savingQ ? 'Đang lưu...' : 'Thêm câu hỏi'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
