import { useEffect, useRef, useState } from 'react'
import { Award, Users, Tv, BookOpen, GraduationCap, Star, Target, Heart } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { useSettings } from '../contexts/SettingsContext'

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

const defaultTimeline = [
  { year: '2016', title: 'Bắt đầu hành trình', desc: 'Khởi đầu con đường giảng dạy Toán với niềm đam mê cháy bỏng.' },
  { year: '2018', title: 'Mở rộng', desc: 'Phát triển chương trình và tiếp cận nhiều học sinh hơn.' },
  { year: '2020', title: 'Nền tảng trực tuyến', desc: 'Ra mắt hệ thống khóa học trực tuyến, mở rộng phạm vi giảng dạy.' },
  { year: '2022', title: '100K+ học sinh', desc: 'Cộng đồng học sinh vượt mốc lớn, khẳng định chất lượng giảng dạy.' },
  { year: '2024', title: 'Thành tích quốc tế', desc: 'Hàng trăm học sinh đạt giải Perfect Scorer, Gold Award.' },
]

const timelineIcons = [Star, Tv, Target, Users, Award, Heart]

export default function AboutPage() {
  const settings = useSettings()

  // Parse timeline from settings, fallback to default
  let timeline = defaultTimeline
  try {
    const parsed = JSON.parse(settings.about_timeline || '[]')
    if (parsed.length > 0) timeline = parsed
  } catch {}

  // Read content from settings with defaults
  const teacherName = settings.about_teacher_name || 'Thầy Tuấn'
  const teacherTitle = settings.about_teacher_title || 'Chuyên luyện thi Toán lớp 1 - 6, TIMO, SASMO'
  const teacherBio = settings.about_teacher_bio || 'Nhiều năm kinh nghiệm luyện thi Toán quốc tế (TIMO, SASMO, IKMC, FMO). Đã giúp hàng trăm học sinh đạt giải Perfect Scorer, Gold Award trong các kỳ thi Toán quốc tế. Chuyên dạy Toán tư duy cho học sinh lớp 1 đến lớp 6.'
  const badge = settings.about_badge || 'Thủ khoa ĐH'
  const avatarUrl = settings.about_avatar || '/avatar.png'

  const stats = [
    { icon: Award,    value: settings.about_stat_1_value || '8',    suffix: settings.about_stat_1_value?.includes('K') ? '' : '+', label: settings.about_stat_1_label || 'Năm kinh nghiệm' },
    { icon: Users,    value: settings.about_stat_2_value || '170',  suffix: settings.about_stat_2_value?.includes('K') ? '' : 'K+', label: settings.about_stat_2_label || 'Học sinh theo học' },
    { icon: Tv,       value: settings.about_stat_3_value || '#1',   suffix: '',                                                      label: settings.about_stat_3_label || 'Top livestream' },
    { icon: BookOpen, value: settings.about_stat_4_value || '7',    suffix: '+',                                                     label: settings.about_stat_4_label || 'Khóa học' },
  ]

  const mission1 = settings.about_mission_1 || `Với niềm đam mê giảng dạy và mong muốn truyền cảm hứng học tập cho thế hệ trẻ, ${teacherName} đã xây dựng hệ thống khóa học trực tuyến chất lượng cao, giúp hàng ngàn học sinh trên cả nước tiếp cận với phương pháp học Toán hiệu quả.`
  const mission2 = settings.about_mission_2 || 'Hệ thống khóa học được thiết kế khoa học, từ cơ bản đến nâng cao, phù hợp với mọi đối tượng học sinh. Mỗi bài giảng đều được đầu tư kỹ lưỡng về nội dung và hình thức, đảm bảo học sinh có thể hiểu sâu và vận dụng linh hoạt.'

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
                  src={avatarUrl}
                  alt={teacherName}
                  className="w-44 h-44 lg:w-56 lg:h-56 rounded-3xl object-cover shadow-lg
                             ring-4 ring-brand-400/30"
                />
                {/* Badge */}
                {badge && (
                  <div className="absolute -bottom-3 -right-3 bg-brand-500
                                  text-brand-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                    <GraduationCap size={14} className="inline mr-1" />
                    {badge}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Info */}
            <ScrollReveal direction="right" delay={200}>
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl lg:text-5xl font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-heading)' }}>
                  {teacherName}
                </h1>
                <p className="text-brand-300 font-semibold text-lg mb-5">
                  {teacherTitle}
                </p>
                <p className="text-brand-100/80 leading-relaxed max-w-xl">
                  {teacherBio}
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* ========== STATS ========== */}
      <div className="mx-4 md:mx-16 xl:mx-[10%] -mt-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {stats.map((s, i) => (
            <AnimatedStat key={i} icon={s.icon} label={s.label} value={s.value} suffix={s.suffix} delay={i * 100} />
          ))}
        </div>
      </div>

      {/* ========== TIMELINE ========== */}
      <div className="mx-4 md:mx-16 xl:mx-[10%] mt-12">
        {/* Striped background wrapper */}
        <div className="rounded-3xl overflow-hidden p-8 lg:p-12"
             style={{
               background: 'repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 18px, #fff7ed 18px, #fff7ed 20px, #ffffff 20px, #ffffff 38px, #fed7aa 38px, #fed7aa 40px)',
             }}>
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
            {/* Timeline line */}
            <div className="absolute left-6 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5
                            bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500" />

            {timeline.map((item, i) => {
              const isLeft = i % 2 === 0
              const TimeIcon = timelineIcons[i % timelineIcons.length]

              return (
                <ScrollReveal key={i} delay={i * 120} direction={isLeft ? 'left' : 'right'}>
                  <div className={`relative flex items-start gap-6 mb-8
                                   lg:${isLeft ? 'flex-row' : 'flex-row-reverse'}
                                   lg:gap-12`}>
                    {/* Timeline dot */}
                    <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 z-10
                                    w-12 h-12 rounded-full bg-white shadow-lg
                                    flex items-center justify-center
                                    border-2 border-amber-400">
                      <TimeIcon size={20} className="text-orange-500" />
                    </div>

                    {/* Content */}
                    <div className={`ml-20 lg:ml-0 lg:w-[calc(50%-3rem)]
                                     ${isLeft ? 'lg:text-right lg:pr-0' : 'lg:text-left lg:ml-auto lg:pl-0'}`}>
                      <div className="bg-white rounded-2xl shadow-card p-5
                                      transition-all duration-300 border border-amber-100/50">
                        <span className="inline-block text-xs font-bold text-orange-600
                                         bg-orange-100 px-2.5 py-0.5 rounded-full mb-2">
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
                <p>{mission1}</p>
                <p>{mission2}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
