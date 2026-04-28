import { useState, useEffect } from 'react'
import { Plus, X, Trash2, GripVertical, Eye, EyeOff, Play, FileText, ChevronUp, ChevronDown } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

const emptyForm = { name: '', slug: '', description: '', price: 0, old_price: 0, image: '', type: 'live', status: 'active', category: '' }
const emptyLesson = { title: '', description: '', video_url: '', is_preview: false, status: 'active', duration: 0 }

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  // Lessons state
  const [lessonCourse, setLessonCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [lessonForm, setLessonForm] = useState(emptyLesson)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [savingLesson, setSavingLesson] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => { loadCourses(); loadCategories() }, [])

  async function loadCourses() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/courses', { credentials: 'include' })
      setCourses(await r.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadCategories() {
    try {
      const r = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await r.json()
      // Show course and combo sections (courses can belong to either)
      setCategories(data.filter(c => c.product_type === 'course' || c.product_type === 'combo'))
    } catch (e) { console.error(e) }
  }

  function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p) }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  function openEdit(c) {
    setEditing(c)
    setForm({
      name: c.name, slug: c.slug, description: c.description || '',
      price: c.price, old_price: c.old_price, image: c.image || '',
      type: c.type || 'live', status: c.status || 'active', category: c.category || '',
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Tên khóa học không được để trống')
    if (form.price < 0) return setError('Giá không được âm')
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/admin/courses/${editing.id}` : '/api/admin/courses'
      const method = editing ? 'PUT' : 'POST'
      const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
      setShowModal(false)
      loadCourses()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function deleteCourse(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này? Hành động này không thể hoàn tác.')) return
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE', credentials: 'include' })
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý khóa học</h1>
          <span className="text-sm text-gray-400">{courses.length} khóa học</span>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Thêm khóa học
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Tên</th>
                <th className="text-left px-4 py-3 font-semibold">Slug</th>
                <th className="text-center px-4 py-3 font-semibold">Nhóm</th>
                <th className="text-right px-4 py-3 font-semibold">Giá</th>
                <th className="text-center px-4 py-3 font-semibold">Loại</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="font-medium line-clamp-1">{c.name}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3 text-center">
                    {c.category ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                        {categories.find(cat => cat.category === c.category)?.title || c.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-700">{formatPrice(c.price)}đ</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{c.type}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${c.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openLessons(c)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-1"><Play size={10} /> Bài học</button>
                      <button onClick={() => openEdit(c)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">Sửa</button>
                      <button onClick={() => deleteCourse(c.id)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Sửa khóa học' : 'Thêm khóa học mới'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                       placeholder="Tự tạo nếu để trống"
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} min="0"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                  <input type="number" value={form.old_price} onChange={e => setForm(f => ({ ...f, old_price: +e.target.value }))} min="0"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="live">Live</option>
                    <option value="video">Video</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm trang chủ</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                  <option value="">-- Không thuộc nhóm nào --</option>
                  {categories.map(c => (
                    <option key={c.category} value={c.category}>
                      {c.title} {c.product_type === 'combo' ? '(Combo)' : '(Khóa học)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Chọn nhóm để khóa học hiển thị trên trang chủ</p>
                {categories.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">⚠ Chưa có nhóm nào. Hãy tạo nhóm trang chủ trước.</p>
                )}
              </div>
              <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} label="Ảnh thumbnail" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả lộ trình học</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
              </div>
              <button type="submit" disabled={saving}
                      className="w-full h-10 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Tạo mới')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LESSONS OVERLAY */}
      {lessonCourse && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLessonCourse(null)} />
          <div className="relative ml-auto w-full max-w-lg bg-white shadow-2xl flex flex-col h-full"
               style={{ animation: 'slideDrawerIn 0.25s ease-out' }}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Quản lý bài học</h2>
                <p className="text-sm text-gray-500 line-clamp-1">{lessonCourse.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setLessonForm(emptyLesson); setEditingLesson(null); setShowLessonModal(true) }}
                        className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700">
                  <Plus size={12} /> Thêm bài học
                </button>
                <button onClick={() => setLessonCourse(null)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {loadingLessons ? (
                <div className="text-center py-12"><div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-16">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400">Chưa có bài học nào</p>
                  <button onClick={() => { setLessonForm(emptyLesson); setEditingLesson(null); setShowLessonModal(true) }}
                          className="mt-3 text-sm text-brand-600 font-semibold hover:underline">
                    + Thêm bài học đầu tiên
                  </button>
                </div>
              ) : lessons.map((l, idx) => (
                <div key={l.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">{idx + 1}.</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${l.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {l.status === 'active' ? 'Hiện' : 'Ẩn'}
                        </span>
                        {l.is_preview && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">Preview</span>}
                        {l.video_url && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-600">▶ Video</span>}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{l.title}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {idx > 0 && <button onClick={() => moveLesson(idx, idx - 1)} className="p-1 text-gray-400 hover:text-gray-600"><ChevronUp size={14} /></button>}
                      {idx < lessons.length - 1 && <button onClick={() => moveLesson(idx, idx + 1)} className="p-1 text-gray-400 hover:text-gray-600"><ChevronDown size={14} /></button>}
                      <button onClick={() => openEditLesson(l)} className="px-2 py-1 rounded text-xs font-semibold text-blue-600 hover:bg-blue-50">Sửa</button>
                      <button onClick={() => deleteLesson(l.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LESSON CREATE/EDIT MODAL */}
      {showLessonModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowLessonModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}</h3>
            <form onSubmit={saveLesson} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài học *</label>
                <input value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} required
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video URL</label>
                <input value={lessonForm.video_url} onChange={e => setLessonForm(f => ({ ...f, video_url: e.target.value }))}
                       placeholder="https://www.youtube.com/watch?v=..."
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                <p className="text-xs text-gray-400 mt-1">Hỗ trợ: youtube.com/watch?v=..., youtu.be/..., embed URL</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Nội dung</label>
                <textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))} rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng (phút)</label>
                  <input type="number" value={Math.round(lessonForm.duration / 60)} onChange={e => setLessonForm(f => ({ ...f, duration: (+e.target.value) * 60 }))} min="0"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={lessonForm.status} onChange={e => setLessonForm(f => ({ ...f, status: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm">
                    <option value="active">Hiện</option>
                    <option value="hidden">Ẩn</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={lessonForm.is_preview} onChange={e => setLessonForm(f => ({ ...f, is_preview: e.target.checked }))} className="rounded" />
                <span className="text-sm text-gray-700">Cho xem thử (không cần mua)</span>
              </label>
              <button type="submit" disabled={savingLesson}
                      className="w-full h-10 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {savingLesson ? 'Đang lưu...' : (editingLesson ? 'Cập nhật' : 'Thêm bài học')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  // ============================================
  // LESSON FUNCTIONS
  // ============================================
  async function openLessons(course) {
    setLessonCourse(course)
    setLoadingLessons(true)
    try {
      const r = await fetch(`/api/admin/courses/${course.id}/lessons`, { credentials: 'include' })
      setLessons(await r.json())
    } catch (e) { console.error(e) }
    finally { setLoadingLessons(false) }
  }

  function openEditLesson(l) {
    setEditingLesson(l)
    setLessonForm({ title: l.title, description: l.description || '', video_url: l.video_url || '', is_preview: l.is_preview || false, status: l.status || 'active', duration: l.duration || 0 })
    setShowLessonModal(true)
  }

  async function saveLesson(e) {
    e.preventDefault()
    if (!lessonForm.title.trim()) return
    setSavingLesson(true)
    try {
      let res
      if (editingLesson) {
        res = await fetch(`/api/admin/lessons/${editingLesson.id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lessonForm) })
      } else {
        res = await fetch(`/api/admin/courses/${lessonCourse.id}/lessons`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lessonForm) })
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Lỗi khi lưu bài học')
      }
      setShowLessonModal(false)
      setEditingLesson(null)
      setLessonForm(emptyLesson)
      // Reload lessons
      const r = await fetch(`/api/admin/courses/${lessonCourse.id}/lessons`, { credentials: 'include' })
      setLessons(await r.json())
    } catch (e) {
      console.error(e)
      alert(e.message || 'Có lỗi xảy ra khi lưu bài học')
    }
    finally { setSavingLesson(false) }
  }

  async function deleteLesson(id) {
    if (!confirm('Xóa bài học này?')) return
    try {
      await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE', credentials: 'include' })
      setLessons(prev => prev.filter(l => l.id !== id))
    } catch (e) { console.error(e) }
  }

  async function moveLesson(fromIdx, toIdx) {
    const newLessons = [...lessons]
    const [moved] = newLessons.splice(fromIdx, 1)
    newLessons.splice(toIdx, 0, moved)
    setLessons(newLessons)
    try {
      await fetch(`/api/admin/courses/${lessonCourse.id}/lessons/reorder`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newLessons.map(l => l.id) }),
      })
    } catch (e) { console.error(e) }
  }
}
