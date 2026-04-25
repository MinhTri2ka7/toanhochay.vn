import { useState, useEffect } from 'react'

export default function AdminExamResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/exam-results', { credentials: 'include' })
      .then(r => r.json())
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Lịch sử thi thử</h1>

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
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{r.id}</td>
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
                    {r.time_spent ? `${Math.floor(r.time_spent / 60)}p ${r.time_spent % 60}s` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {r.completed_at ? new Date(r.completed_at).toLocaleString('vi-VN') : '—'}
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Chưa có kết quả thi nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
