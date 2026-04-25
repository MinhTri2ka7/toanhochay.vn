import { Link } from 'react-router-dom'
import { MapPin, Mail, PhoneCall, ArrowUp } from 'lucide-react'
import { FacebookIcon, YoutubeIcon, TiktokIcon, ZaloIcon } from './SocialIcons'

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="bg-brand-800 text-brand-200 mt-8">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo_footer.webp" alt="Toán Thầy Thuận"
                   className="w-12 h-12 rounded-xl shadow-lg" />
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Toán Thầy Thuận
              </h2>
            </div>
            <p className="text-sm text-brand-300 leading-relaxed text-center md:text-left">
              8 năm kinh nghiệm luyện thi đại học chất lượng cao.
              Đồng hành cùng hàng ngàn học sinh trên cả nước.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">
              Liên kết nhanh
            </h3>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Khóa học', path: '/khoa-hoc' },
                { label: 'Sách', path: '/sach' },
                { label: 'Thi thử', path: '/de-thi' },
                { label: 'Tài liệu', path: '/tai-lieu' },
                { label: 'Giới thiệu', path: '/gioi-thieu' },
              ].map(link => (
                <Link key={link.path} to={link.path}
                      className="text-sm text-brand-300 transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-3">
              Liên hệ
            </h3>
            <div className="space-y-2.5 text-sm text-brand-300">
              <p className="flex items-start gap-2.5">
                <MapPin size={15} className="shrink-0 mt-0.5 text-brand-400" />
                <span>70 Nguyễn Đức Cảnh - Tương Mai, Hoàng Mai, Hà Nội</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-brand-400" />
                <span>hothucthuan@gmail.com</span>
              </p>
              <p className="flex items-center gap-2.5">
                <PhoneCall size={15} className="shrink-0 text-brand-400" />
                <span>0869998668</span>
              </p>
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[
            { href: 'https://www.facebook.com/Thaygiaothuan.99', label: 'Facebook', icon: <FacebookIcon /> },
            { href: 'https://www.youtube.com/c/HồThứcThuậnOfficial', label: 'Youtube', icon: <YoutubeIcon /> },
            { href: 'https://www.tiktok.com/@thay_hothucthuan', label: 'TikTok', icon: <TiktokIcon /> },
            { href: 'https://zalo.me/0869998668', label: 'Zalo', icon: <ZaloIcon /> },
          ].map(({ href, label, icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
               className="inline-flex items-center justify-center w-10 h-10 rounded-xl
                          bg-brand-700/50 text-brand-300 border border-brand-600/30
                          transition-all duration-200">
              {icon}
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-700/50 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-400">
          <a href="https://www.facebook.com/chysnh" target="_blank" rel="noopener noreferrer"
             className="transition-colors">
            Phát triển bởi <span className="underline decoration-dotted">entiq</span> & <span className="underline">ndc</span>
          </a>
          <button onClick={scrollToTop}
                  className="inline-flex items-center gap-1 text-brand-400
                             transition-all duration-200">
            <ArrowUp size={14} /> Về đầu trang
          </button>
        </div>
      </div>
    </footer>
  )
}
