import { useState, useEffect } from 'react'
import { Plus, X, Eye, EyeOff, Trash2, Star } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

const emptyForm = { student_name: '', content: '', image: '', score: '', type: 'feedback', sort_order: 0 }

export default function AdminFeedbacks() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadItems() }, [filter])

  async function loadItems() {
    setLoading(true)
    try {
      const r = await fetch(`/api/admin/feedbacks?type=${filter}`, { credentials: 'include' })
      setItems(await r.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate(type) {
    setEditing(null)
    setForm({ ...emptyForm, type })
    setError('')
    setShowModal(true)
  }

  function openEdit(item) {
    setEditing(item)
    setForm({
      student_name: item.student_name || '', content: item.content || '',
      image: item.image || '', score: item.score || '',
      type: item.type, sort_order: item.sort_order || 0,
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/admin/feedbacks/${editing.id}` : '/api/admin/feedbacks'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
      setShowModal(false)
      loadItems()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function toggleVisibility(id) {
    const r = await fetch(`/api/admin/feedbacks/${id}/toggle`, { method: 'PUT', credentials: 'include' })
    const data = await r.json()
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: data.status } : i))
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.')) return
    await fetch(`/api/admin/feedbacks/${id}`, { method: 'DELETE', credentials: 'include' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  const honors = items.filter(i => i.type === 'honor')
  const feedbacks = items.filter(i => i.type === 'feedback')
  const displayItems = filter === 'honor' ? honors : filter === 'feedback' ? feedbacks : items

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Vinh danh & Cảm nhận</h1>
        <div className="flex gap-2">
          <button onClick={() => openCreate('honor')} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
            <Star size={16} /> Thêm vinh danh
          </button>
          <button onClick={() => openCreate('feedback')} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
            <Plus size={16} /> Thêm cảm nhận
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[['all', 'Tất cả'], ['honor', 'Vinh danh'], ['feedback', 'Cảm nhận']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                    ${filter === key ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Loại</th>
                <th className="text-left px-4 py-3 font-semibold">Học sinh</th>
                <th className="text-left px-4 py-3 font-semibold">Nội dung / Thành tích</th>
                <th className="text-center px-4 py-3 font-semibold">Thứ tự</th>
                <th className="text-center px-4 py-3 font-semibold">Hiển thị</th>
                <th className="text-center px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${item.type === 'honor' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.type === 'honor' ? '🏆 Vinh danh' : '💬 Cảm nhận'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{item.student_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                    <p className="line-clamp-1">{item.type === 'honor' ? item.score : item.content || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">{item.sort_order}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleVisibility(item.id)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors
                              ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.status === 'active' ? <><Eye size={12} /> Hiện</> : <><EyeOff size={12} /> Ẩn</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(item)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">Sửa</button>
                      <button onClick={() => handleDelete(item.id)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayItems.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Chỉnh sửa' : form.type === 'honor' ? 'Thêm vinh danh' : 'Thêm cảm nhận'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên học sinh</label>
                <input type="text" value={form.student_name} onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))}
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              {form.type === 'honor' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thành tích</label>
                  <input type="text" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                         placeholder="VD: 9.8 Toán, Thủ khoa..."
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trích dẫn cảm nhận</label>
                  <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
                </div>
              )}
              <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} label="Ảnh (screenshot / bảng điểm)" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự ưu tiên (nhỏ = lên trước)</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))}
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
    </div>
  )
}
