import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ImageOff, X, ZoomIn } from 'lucide-react'

function CarouselImage({ src, alt, onClick }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full aspect-[3/4] rounded-xl bg-brand-100
                      flex items-center justify-center">
        <ImageOff size={24} className="text-brand-300" />
      </div>
    )
  }

  return (
    <div className="relative group/img cursor-pointer" onClick={onClick}>
      <img
        alt={alt}
        src={src}
        onError={() => setError(true)}
        className="w-full aspect-[3/4] object-cover rounded-xl"
        loading="lazy"
      />
      {/* Zoom hint overlay */}
      <div className="absolute inset-0 rounded-xl bg-black/0 group-hover/img:bg-black/20
                      flex items-center justify-center opacity-0 group-hover/img:opacity-100
                      transition-all duration-200">
        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
          <ZoomIn size={14} className="text-gray-700" />
        </div>
      </div>
    </div>
  )
}

/* ========== Lightbox overlay ========== */
function Lightbox({ images, currentIndex, onClose, onNavigate, altPrefix }) {
  const [imgError, setImgError] = useState(false)

  // Reset error on image change
  useEffect(() => { setImgError(false) }, [currentIndex])

  // Close on Escape, navigate with arrow keys
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onNavigate(-1)
    if (e.key === 'ArrowRight') onNavigate(1)
  }, [onClose, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const src = images[currentIndex]

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
         onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40
                   flex items-center justify-center transition-colors"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10
                      px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Nav arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/20 hover:bg-white/40
                       flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={22} className="text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10
                       w-10 h-10 rounded-full bg-white/20 hover:bg-white/40
                       flex items-center justify-center transition-colors"
          >
            <ChevronRight size={22} className="text-white" />
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
           onClick={(e) => e.stopPropagation()}>
        {imgError ? (
          <div className="w-64 h-64 rounded-2xl bg-white/10 flex items-center justify-center">
            <ImageOff size={48} className="text-white/40" />
          </div>
        ) : (
          <img
            src={src}
            alt={`${altPrefix} ${currentIndex + 1}`}
            onError={() => setImgError(true)}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl
                       animate-[fadeIn_0.2s_ease-out]"
          />
        )}
      </div>
    </div>
  )
}

export default function ImageCarousel({ images, altPrefix = 'Image', useDirectUrl = false }) {
  const scrollRef = useRef(null)
  const [lightboxIndex, setLightboxIndex] = useState(-1) // -1 = closed

  const resolvedImages = (images || []).map(img => useDirectUrl ? img : `/api/assets/${img}`)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = scrollRef.current.offsetWidth * 0.4
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
    }
  }

  function openLightbox(index) {
    setLightboxIndex(index)
  }

  function navigateLightbox(delta) {
    setLightboxIndex(prev => {
      const next = prev + delta
      if (next < 0) return resolvedImages.length - 1
      if (next >= resolvedImages.length) return 0
      return next
    })
  }

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="relative mb-6 group/carousel">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10
                     w-9 h-9 xl:w-11 xl:h-11 flex items-center justify-center
                     bg-white/90 backdrop-blur-sm rounded-full shadow-card
                     active:scale-95 transition-all duration-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-brand-800" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-3 px-1 snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {resolvedImages.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-[30%] sm:w-[22%] md:w-[18%] lg:w-[14%] min-w-[100px] snap-center">
              <CarouselImage
                src={src}
                alt={`${altPrefix} ${i + 1}`}
                onClick={() => openLightbox(i)}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10
                     w-9 h-9 xl:w-11 xl:h-11 flex items-center justify-center
                     bg-white/90 backdrop-blur-sm rounded-full shadow-card
                     active:scale-95 transition-all duration-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-brand-800" />
        </button>
      </div>

      {/* Lightbox */}
      {lightboxIndex >= 0 && (
        <Lightbox
          images={resolvedImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={navigateLightbox}
          altPrefix={altPrefix}
        />
      )}
    </>
  )
}
