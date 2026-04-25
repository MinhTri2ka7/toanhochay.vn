import { useEffect, useRef, useState } from 'react'

/**
 * ScrollReveal wrapper component
 * Uses IntersectionObserver for performant scroll-triggered animations
 */
export default function ScrollReveal({
  children,
  direction = 'up',     // 'up' | 'left' | 'right' | 'fade'
  delay = 0,            // ms
  duration = 600,       // ms
  threshold = 0.15,
  once = true,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, once])

  const getTransform = () => {
    switch (direction) {
      case 'left': return 'translateX(-30px)'
      case 'right': return 'translateX(30px)'
      case 'fade': return 'none'
      default: return 'translateY(30px)'
    }
  }

  return (
    <Component
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        ...props.style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
