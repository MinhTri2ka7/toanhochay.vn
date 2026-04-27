import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

const emptyForm = { name: '', slug: '', description: '', price: 0, old_price: 0, image: '', type: 'live', status: 'active', category: '' }

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
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
    </div>
  )
}
