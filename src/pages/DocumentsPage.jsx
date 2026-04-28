import { useState, useEffect } from 'react'
import { FileText, Download, Eye, FolderOpen, Loader2, Search, File, Image, Film, BookOpen } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleView(doc) {
    // Track download
    fetch(`/api/documents/${doc.id}/download`, { method: 'POST', credentials: 'include' }).catch(() => {})
    // Update UI
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d))
    if (doc.file_url) window.open(doc.file_url, '_blank')
  }

  // Get categories
  const categories = ['all', ...new Set(documents.map(d => d.category).filter(Boolean))]
  
  // Filter
  const filtered = documents.filter(d => {
    const matchSearch = !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'all' || d.category === activeCategory
    return matchSearch && matchCat
  })

  // File type icon & color
  function getFileStyle(type) {
    const t = (type || '').toUpperCase()
    if (t === 'PDF') return { icon: FileText, bg: 'bg-red-100', text: 'text-red-600', badge: 'bg-red-500' }
    if (t === 'DOC' || t === 'DOCX') return { icon: File, bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-500' }
    if (t === 'XLS' || t === 'XLSX') return { icon: BookOpen, bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-500' }
    if (t === 'PPT' || t === 'PPTX') return { icon: Film, bg: 'bg-orange-100', text: 'text-orange-600', badge: 'bg-orange-500' }
    if (t === 'VIDEO') return { icon: Film, bg: 'bg-purple-100', text: 'text-purple-600', badge: 'bg-purple-500' }
    if (['JPG', 'PNG', 'WEBP', 'GIF'].includes(t)) return { icon: Image, bg: 'bg-pink-100', text: 'text-pink-600', badge: 'bg-pink-500' }
    return { icon: FileText, bg: 'bg-gray-100', text: 'text-gray-600', badge: 'bg-gray-500' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="mt-6 mb-12 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Hero Banner */}
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl mb-8"
             style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)' }}>
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative px-8 py-10 md:py-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FolderOpen size={28} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2"
                style={{ fontFamily: 'var(--font-heading)' }}>
              📚 Kho tài liệu học tập
            </h1>
            <p className="text-white/80 text-sm md:text-base max-w-lg mx-auto">
              Tải miễn phí các tài liệu, đề cương, bài tập chất lượng cao
            </p>
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold">
                <FileText size={16} /> {documents.length} tài liệu có sẵn
              </span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Search + Filter bar */}
      <ScrollReveal delay={100}>
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm tài liệu..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 text-sm
                           focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
              />
            </div>
            {/* Category tabs */}
            {categories.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                          className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-all
                            ${activeCategory === cat
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700'}`}>
                    {cat === 'all' ? 'Tất cả' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Documents grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FolderOpen size={56} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">
            {search ? 'Không tìm thấy tài liệu phù hợp' : 'Chưa có tài liệu nào'}
          </p>
          {search && (
            <button onClick={() => setSearch('')}
                    className="mt-3 text-sm text-amber-600 hover:underline">
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc, i) => {
            const style = getFileStyle(doc.file_type)
            const Icon = style.icon
            return (
              <ScrollReveal key={doc.id} delay={i * 60}>
                <div className="bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-300
                                hover:shadow-lg hover:-translate-y-0.5 group cursor-pointer border border-gray-100"
                     onClick={() => handleView(doc)}>
                  {/* Top color strip */}
                  <div className="h-1.5"
                       style={{ background: `linear-gradient(90deg, #f59e0b, #f97316)` }} />

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* File icon */}
                      <div className={`w-14 h-14 rounded-2xl ${style.bg} flex items-center justify-center shrink-0
                                       group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={24} className={style.text} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-sm lg:text-base mb-1.5
                                       group-hover:text-amber-700 transition-colors">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">{doc.description}</p>
                        )}

                        {/* Tags row */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-white ${style.badge}`}>
                            {doc.file_type || 'FILE'}
                          </span>
                          {doc.pages > 0 && (
                            <span className="text-[11px] text-gray-400">{doc.pages} trang</span>
                          )}
                          {doc.category && doc.category !== 'general' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold">
                              {doc.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Download size={12} />
                        {(doc.downloads || 0).toLocaleString()} lượt tải
                      </span>
                      <button className="inline-flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-bold
                                         bg-gradient-to-r from-amber-500 to-orange-500 text-white
                                         shadow-sm group-hover:shadow-md
                                         transition-all duration-200"
                              onClick={e => { e.stopPropagation(); handleView(doc) }}>
                        <Eye size={13} /> Xem / Tải
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
