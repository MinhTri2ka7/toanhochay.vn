import { useState, useEffect } from 'react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function toggleBlock(id, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    await fetch(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus }),
    })
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u))
  }

  async function resetPassword(id) {
    if (!confirm('Reset mật khẩu về 12345678?')) return
    await fetch(`/api/admin/users/${id}/reset-password`, {
      method: 'PUT',
      credentials: 'include',
    })
    alert('Đã reset mật khẩu thành 12345678')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Quản lý học viên</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Tên</th>
                <th className="text-left px-4 py-3 font-semibold">Email</th>
                <th className="text-left px-4 py-3 font-semibold">SĐT</th>
                <th className="text-center px-4 py-3 font-semibold">Vai trò</th>
                <th className="text-center px-4 py-3 font-semibold">Trạng thái</th>
                <th className="text-center px-4 py-3 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                      ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => toggleBlock(u.id, u.status)}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold
                                ${u.status === 'active' ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                        {u.status === 'active' ? 'Khóa' : 'Mở'}
                      </button>
                      <button onClick={() => resetPassword(u.id)}
                              className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Reset PW
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
