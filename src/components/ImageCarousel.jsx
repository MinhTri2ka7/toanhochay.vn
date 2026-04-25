import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

function CarouselImage({ src, alt }) {
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
    <img
      alt={alt}
      src={src}
      onError={() => setError(true)}
      className="w-full aspect-[3/4] object-cover rounded-xl"
      loading="lazy"
    />
  )
}

export default function ImageCarousel({ images, altPrefix = 'Image', useDirectUrl = false }) {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const amount = scrollRef.current.offsetWidth * 0.4
      scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
    }
  }

  if (!images || images.length === 0) return null

  return (
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
        {images.map((img, i) => (
          <div key={i} className="flex-shrink-0 w-[30%] sm:w-[22%] md:w-[18%] lg:w-[14%] min-w-[100px] snap-center">
            <CarouselImage
              src={useDirectUrl ? img : `/api/assets/${img}`}
              alt={`${altPrefix} ${i + 1}`}
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
  )
}
