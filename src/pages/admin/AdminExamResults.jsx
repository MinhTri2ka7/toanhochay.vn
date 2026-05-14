import { useState, useEffect } from 'react'
import { Download, Search, Trophy, Clock, CheckCircle, XCircle, Filter } from 'lucide-react'

// Export to Excel (CSV) — works without any library
function exportToExcel(results) {
  const BOM = '\uFEFF'
  const headers = ['#', 'Học sinh', 'Email', 'Đề thi', 'Điểm', 'Đúng', 'Tổng câu', 'Thời gian (giây)', 'Ngày làm']
  const rows = results.map((r, i) => [
    i + 1,
    r.student_name || 'Khách',
    r.student_email || '',
    r.exam_title || `Đề #${r.test_id}`,
    r.score,
    r.correct_count,
    r.total_questions,
    r.time_spent || 0,
    r.completed_at ? new Date(r.completed_at).toLocaleString('vi-VN') : '',
  ])
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `lich-su-thi-thu_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminExamResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterExam, setFilterExam] = useState('')

  useEffect(() => {
    fetch('/api/admin/exam-results', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setResults(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Unique exam titles for filter dropdown
  const examTitles = [...new Set(results.map(r => r.exam_title || `Đề #${r.test_id}`))].sort()

  // Filtered results
  const filtered = results.filter(r => {
    const matchSearch = !search ||
      (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.student_email || '').toLowerCase().includes(search.toLowerCase())
    const matchExam = !filterExam || (r.exam_title || `Đề #${r.test_id}`) === filterExam
    return matchSearch && matchExam
  })

  // Stats
  const avgScore = filtered.length
    ? (filtered.reduce((s, r) => s + (r.score || 0), 0) / filtered.length).toFixed(2)
    : 0
  const passCount = filtered.filter(r => r.score >= 5).length

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Lịch sử thi thử</h1>
          <span className="text-sm text-gray-400">{results.length} lượt thi</span>
        </div>
        <button
          onClick={() => exportToExcel(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
        >
          <Download size={16} /> Xuất Excel ({filtered.length})
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Lượt thi', value: filtered.length, icon: Trophy, color: 'bg-brand-50 text-brand-600' },
          { label: 'Điểm TB', value: avgScore, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Đạt (≥5)', value: passCount, icon: CheckCircle, color: 'bg-blue-50 text-blue-600' },
          { label: 'Chưa đạt', value: filtered.length - passCount, icon: XCircle, color: 'bg-red-50 text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm học sinh hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterExam}
            onChange={e => setFilterExam(e.target.value)}
            className="h-9 pl-9 pr-8 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none appearance-none bg-white min-w-[200px]"
          >
            <option value="">-- Tất cả đề thi --</option>
            {examTitles.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Học sinh</th>
                <th className="text-left px-4 py-3 font-semibold">Đề thi</th>
                <th className="text-center px-4 py-3 font-semibold">Điểm</th>
                <th className="text-center px-4 py-3 font-semibold">Đúng/Tổng</th>
                <th className="text-center px-4 py-3 font-semibold">Thời gian</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày làm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.student_name || 'Khách'}</p>
                    <p className="text-xs text-gray-400">{r.student_email || ''}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="line-clamp-1 font-medium">{r.exam_title || `Đề #${r.test_id}`}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                      ${r.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
                        r.score >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                      {r.score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{r.correct_count}/{r.total_questions}</td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    <span className="flex items-center justify-center gap-1">
                      <Clock size={12} />
                      {r.time_spent ? `${Math.floor(r.time_spent / 60)}p ${r.time_spent % 60}s` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {r.completed_at ? new Date(r.completed_at).toLocaleString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  {results.length === 0 ? 'Chưa có kết quả thi nào' : 'Không tìm thấy kết quả phù hợp'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
