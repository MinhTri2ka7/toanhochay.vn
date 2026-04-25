import { useEffect, useRef, useState } from 'react'
import { Award, Users, Tv, BookOpen, GraduationCap, Star, Target, Heart } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'

/* Animated counter hook */
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(!startOnView)
  const ref = useRef(null)

  useEffect(() => {
    if (!startOnView) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [startOnView])

  useEffect(() => {
    if (!started) return
    let frame
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
      setCount(Math.floor(eased * end))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [started, end, duration])

  return { count, ref }
}

function AnimatedStat({ icon: Icon, label, value, suffix = '', delay = 0 }) {
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''))
  const prefix = value.startsWith('#') ? '#' : ''
  const { count, ref } = useCountUp(numericValue, 2000)

  return (
    <ScrollReveal delay={delay}>
      <div ref={ref}
           className="bg-white rounded-2xl lg:rounded-3xl shadow-card p-6 text-center
                      transition-all duration-300
                      cursor-default">
        <div className="w-14 h-14 rounded-2xl bg-brand-100
                        flex items-center justify-center mx-auto mb-3
                        transition-all duration-300">
          <Icon size={26} className="text-brand-700" />
        </div>
        <p className="text-3xl lg:text-4xl font-bold text-brand-900 counter-animate"
           style={{ fontFamily: 'var(--font-heading)' }}>
          {prefix}{count}{suffix}
        </p>
        <p className="text-sm text-gray-500 mt-1.5 font-medium">{label}</p>
      </div>
    </ScrollReveal>
  )
}

const timeline = [
  {
    year: '2016',
    title: 'Bắt đầu hành trình',
    desc: 'Khởi đầu con đường giảng dạy Toán với niềm đam mê cháy bỏng.',
    icon: Star,
  },
  {
    year: '2018',
    title: 'Livestream đầu tiên',
    desc: 'Tiên phong trong việc dạy Toán qua livestream, thu hút hàng ngàn học sinh.',
    icon: Tv,
  },
  {
    year: '2020',
    title: 'Nền tảng trực tuyến',
    desc: 'Ra mắt hệ thống khóa học trực tuyến, mở rộng phạm vi giảng dạy toàn quốc.',
    icon: Target,
  },
  {
    year: '2022',
    title: '100K+ học sinh',
    desc: 'Cộng đồng học sinh vượt mốc 100.000 follow, khẳng định chất lượng giảng dạy.',
    icon: Users,
  },
  {
    year: '2024',
    title: 'Top 1 Livestream',
    desc: 'Trở thành Top 1 giáo viên dạy livestream lượng xem trực tiếp tại Việt Nam.',
    icon: Award,
  },
  {
    year: '2025',
    title: '170K+ Follow',
    desc: 'Gần 170.000 follow Facebook, tiếp tục sứ mệnh truyền cảm hứng học Toán.',
    icon: Heart,
  },
]

export default function AboutPage() {
  return (
    <div className="mb-12">
      {/* ========== HERO SECTION ========== */}
      <div className="relative mx-4 md:mx-16 xl:mx-[10%] mt-6">
        <div className="relative rounded-3xl overflow-hidden bg-brand-800
                        shadow-section">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-brand-400/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-14">
            {/* Avatar */}
            <ScrollReveal direction="left">
              <div className="relative">
                <img
                  src="/avatar.png"
                  alt="Thầy Hồ Thức Thuận"
                  className="w-44 h-44 lg:w-56 lg:h-56 rounded-3xl object-cover shadow-lg
                             ring-4 ring-brand-400/30"
                />
                {/* Badge */}
                <div className="absolute -bottom-3 -right-3 bg-brand-500
                                text-brand-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  <GraduationCap size={14} className="inline mr-1" />
                  Thủ khoa ĐH
                </div>
              </div>
            </ScrollReveal>

            {/* Info */}
            <ScrollReveal direction="right" delay={200}>
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-heading)' }}>
                  Thầy Hồ Thức Thuận
                </h1>
                <p className="text-brand-300 font-semibold text-lg mb-5">
                  Chuyên luyện thi Toán 10, 11, 12
                </p>
                <p className="text-brand-100/80 leading-relaxed max-w-xl">
                  8 năm kinh nghiệm luyện thi đại học chất lượng cao. Gần 170.000 follow facebook
                  học sinh theo học. Điểm thi Đại Học Thủ Khoa với 28 điểm (Toán 9.5; Lý 9,5; Hóa 9).
                  Đã giúp đỡ hàng ngàn học sinh đỗ đại học mơ ước.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ========== STATS ========== */}
      <div className="mx-4 md:mx-16 xl:mx-[10%] -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <AnimatedStat icon={Award} label="Năm kinh nghiệm" value="8" suffix="+" delay={0} />
          <AnimatedStat icon={Users} label="Học sinh theo học" value="170" suffix="K+" delay={100} />
          <AnimatedStat icon={Tv} label="Top livestream" value="#1" delay={200} />
          <AnimatedStat icon={BookOpen} label="Khóa học" value="7" suffix="+" delay={300} />
        </div>
      </div>

      {/* ========== TIMELINE ========== */}
      <div className="mx-4 md:mx-16 xl:mx-[10%] mt-12">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-brand-900"
                style={{ fontFamily: 'var(--font-heading)' }}>
              Hành trình phát triển
            </h2>
            <p className="text-gray-500 mt-2">Những cột mốc quan trọng trong sự nghiệp giảng dạy</p>
          </div>
        </ScrollReveal>

        <div className="relative max-w-3xl mx-auto">
          {/* Timeline line — solid color */}
          <div className="absolute left-6 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5
                          bg-brand-400" />

          {timeline.map((item, i) => {
            const isLeft = i % 2 === 0
            const TimeIcon = item.icon

            return (
              <ScrollReveal key={item.year} delay={i * 120} direction={isLeft ? 'left' : 'right'}>
                <div className={`relative flex items-start gap-6 mb-8
                                 lg:${isLeft ? 'flex-row' : 'flex-row-reverse'}
                                 lg:gap-12`}>
                  {/* Timeline dot */}
                  <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 z-10
                                  w-12 h-12 rounded-full bg-white shadow-card
                                  flex items-center justify-center
                                  border-2 border-brand-400">
                    <TimeIcon size={20} className="text-brand-600" />
                  </div>

                  {/* Content */}
                  <div className={`ml-20 lg:ml-0 lg:w-[calc(50%-3rem)]
                                   ${isLeft ? 'lg:text-right lg:pr-0' : 'lg:text-left lg:ml-auto lg:pl-0'}`}>
                    <div className="bg-white rounded-2xl shadow-card p-5
                                    transition-all duration-300">
                      <span className="inline-block text-xs font-bold text-brand-600
                                       bg-brand-100 px-2.5 py-0.5 rounded-full mb-2">
                        {item.year}
                      </span>
                      <h3 className="font-bold text-brand-900 text-base"
                          style={{ fontFamily: 'var(--font-heading)' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>

      {/* ========== MISSION ========== */}
      <div className="mx-4 md:mx-16 xl:mx-[10%] mt-12">
        <ScrollReveal>
          <div className="relative bg-white rounded-3xl shadow-card overflow-hidden">
            {/* Solid accent bar */}
            <div className="h-1 bg-brand-500" />
            <div className="p-6 lg:p-10">
              <h2 className="text-xl lg:text-2xl font-bold text-brand-900 mb-5"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                Sứ mệnh
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Với niềm đam mê giảng dạy và mong muốn truyền cảm hứng học tập cho thế hệ trẻ,
                  Thầy Hồ Thức Thuận đã xây dựng hệ thống khóa học trực tuyến chất lượng cao,
                  giúp hàng ngàn học sinh trên cả nước tiếp cận với phương pháp học Toán hiệu quả.
                </p>
                <p>
                  Hệ thống khóa học được thiết kế khoa học, từ cơ bản đến nâng cao,
                  phù hợp với mọi đối tượng học sinh. Mỗi bài giảng đều được đầu tư kỹ lưỡng
                  về nội dung và hình thức, đảm bảo học sinh có thể hiểu sâu và vận dụng linh hoạt.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
