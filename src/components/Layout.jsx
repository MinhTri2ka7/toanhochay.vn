import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import Footer from './Footer'
import HotlineFAB from './HotlineFAB'

const navLinks = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Khóa học', path: '/khoa-hoc' },
  { label: 'Sách', path: '/sach' },
  { label: 'Thi thử', path: '/de-thi' },
  { label: 'Tài liệu', path: '/tai-lieu' },
  { label: 'Giới thiệu', path: '/gioi-thieu' },
]

export default function Layout() {
  const [isFloating, setIsFloating] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const { user, logout } = useAuth()
  const { totalItems } = useCart()

  useEffect(() => {
    const handleScroll = () => setIsFloating(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 lg:px-6
          transition-all duration-500 ease-out
          ${isFloating
            ? `${isHome ? 'lg:mx-8 2xl:mx-[10%]' : 'md:mx-16 xl:mx-[10%]'} mx-3 top-3 rounded-2xl shadow-header`
            : 'shadow-card'
          }
          glass`}
      >
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-xl active:bg-brand-200/60 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <div className="relative w-5 h-5">
              <Menu size={20} className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} />
              <X size={20} className={`absolute inset-0 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
            </div>
          </button>

          <Link to="/" className="flex items-center gap-3">
            <img src="/favicon.webp" alt="Toán Thầy Thuận"
                 className="w-9 h-9 rounded-xl" />
            <span className={`font-bold text-brand-800 transition-all duration-300 hidden sm:block
              ${isFloating ? 'opacity-100 max-w-40' : 'opacity-0 max-w-0 overflow-hidden'}`}
              style={{ fontFamily: 'var(--font-heading)' }}>
              Thầy Thuận
            </span>
          </Link>

          <nav className="hidden lg:flex gap-1 font-semibold" role="navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `relative inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm text-brand-900
                   transition-all duration-300 select-none
                   after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2
                   after:h-[2px] after:rounded-full after:bg-brand-600 after:transition-all after:duration-300
                   ${isActive ? 'after:w-[60%] text-brand-800 font-bold' : 'after:w-0'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Auth / User */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-semibold
                           text-brand-800 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-brand-500
                                flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-2xl shadow-section
                                  border border-brand-100 py-2 animate-scale-in origin-top-right">
                    <p className="px-4 py-2 text-xs text-gray-400 border-b border-brand-100">{user.email}</p>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-800">
                        <User size={16} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600">
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/register"
                    className="hidden sm:inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm font-semibold
                               text-brand-800 border border-brand-300 transition-all">
                Đăng kí
              </Link>
              <Link to="/login"
                    className="inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm font-bold
                               bg-brand-600 text-white
                               shadow-md active:translate-y-0 transition-all duration-200">
                Đăng nhập
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-900/20 backdrop-blur-sm animate-fade-in"
               onClick={() => setMobileMenuOpen(false)} />
          <nav className="absolute top-0 right-0 bottom-0 w-[280px] bg-white/95 backdrop-blur-xl
                          shadow-section p-6 pt-20 flex flex-col gap-1 drawer-slide">
            {navLinks.map((link, index) => (
              <NavLink key={link.path} to={link.path}
                       style={{ animationDelay: `${index * 60}ms` }}
                       className={({ isActive }) =>
                         `flex items-center h-12 px-4 rounded-xl font-semibold transition-all duration-200 animate-fade-in-up
                          ${isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-brand-900'}`
                       }>
                {link.label}
              </NavLink>
            ))}
            <div className="mt-auto pt-6 border-t border-brand-200 flex flex-col gap-2">
              {user ? (
                <button onClick={handleLogout}
                        className="flex items-center justify-center h-12 rounded-xl font-semibold border border-red-300 text-red-600 transition-all">
                  <LogOut size={18} className="mr-2" /> Đăng xuất
                </button>
              ) : (
                <>
                  <Link to="/login" className="flex items-center justify-center h-12 rounded-xl font-bold bg-brand-600 text-white shadow-md">
                    Đăng nhập
                  </Link>
                  <Link to="/register" className="flex items-center justify-center h-12 rounded-xl font-semibold border border-brand-300 text-brand-800">
                    Đăng kí
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}

      <main className="flex-1"><Outlet /></main>
      <Footer />
      <HotlineFAB />

      {/* Cart FAB */}
      <div className="fixed bottom-20 right-4 xl:bottom-24 xl:right-16 z-20">
        <div className="relative">
          <Link to="/gio-hang"
                className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14
                           rounded-2xl bg-white text-brand-800 shadow-card
                           transition-all duration-300"
                aria-label="Giỏ hàng">
            <ShoppingCart size={20} />
          </Link>
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500
                             text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center
                             shadow-sm animate-scale-in">
              {totalItems}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
