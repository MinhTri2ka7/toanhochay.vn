import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DEFAULT_INTERVAL = 4000 // 4 giây

/**
 * HeroBannerSlider — full-width image carousel for the hero section.
 * Props:
 *   images: string[]   — list of image URLs
 *   interval?: number  — auto-play interval in ms (default 4000)
 *   className?: string — extra class for the wrapper
 */
export default function HeroBannerSlider({ images = [], interval = DEFAULT_INTERVAL, className = '' }) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef(null)

  const total = images.length

  const goTo = useCallback((index, skipAnim = false) => {
    if (animating && !skipAnim) return
    const next = ((index % total) + total) % total
    setAnimating(true)
    setCurrent(next)
    setTimeout(() => setAnimating(false), 600)
  }, [animating, total])

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  // Auto-play
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (total > 1) {
      timerRef.current = setInterval(next, interval)
    }
  }, [next, interval, total])

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [resetTimer])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  if (!images || images.length === 0) {
    return (
      <div className={`relative rounded-2xl lg:rounded-3xl overflow-hidden bg-brand-100 min-h-[200px] flex items-center justify-center ${className}`}>
        <p className="text-sm text-brand-400">Chưa có ảnh banner</p>
      </div>
    )
  }

  if (images.length === 1) {
    return (
      <div className={`relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-card h-full min-h-[200px] ${className}`}>
        <img
          src={images[0]}
          alt="Banner homepage"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-card h-full min-h-[200px] group/slider select-none ${className}`}
      onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current) }}
      onMouseLeave={resetTimer}
    >
      {/* Slides */}
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={src}
            alt={`Banner ${i + 1}`}
            className="w-full h-full object-cover"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        </div>
      ))}

      {/* Left arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); prev() }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                   w-9 h-9 rounded-full bg-black/30 hover:bg-black/50
                   flex items-center justify-center
                   text-white backdrop-blur-sm
                   opacity-0 group-hover/slider:opacity-100
                   transition-all duration-200 shadow-md"
        aria-label="Ảnh trước"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Right arrow */}
      <button
        onClick={(e) => { e.stopPropagation(); next() }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                   w-9 h-9 rounded-full bg-black/30 hover:bg-black/50
                   flex items-center justify-center
                   text-white backdrop-blur-sm
                   opacity-0 group-hover/slider:opacity-100
                   transition-all duration-200 shadow-md"
        aria-label="Ảnh tiếp"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i) }}
            className={`transition-all duration-300 rounded-full
              ${i === current
                ? 'w-5 h-2 bg-white shadow-sm'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            aria-label={`Chuyển đến ảnh ${i + 1}`}
          />
        ))}
      </div>

      {/* Counter badge */}
      <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full
                      bg-black/30 backdrop-blur-sm text-white text-[11px] font-medium">
        {current + 1}/{total}
      </div>
    </div>
  )
}
