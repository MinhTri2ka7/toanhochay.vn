import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, ShoppingCart, Users, FileText, LogOut, ArrowLeft, Package, Star, CreditCard, History, FolderOpen, Settings, LayoutGrid } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const adminLinks = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/sections', icon: LayoutGrid, label: 'Nhóm trang chủ' },
  { path: '/admin/courses', icon: BookOpen, label: 'Khóa học' },
  { path: '/admin/books', icon: Package, label: 'Sách' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { path: '/admin/users', icon: Users, label: 'Học viên' },
  { path: '/admin/exams', icon: FileText, label: 'Đề thi' },
  { path: '/admin/documents', icon: FolderOpen, label: 'Tài liệu' },
  { path: '/admin/feedbacks', icon: Star, label: 'Vinh danh & Cảm nhận' },
  { path: '/admin/transactions', icon: CreditCard, label: 'Lịch sử GD' },
  { path: '/admin/exam-results', icon: History, label: 'Lịch sử thi' },
  { path: '/admin/settings', icon: Settings, label: 'Cài đặt trang' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-brand-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Admin Panel
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminLinks.map(({ path, icon: Icon, label, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-brand-100 text-brand-800 font-semibold'
                   : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <NavLink to="/" className="flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
            <ArrowLeft size={18} /> Về trang chủ
          </NavLink>
          <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
