import { useState, useEffect } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import CourseCard from '../components/CourseCard'
import ScrollReveal from '../components/ScrollReveal'
import { fetchBooks } from '../lib/api'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBooks()
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Banner */}
      <ScrollReveal>
        <div className="mb-6">
          <div className="rounded-3xl overflow-hidden shadow-card">
            <picture>
              <source media="(max-width: 47.9375em)" srcSet="/banner_book/banner_book_mobile.png" />
              <source media="(min-width: 48em)" srcSet="/banner_book/banner_book.png" />
              <img alt="Banner Sách" className="mx-auto rounded-3xl object-contain object-center w-full" />
            </picture>
          </div>
        </div>
      </ScrollReveal>

      {/* Title */}
      <ScrollReveal delay={100}>
        <div className="flex bg-white p-4 rounded-2xl shadow-card items-center mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-500
                          flex items-center justify-center mr-3">
            <BookOpen size={16} className="text-white" />
          </div>
          <p className="font-semibold text-brand-900"
             style={{ fontFamily: 'var(--font-heading)' }}>
            Tất cả sách
          </p>
          <div className="flex-1" />
          <span className="text-xs text-gray-400 font-medium">{books.length} sản phẩm</span>
        </div>
      </ScrollReveal>

      {/* Books Grid */}
      <ScrollReveal delay={200}>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 stagger-children">
          {books.map(b => <CourseCard key={b.id} item={b} type="book" />)}
        </div>
      </ScrollReveal>
    </div>
  )
}
