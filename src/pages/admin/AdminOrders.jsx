import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    fetch('/api/admin/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p) }

  async function updateStatus(id, status) {
    if (status === 'cancelled' && !confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return
    await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý đơn hàng</h1>
          <span className="text-sm text-gray-400">{orders.length} đơn hàng</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="w-10 px-2"></th>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Khách hàng</th>
                <th className="text-left px-4 py-3 font-semibold">Mã CK</th>
                <th className="text-right px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="text-center px-4 py-3 font-semibold">SP</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-left px-4 py-3 font-semibold">Ngày</th>
                <th className="text-center px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(o => (
                <React.Fragment key={o.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-2 text-center">
                      {o.items && o.items.length > 0 && (
                        <button onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                                className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-gray-200 mx-auto">
                          {expandedOrder === o.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-400">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.name || o.user_name}</p>
                      <p className="text-xs text-gray-400">{o.email || o.user_email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brand-700">{o.payment_code}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(o.total_amount)}đ</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {o.items?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[o.status] || 'bg-gray-100'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-center">
                      {o.status === 'pending' && (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => updateStatus(o.id, 'paid')}
                                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                            ✓ Paid
                          </button>
                          <button onClick={() => updateStatus(o.id, 'cancelled')}
                                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-600 hover:bg-red-200">
                            ✗ Hủy
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {/* Expanded order items */}
                  {expandedOrder === o.id && o.items && o.items.length > 0 && (
                    <tr key={`${o.id}-items`}>
                      <td colSpan={9} className="bg-gray-50 px-8 py-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Sản phẩm đã mua:</p>
                        <div className="space-y-1">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold
                                  ${item.product_type === 'course' ? 'bg-blue-100 text-blue-700' :
                                    item.product_type === 'book' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-600'}`}>
                                  {item.product_type === 'course' ? 'Khóa học' : item.product_type === 'book' ? 'Sách' : item.product_type}
                                </span>
                                <span className="font-medium">{item.product_name}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>SL: {item.quantity}</span>
                                <span className="font-semibold text-gray-700">{formatPrice(item.price)}đ</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Chưa có đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
