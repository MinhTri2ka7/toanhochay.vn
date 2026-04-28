import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ExternalLink, Loader2, ShoppingCart, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ScrollReveal from '../components/ScrollReveal'

export default function MyBooksPage() {
  const { user } = useAuth()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setError('login')
      return
    }
    fetch('/api/my-books', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setBooks(data)
        else setError('Lỗi tải dữ liệu')
      })
      .catch(() => setError('Lỗi kết nối'))
      .finally(() => setLoading(false))
  }, [user])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={32} className="animate-spin text-brand-500" />
    </div>
  )

  if (error === 'login') return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Lock size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Yêu cầu đăng nhập</h2>
        <p className="text-gray-400 mb-4">Bạn cần đăng nhập để xem sách đã mua</p>
        <Link to="/login?redirect=/sach-cua-toi" className="px-6 py-2 rounded-lg bg-brand-600 text-white font-semibold">
          Đăng nhập
        </Link>
      </div>
    </div>
  )

  return (
    <div className="mt-6 mb-12 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Banner */}
      <ScrollReveal>
        <div className="mb-6">
          <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-card"
               style={{
                 background: '#FFF8E1',
                 padding: '2.5rem 1.5rem',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 minHeight: '120px',
               }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: 0,
              background: 'linear-gradient(180deg, #F5C518 0%, #E8751A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Sách Đã Mua</h2>
          </div>
        </div>
      </ScrollReveal>

      {books.length === 0 ? (
        <ScrollReveal delay={100}>
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">Chưa có sách nào</h3>
            <p className="text-gray-400 mb-6">Bạn chưa mua sách nào. Hãy khám phá các sách hay!</p>
            <Link to="/sach" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors">
              <ShoppingCart size={16} /> Xem sách
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal delay={100}>
          <div className="grid gap-4">
            {books.map(book => (
              <div key={book.id} className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col sm:flex-row">
                {/* Book image */}
                {book.image && (
                  <div className="sm:w-40 h-40 sm:h-auto shrink-0 bg-brand-50">
                    <img src={book.image} alt={book.name} className="w-full h-full object-contain p-3" />
                  </div>
                )}
                {/* Book info */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-brand-900 mb-1">{book.name}</h3>
                    {book.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{book.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {book.pdf_url ? (
                      <a href={book.pdf_url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold
                                    hover:bg-emerald-500 transition-colors shadow-sm text-sm">
                        <ExternalLink size={16} /> Mở tài liệu
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Tài liệu đang được cập nhật</span>
                    )}
                    <span className="text-xs text-gray-400">
                      Đã mua: {new Date(book.activatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}
    </div>
  )
}
