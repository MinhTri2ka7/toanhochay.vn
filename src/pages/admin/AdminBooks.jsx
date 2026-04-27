import { useState, useEffect } from 'react'
import { Plus, X, Package } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p) }

const emptyForm = { name: '', description: '', price: 0, old_price: 0, image: '', stock: 0, status: 'active', category: '' }

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => { loadBooks(); loadCategories() }, [])

  async function loadBooks() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/books', { credentials: 'include' })
      setBooks(await r.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function loadCategories() {
    try {
      const r = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await r.json()
      setCategories(data.filter(c => c.product_type === 'book'))
    } catch (e) { console.error(e) }
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  function openEdit(book) {
    setEditing(book)
    setForm({
      name: book.name, description: book.description || '', price: book.price,
      old_price: book.old_price, image: book.image || '', stock: book.stock || 0,
      status: book.status, category: book.category || '',
    })
    setError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Tên sách không được để trống')
    if (form.price < 0) return setError('Giá không được âm')
    setSaving(true)
    setError('')
    try {
      const url = editing ? `/api/admin/books/${editing.id}` : '/api/admin/books'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
      setShowModal(false)
      loadBooks()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa sách này? Hành động này không thể hoàn tác.')) return
    await fetch(`/api/admin/books/${id}`, { method: 'DELETE', credentials: 'include' })
    setBooks(prev => prev.filter(b => b.id !== id))
  }

  async function updateStock(id, stock) {
    await fetch(`/api/admin/books/${id}/stock`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: Math.max(0, stock) }),
    })
    setBooks(prev => prev.map(b => b.id === id ? { ...b, stock: Math.max(0, stock) } : b))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý sách</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Thêm sách
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Tên sách</th>
                <th className="text-center px-4 py-3 font-semibold">Nhóm</th>
                <th className="text-right px-4 py-3 font-semibold">Giá</th>
                <th className="text-center px-4 py-3 font-semibold">Tồn kho</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-[250px]">
                    <p className="font-medium line-clamp-1">{b.name}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {b.category ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">{b.category}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-700">{formatPrice(b.price)}đ</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => updateStock(b.id, (b.stock || 0) - 1)}
                              className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center text-xs hover:bg-gray-200">−</button>
                      <span className={`min-w-[32px] text-center font-semibold ${b.stock <= 0 ? 'text-red-500' : ''}`}>
                        {b.stock || 0}
                      </span>
                      <button onClick={() => updateStock(b.id, (b.stock || 0) + 1)}
                              className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center text-xs hover:bg-gray-200">+</button>
                    </div>
                    {b.stock <= 0 && <span className="text-xs text-red-500 font-semibold">Hết hàng</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${b.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => openEdit(b)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">Sửa</button>
                      <button onClick={() => handleDelete(b.id)} className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Chưa có sách nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Sửa sách' : 'Thêm sách mới'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} min="0"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc</label>
                  <input type="number" value={form.old_price} onChange={e => setForm(f => ({ ...f, old_price: +e.target.value }))} min="0"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))} min="0"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm trang chủ</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                  <option value="">-- Không thuộc nhóm nào --</option>
                  {categories.map(c => (
                    <option key={c.category} value={c.category}>{c.title}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Chọn nhóm để sách hiển thị trên trang chủ</p>
              </div>
              <ImageUpload value={form.image} onChange={v => setForm(f => ({ ...f, image: v }))} label="Ảnh bìa" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none resize-none" />
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
