import { useState, useEffect, useMemo } from 'react'
import { Users, ShoppingCart, DollarSign, BookOpen, Clock, TrendingUp, BarChart3, Calendar } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function formatPrice(p) { return new Intl.NumberFormat('vi-VN').format(p || 0) }

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function toDateStr(date) { return date.toISOString().split('T')[0] }

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayOrders, setDayOrders] = useState([])
  const [dayLoading, setDayLoading] = useState(false)

  // Date range state — custom dates
  const [fromDate, setFromDate] = useState(toDateStr(new Date(Date.now() - 12 * 86400000)))
  const [toDate, setToDate] = useState(toDateStr(new Date()))
  const [activePreset, setActivePreset] = useState(null)

  function applyPreset(days) {
    const end = toDateStr(new Date())
    const start = toDateStr(new Date(Date.now() - days * 86400000))
    setFromDate(start)
    setToDate(end)
    setActivePreset(days)
  }

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!fromDate || !toDate) return
    setChartLoading(true)
    fetch(`/api/admin/revenue-chart?from=${fromDate}&to=${toDate}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setChartData(Array.isArray(data) ? data : [])
        setSelectedDay(null)
        setDayOrders([])
      })
      .catch(console.error)
      .finally(() => setChartLoading(false))
  }, [fromDate, toDate])

  // Fill missing days
  const filledData = useMemo(() => {
    const map = new Map(chartData.map(d => [d.day, d]))
    const days = []
    const start = new Date(fromDate + 'T00:00:00')
    const end = new Date(toDate + 'T00:00:00')
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      days.push(map.get(key) || { day: key, revenue: 0, order_count: 0 })
    }
    return days
  }, [chartData, fromDate, toDate])

  const maxRevenue = Math.max(...filledData.map(d => d.revenue), 1)

  async function handleBarClick(day) {
    if (selectedDay === day) { setSelectedDay(null); setDayOrders([]); return }
    setSelectedDay(day)
    setDayLoading(true)
    try {
      const r = await fetch(`/api/admin/orders-by-day?day=${day}`, { credentials: 'include' })
      const data = await r.json()
      setDayOrders(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setDayLoading(false) }
  }

  const yLabels = useMemo(() => {
    const steps = 4
    return Array.from({ length: steps + 1 }, (_, i) => Math.round((maxRevenue / steps) * (steps - i)))
  }, [maxRevenue])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  const totalFiltered = filledData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = filledData.reduce((s, d) => s + d.order_count, 0)
  const avgPerOrder = totalOrders > 0 ? Math.round(totalFiltered / totalOrders) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard icon={DollarSign} label="Hôm nay" value={`${formatPrice(stats?.todayRevenue)}đ`} sub={`${stats?.todayOrders || 0} đơn`} color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label="Tháng này" value={`${formatPrice(stats?.monthRevenue)}đ`} sub={`${stats?.monthOrders || 0} đơn`} color="bg-blue-500" />
        <StatCard icon={ShoppingCart} label="Tổng (lọc)" value={`${formatPrice(totalFiltered)}đ`} sub={`${totalOrders} đơn`} color="bg-purple-500" />
        <StatCard icon={BookOpen} label="TB / đơn" value={`${formatPrice(avgPerOrder)}đ`} sub="giá trị trung bình" color="bg-amber-500" />
        <StatCard icon={Clock} label="Chờ xử lý" value={stats?.pendingOrders || 0} sub="đơn pending" color="bg-red-500" />
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header: date pickers + preset buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-600" />
            Biểu đồ doanh thu
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date range picker */}
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar size={14} className="text-gray-400" />
              <span className="text-gray-500 text-xs">Từ</span>
              <input type="date" value={fromDate}
                onChange={e => { setFromDate(e.target.value); setActivePreset(null) }}
                className="h-8 px-2 rounded-lg border border-gray-200 text-xs focus:border-brand-500 outline-none" />
              <span className="text-gray-500 text-xs">Đến</span>
              <input type="date" value={toDate}
                onChange={e => { setToDate(e.target.value); setActivePreset(null) }}
                className="h-8 px-2 rounded-lg border border-gray-200 text-xs focus:border-brand-500 outline-none" />
            </div>

            {/* Preset buttons */}
            <div className="flex gap-1">
              {[
                [7, '7 ngày'], [30, '30 ngày'], [90, '90 ngày'], [365, '1 năm'],
              ].map(([days, label]) => (
                <button key={days} onClick={() => applyPreset(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                    ${activePreset === days ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Click vào cột để xem danh sách đơn hàng chi tiết
        </p>

        {chartLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="relative">
            <div className="flex">
              {/* Y-axis */}
              <div className="flex flex-col justify-between text-xs text-gray-400 pr-3 py-1" style={{ height: 220 }}>
                {yLabels.map((v, i) => (
                  <span key={i} className="text-right min-w-[70px]">{formatPrice(v)}đ</span>
                ))}
              </div>

              {/* Bars */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex items-end gap-1" style={{ height: 220, minWidth: filledData.length * 48 }}>
                  {filledData.map(d => {
                    const h = maxRevenue > 0 ? (d.revenue / maxRevenue) * 200 : 0
                    const isSelected = selectedDay === d.day
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center min-w-[36px] group"
                           onClick={() => handleBarClick(d.day)}>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-center mb-1 pointer-events-none whitespace-nowrap">
                          <span className="bg-gray-800 text-white px-2 py-1 rounded-lg text-[10px] font-semibold">
                            {formatPrice(d.revenue)}đ ({d.order_count} đơn)
                          </span>
                        </div>
                        <div
                          className={`w-full max-w-[32px] rounded-t-md transition-all duration-200 
                            ${isSelected ? 'bg-brand-600' : 'bg-gray-300 group-hover:bg-brand-400'}`}
                          style={{ height: Math.max(h, d.revenue > 0 ? 4 : 2) }}
                        />
                        <span className={`text-[10px] mt-2 font-medium ${isSelected ? 'text-brand-700 font-bold' : 'text-gray-400'}`}>
                          {formatDay(d.day)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Day orders detail */}
      {selectedDay && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-brand-600" />
              Đơn hàng ngày {formatDay(selectedDay)}
              <span className="text-sm font-normal text-gray-400">({selectedDay})</span>
            </h3>
            <button onClick={() => { setSelectedDay(null); setDayOrders([]) }}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100">
              Đóng ✕
            </button>
          </div>

          {dayLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dayOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Không có đơn hàng trong ngày này</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-semibold">#</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Khách hàng</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Sản phẩm</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Số tiền</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Mã CK</th>
                    <th className="text-left px-4 py-2.5 font-semibold">Giờ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dayOrders.map((o, idx) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{o.name || o.user_name || '—'}</p>
                        <p className="text-xs text-gray-400">{o.email || o.phone || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        {o.items?.map((item, i) => (
                          <p key={i} className="text-xs text-gray-600">
                            {item.product_name} <span className="text-gray-400">x{item.quantity}</span>
                          </p>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-brand-700">{formatPrice(o.total_amount)}đ</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{o.payment_code}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(o.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 font-bold text-gray-700">Tổng: {dayOrders.length} đơn</td>
                    <td className="px-4 py-3 text-right font-bold text-brand-700">{formatPrice(dayOrders.reduce((s, o) => s + o.total_amount, 0))}đ</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
