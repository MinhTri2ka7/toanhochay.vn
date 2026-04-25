import { useState, useEffect } from 'react'
import { Plus, X, Trash2, FileText, Edit, ExternalLink } from 'lucide-react'

const emptyDoc = { title: '', description: '', file_url: '', file_type: 'PDF', pages: 0, category: 'general', status: 'active' }

export default function AdminDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyDoc)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/documents', { credentials: 'include' })
      const data = await r.json()
      setDocs(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function openCreate() { setEditing(null); setForm(emptyDoc); setError(''); setShowModal(true) }

  function openEdit(doc) {
    setEditing(doc)
    setForm({
      title: doc.title, description: doc.description || '', file_url: doc.file_url || '',
      file_type: doc.file_type || 'PDF', pages: doc.pages || 0, category: doc.category || 'general',
      status: doc.status || 'active',
    })
    setError(''); setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) return setError('Tiêu đề không được để trống')
    setSaving(true); setError('')
    try {
      const url = editing ? `/api/admin/documents/${editing.id}` : '/api/admin/documents'
      const method = editing ? 'PUT' : 'POST'
      const r = await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error) }
      setShowModal(false); loadDocs()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function deleteDoc(id) {
    if (!confirm('Xóa tài liệu này?')) return
    await fetch(`/api/admin/documents/${id}`, { method: 'DELETE', credentials: 'include' })
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý tài liệu</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Thêm tài liệu
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">#</th>
              <th className="text-left px-4 py-3 font-semibold">Tiêu đề</th>
              <th className="text-left px-4 py-3 font-semibold">Loại</th>
              <th className="text-left px-4 py-3 font-semibold">Danh mục</th>
              <th className="text-center px-4 py-3 font-semibold">Trang</th>
              <th className="text-center px-4 py-3 font-semibold">Lượt tải</th>
              <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
              <th className="text-right px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {docs.map((doc, idx) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 font-mono">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">{doc.title}</p>
                      {doc.description && <p className="text-xs text-gray-400 line-clamp-1">{doc.description}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-600">{doc.file_type}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{doc.category}</td>
                <td className="px-4 py-3 text-center text-xs">{doc.pages}</td>
                <td className="px-4 py-3 text-center text-xs font-semibold text-brand-700">{doc.downloads?.toLocaleString()}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${doc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {doc.status === 'active' ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-1 justify-end">
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                         className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteDoc(doc.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 py-12">Chưa có tài liệu nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={ev => ev.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X size={18} /></button>
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link tài liệu (URL / Google Drive)</label>
                <input type="text" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))}
                       placeholder="https://drive.google.com/..."
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại file</label>
                  <select value={form.file_type} onChange={e => setForm(f => ({ ...f, file_type: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="PDF">PDF</option>
                    <option value="DOC">DOC</option>
                    <option value="XLS">XLS</option>
                    <option value="PPT">PPT</option>
                    <option value="VIDEO">VIDEO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số trang</label>
                  <input type="number" value={form.pages} onChange={e => setForm(f => ({ ...f, pages: +e.target.value }))} min="0"
                         className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none">
                    <option value="active">Hiện</option>
                    <option value="draft">Ẩn</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                       placeholder="VD: Chuyên đề, Đề cương, Bài tập..."
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
              <button type="submit" disabled={saving}
                      className="w-full h-10 rounded-xl font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm mới')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
