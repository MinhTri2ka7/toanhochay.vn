import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Menu, X, User, LogOut, ChevronRight, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useSettings } from '../contexts/SettingsContext'
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
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const settings = useSettings()
  const siteName = settings.site_name || 'Toán Học Hay'

  useEffect(() => {
    const handleScroll = () => {
      const shouldFloat = window.scrollY > 50
      if (shouldFloat !== isFloating) setIsFloating(shouldFloat)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isFloating])

  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
    // Use instant scroll — no smooth delay when navigating
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/')
  }, [logout, navigate])

  return (
    <div className="min-h-screen pt-16">
      {/* Header — Centered brand layout */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16
          transition-all duration-500 ease-out
          ${isFloating
            ? 'mx-3 lg:mx-6 xl:mx-[8%] top-3 rounded-2xl shadow-header'
            : 'shadow-card'
          }
          glass`}
      >
        <div className="h-full flex items-center justify-between px-4 lg:px-6 max-w-[1440px] mx-auto">
          {/* Left: Hamburger (mobile) + Logo */}
          <div className="flex items-center gap-3">
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

            <Link to="/" className="flex items-center gap-2.5">
              <img src={settings.logo || '/favicon.svg'} alt={siteName}
                   className="w-9 h-9 rounded-xl shadow-sm" />
              <span className="font-bold text-brand-800 text-sm lg:text-base"
                style={{ fontFamily: 'var(--font-heading)' }}>
                {siteName}
              </span>
            </Link>
          </div>

          {/* Center: Navigation pills */}
          <nav className="hidden lg:flex items-center gap-1 bg-brand-100/60 rounded-xl p-1" role="navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-semibold
                   transition-all duration-300 select-none whitespace-nowrap
                   ${isActive
                     ? 'bg-white text-brand-800 shadow-sm'
                     : 'text-brand-700 hover:text-brand-900'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Auth / User + Cart */}
          <div className="flex items-center gap-2">
            {/* Cart button — inline */}
            <Link to="/gio-hang"
                  className="relative inline-flex items-center justify-center w-10 h-10
                             rounded-xl text-brand-700 transition-all duration-300"
                  aria-label="Giỏ hàng">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500
                                 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full
                                 flex items-center justify-center shadow-sm animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-semibold
                             text-brand-800 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500
                                  flex items-center justify-center text-white text-xs font-bold
                                  ring-2 ring-brand-300/50">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate">{user.name}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-52 bg-white rounded-2xl shadow-float
                                    border border-brand-100 py-2 animate-scale-in origin-top-right">
                      <p className="px-4 py-2 text-xs text-gray-400 border-b border-brand-100">{user.email}</p>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-800
                                                     hover:bg-brand-50 transition-colors">
                          <User size={16} /> Admin Panel
                          <ChevronRight size={14} className="ml-auto text-gray-300" />
                        </Link>
                      )}
                      <Link to="/sach-cua-toi" className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-800
                                                   hover:bg-brand-50 transition-colors">
                        <BookOpen size={16} /> Sách của tôi
                        <ChevronRight size={14} className="ml-auto text-gray-300" />
                      </Link>
                      <button onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600
                                         hover:bg-red-50 transition-colors">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/register"
                      className="hidden sm:inline-flex items-center justify-center h-9 px-4 rounded-xl text-sm font-semibold
                                 text-brand-700 transition-all hover:text-brand-900">
                  Đăng kí
                </Link>
                <Link to="/login"
                      className="inline-flex items-center justify-center h-9 px-5 rounded-xl text-sm font-bold
                                 bg-brand-800 text-white
                                 shadow-md active:translate-y-0 transition-all duration-200">
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer — Full overlay style */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-brand-900/30 backdrop-blur-sm animate-fade-in"
               onClick={() => setMobileMenuOpen(false)} />
          <nav className="absolute top-0 right-0 bottom-0 w-[300px] bg-white/98 backdrop-blur-xl
                          shadow-float p-6 pt-20 flex flex-col gap-1.5 drawer-slide">
            
            {/* User info at top */}
            {user && (
              <div className="flex items-center gap-3 bg-brand-50 rounded-2xl p-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-500
                                flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            )}

            {navLinks.map((link, index) => (
              <NavLink key={link.path} to={link.path}
                       style={{ animationDelay: `${index * 60}ms` }}
                       className={({ isActive }) =>
                         `flex items-center h-12 px-4 rounded-xl font-semibold transition-all duration-200 animate-fade-in-up
                          ${isActive ? 'bg-brand-500 text-white shadow-sm' : 'text-brand-900 hover:bg-brand-50'}`
                       }>
                {link.label}
              </NavLink>
            ))}
            <div className="mt-auto pt-6 border-t border-brand-200 flex flex-col gap-2">
              {user ? (
                <button onClick={handleLogout}
                        className="flex items-center justify-center h-12 rounded-xl font-semibold border border-red-200 text-red-600 transition-all
                                   hover:bg-red-50">
                  <LogOut size={18} className="mr-2" /> Đăng xuất
                </button>
              ) : (
                <>
                  <Link to="/login" className="flex items-center justify-center h-12 rounded-xl font-bold bg-brand-800 text-white shadow-md">
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
    </div>
  )
}
