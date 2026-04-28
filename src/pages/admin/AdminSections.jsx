import { useState, useEffect } from 'react'
import { Plus, X, GripVertical, Eye, EyeOff, BookCopy, LibraryBig, BookText, BookOpen } from 'lucide-react'

const iconOptions = [
  { value: 'LibraryBig', label: 'Khóa học', Icon: LibraryBig },
  { value: 'BookOpen', label: 'Luyện thi', Icon: BookOpen },
  { value: 'BookCopy', label: 'Combo', Icon: BookCopy },
  { value: 'BookText', label: 'Sách', Icon: BookText },
]

const emptyForm = {
  title: '', subtitle: '', product_type: 'course', category: '',
  icon: 'LibraryBig', sort_order: 0, status: 'active',
}

export default function AdminSections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadSections() }, [])

  async function loadSections() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/homepage-sections', { credentials: 'include' })
      setSections(await r.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  function openEdit(s) {
    setEditing(s)
    setForm({
      title: s.title, subtitle: s.subtitle || '', product_type: s.product_type,
      category: s.category || '', icon: s.icon || 'LibraryBig',
      sort_order: s.sort_order || 0, status: s.status || 'active',
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Tiêu đề không được để trống')
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/admin/homepage-sections/${editing.id}` : '/api/admin/homepage-sections'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
      setShowModal(false)
      loadSections()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function deleteSection(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa nhóm này?')) return
    await fetch(`/api/admin/homepage-sections/${id}`, { method: 'DELETE', credentials: 'include' })
    setSections(prev => prev.filter(s => s.id !== id))
  }

  async function toggleStatus(s) {
    const newStatus = s.status === 'active' ? 'hidden' : 'active'
    await fetch(`/api/admin/homepage-sections/${s.id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...s, status: newStatus }),
    })
    loadSections()
  }

  function getIcon(name) {
    const found = iconOptions.find(o => o.value === name)
    return found ? <found.Icon size={16} /> : <LibraryBig size={16} />
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý nhóm trang chủ</h1>
          <span className="text-sm text-gray-400">Tạo và sắp xếp các nhóm sản phẩm hiển thị trên trang chủ</span>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Thêm nhóm
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={s.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 transition-all ${s.status === 'hidden' ? 'opacity-50' : ''}`}>
            <GripVertical size={16} className="text-gray-300 shrink-0 cursor-grab" />
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
              {getIcon(s.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">{s.title}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{s.subtitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold
                  ${s.product_type === 'course' ? 'bg-blue-100 text-blue-700' :
                    s.product_type === 'combo' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'}`}>
                  {s.product_type === 'course' ? 'Khóa học' : s.product_type === 'combo' ? 'Combo' : 'Sách'}
                </span>
                {s.category && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                    {s.category}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">Thứ tự: {s.sort_order}</span>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button onClick={() => toggleStatus(s)} title={s.status === 'active' ? 'Ẩn' : 'Hiện'}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {s.status === 'active' ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button onClick={() => openEdit(s)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">Sửa</button>
              <button onClick={() => deleteSection(s.id)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200">Xóa</button>
            </div>
          </div>
        ))}
        {sections.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Chưa có nhóm nào. Bấm "Thêm nhóm" để tạo.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Sửa nhóm' : 'Thêm nhóm mới'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  placeholder="VD: KHÓA HỌC 2K7"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề</label>
                <input type="text" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  placeholder="VD: KHOÁ 2K7 - LUYỆN THI THPTQG 2025"
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại sản phẩm *</label>
                  <select value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="course">Khóa học</option>
                    <option value="combo">Combo</option>
                    <option value="book">Sách</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} min="0"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    {iconOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã danh mục (tùy chọn)</label>
                  <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="Để trống = tự tạo"
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
              </div>
              {editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="active">Hiển thị</option>
                    <option value="hidden">Ẩn</option>
                  </select>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <strong>Cách hoạt động:</strong> Sau khi tạo nhóm, vào trang quản lý Khóa học / Sách để gán sản phẩm vào nhóm này.
                Sản phẩm được gán vào nhóm sẽ hiển thị trên trang chủ theo thứ tự đã sắp xếp.
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
