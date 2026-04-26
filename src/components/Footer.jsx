import { Link } from 'react-router-dom'
import { MapPin, Mail, PhoneCall, ArrowUp, Heart } from 'lucide-react'
import { FacebookIcon, YoutubeIcon, TiktokIcon, ZaloIcon } from './SocialIcons'
import { useSettings } from '../contexts/SettingsContext'

export default function Footer() {
  const settings = useSettings()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const siteName = settings.site_name || 'Toán Học Hay'

  return (
    <footer className="bg-brand-900 text-brand-200 mt-12 relative overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-500/80" />

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-6 relative">
        {/* Top CTA Banner */}
        <div className="bg-brand-800/80 rounded-2xl p-6 lg:p-8 mb-10 flex flex-col lg:flex-row items-center justify-between gap-4
                        border border-brand-700/30">
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Sẵn sàng chinh phục Toán học?
            </h3>
            <p className="text-sm text-brand-300 mt-1">Bắt đầu học ngay hôm nay với hệ thống khóa học chất lượng cao</p>
          </div>
          <Link to="/khoa-hoc"
                className="inline-flex items-center h-11 px-6 rounded-xl font-bold text-sm
                           bg-brand-500 text-brand-900 shadow-lg
                           hover:bg-brand-400 transition-all duration-200 whitespace-nowrap shrink-0">
            Xem khoá học →
          </Link>
        </div>

        {/* Main Grid — 4 columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src={settings.logo || '/logo_footer.webp'} alt={siteName}
                   className="w-11 h-11 rounded-xl shadow-lg" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                {siteName}
              </h2>
            </div>
            <p className="text-sm text-brand-400 leading-relaxed">
              {settings.site_description || '8 năm kinh nghiệm luyện thi đại học chất lượng cao. Đồng hành cùng hàng ngàn học sinh trên cả nước.'}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">
              Sản phẩm
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Khóa học', path: '/khoa-hoc' },
                { label: 'Sách', path: '/sach' },
                { label: 'Thi thử', path: '/de-thi' },
                { label: 'Tài liệu', path: '/tai-lieu' },
              ].map(link => (
                <Link key={link.path} to={link.path}
                      className="text-sm text-brand-400 hover:text-white transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">
              Hỗ trợ
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Giới thiệu', path: '/gioi-thieu' },
                { label: 'Kích hoạt khoá học', path: '/kich-hoat' },
                { label: 'Đăng nhập', path: '/login' },
                { label: 'Đăng ký', path: '/register' },
              ].map(link => (
                <Link key={link.path} to={link.path}
                      className="text-sm text-brand-400 hover:text-white transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-4">
              Liên hệ
            </h3>
            <div className="space-y-3 text-sm text-brand-400">
              {settings.address && (
                <p className="flex items-start gap-2.5">
                  <MapPin size={14} className="shrink-0 mt-0.5 text-brand-500" />
                  <span>{settings.address}</span>
                </p>
              )}
              {settings.email && (
                <p className="flex items-center gap-2.5">
                  <Mail size={14} className="shrink-0 text-brand-500" />
                  <span>{settings.email}</span>
                </p>
              )}
              <p className="flex items-center gap-2.5">
                <PhoneCall size={14} className="shrink-0 text-brand-500" />
                <span>{settings.phone || '0984511618'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { href: settings.facebook || '#', label: 'Facebook', icon: <FacebookIcon /> },
            { href: settings.youtube || '#', label: 'Youtube', icon: <YoutubeIcon /> },
            { href: settings.tiktok || '#', label: 'TikTok', icon: <TiktokIcon /> },
            { href: settings.zalo || '#', label: 'Zalo', icon: <ZaloIcon /> },
          ].map(({ href, label, icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
               className="inline-flex items-center justify-center w-10 h-10 rounded-xl
                          bg-brand-800/50 text-brand-400 border border-brand-700/40
                          hover:bg-brand-700/60 hover:text-white
                          transition-all duration-200">
              {icon}
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-800/60 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-500">
          <p className="flex items-center gap-1">
            Made with <Heart size={12} className="text-red-400" /> by{' '}
            <a href="https://www.facebook.com/chysnh" target="_blank" rel="noopener noreferrer"
               className="text-brand-400 hover:text-white transition-colors underline decoration-dotted">
              entiq
            </a>
            {' '}&{' '}
            <span className="text-brand-400 underline">ndc</span>
          </p>
          <button onClick={scrollToTop}
                  className="inline-flex items-center gap-1.5 text-brand-500
                             hover:text-white transition-all duration-200">
            <ArrowUp size={14} /> Về đầu trang
          </button>
        </div>
      </div>
    </footer>
  )
}
