import { useState, useEffect } from 'react'
import { FileText, Download, Eye, FolderOpen, Loader2, Lock, ShoppingCart, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ScrollReveal from '../components/ScrollReveal'
import { fetchDocuments, trackDocumentDownload, formatPrice } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { usePurchases } from '../contexts/PurchaseContext'
import { useCart } from '../contexts/CartContext'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { ownedDocumentIds } = usePurchases()
  const { addItem } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDocuments()
      .then(data => setDocuments(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleView(doc) {
    const isPaid = doc.price && doc.price > 0
    const isOwned = ownedDocumentIds.has(String(doc.id))

    // Free document — open directly
    if (!isPaid) {
      trackDocumentDownload(doc.id).catch(() => {})
      if (doc.file_url) window.open(doc.file_url, '_blank')
      return
    }

    // Paid document — already purchased
    if (isOwned) {
      trackDocumentDownload(doc.id).catch(() => {})
      if (doc.file_url) window.open(doc.file_url, '_blank')
      return
    }

    // Paid document — not purchased — require login then go to checkout
    if (!user) {
      navigate('/login?redirect=/documents')
      return
    }

    // Add to cart and go checkout
    addItem({
      id: String(doc.id),
      name: doc.title,
      price: doc.price,
      image: '',
    }, 'document')
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      {/* Title */}
      <ScrollReveal>
        <div className="flex bg-white p-4 rounded-2xl shadow-card items-center mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-500
                          flex items-center justify-center mr-3">
            <FolderOpen size={16} className="text-white" />
          </div>
          <p className="font-semibold text-brand-900"
             style={{ fontFamily: 'var(--font-heading)' }}>
            Tài liệu
          </p>
          <div className="flex-1" />
          <span className="text-xs text-gray-400 font-medium">{documents.length} tài liệu</span>
        </div>
      </ScrollReveal>

      {documents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có tài liệu nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc, i) => {
            const isPaid = doc.price && doc.price > 0
            const isOwned = ownedDocumentIds.has(String(doc.id))
            const canView = !isPaid || isOwned

            return (
              <ScrollReveal key={doc.id} delay={i * 60}>
                <div className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4
                                transition-all duration-300 cursor-pointer"
                     onClick={() => handleView(doc)}>
                  <div className="w-12 h-12 rounded-2xl bg-red-100
                                  flex items-center justify-center shrink-0">
                    <FileText size={22} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm lg:text-base line-clamp-1">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                                       bg-red-50 text-red-500 font-semibold">
                        {doc.file_type}
                      </span>
                      {doc.pages > 0 && <span>{doc.pages} trang</span>}
                      <span className="flex items-center gap-1">
                        <Download size={12} /> {(doc.downloads || 0).toLocaleString()}
                      </span>
                      {doc.category && doc.category !== 'general' && (
                        <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 font-medium">{doc.category}</span>
                      )}
                      {/* Price badge */}
                      {!isPaid ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Free</span>
                      ) : isOwned ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Đã mua</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-bold">{formatPrice(doc.price)}đ</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={`shrink-0 h-9 px-4 rounded-xl text-sm font-semibold
                                 shadow-sm transition-all duration-200 flex items-center gap-1
                                 ${canView
                                   ? 'bg-brand-600 text-white hover:bg-brand-700'
                                   : user
                                     ? 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    onClick={e => { e.stopPropagation(); handleView(doc) }}
                  >
                    {canView ? (
                      <><Eye size={15} /> Xem</>
                    ) : !user ? (
                      <><LogIn size={13} /> Đăng nhập</>
                    ) : (
                      <><ShoppingCart size={13} /> {formatPrice(doc.price)}đ</>
                    )}
                  </button>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      )}
    </div>
  )
}
