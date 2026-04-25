import { useState, useEffect } from 'react'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/transactions', { credentials: 'include' })
      .then(r => r.json())
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p || 0) }

  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Lịch sử giao dịch</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Mã đơn</th>
                <th className="text-left px-4 py-3 font-semibold">Khách hàng</th>
                <th className="text-center px-4 py-3 font-semibold">Phương thức</th>
                <th className="text-right px-4 py-3 font-semibold">Số tiền</th>
                <th className="text-center px-4 py-3 font-semibold">Mã GD</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{t.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-700">{t.payment_code || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{t.customer_name || '—'}</p>
                    <p className="text-xs text-gray-400">{t.customer_email || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      {t.method === 'sepay' ? 'SePay' : t.method === 'manual' ? 'Thủ công' : t.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(t.amount)}đ</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-gray-500">{t.transaction_id || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[t.status] || 'bg-gray-100'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleString('vi-VN') : '—'}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Chưa có giao dịch nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
