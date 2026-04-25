import { useState } from 'react'
import { Key, CheckCircle, Sparkles } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'

export default function ActivatePage() {
  const [code, setCode] = useState('')

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%]">
      <ScrollReveal>
        <div className="max-w-lg mx-auto">
          <div className="relative bg-white rounded-3xl shadow-section overflow-hidden">
            {/* Solid accent bar */}
            <div className="h-1 bg-brand-500" />

            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-brand-100/50
                            rounded-bl-full" />

            <div className="relative p-8 lg:p-12 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-brand-100" />
                <div className="relative w-full h-full rounded-full
                                flex items-center justify-center">
                  <Key size={32} className="text-brand-600" />
                </div>
                {/* Floating sparkle */}
                <Sparkles size={16} className="absolute -top-1 -right-1 text-brand-400" />
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-brand-900 mb-2"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                Kích hoạt khoá học
              </h1>
              <p className="text-gray-400 mb-8 text-sm">
                Nhập mã kích hoạt để mở khóa học của bạn
              </p>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Nhập mã kích hoạt..."
                    className="w-full h-14 px-5 rounded-2xl border-2 border-brand-200
                               text-center text-lg font-semibold
                               focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                               placeholder:text-gray-300 transition-all duration-300
                               bg-brand-50/30"
                  />
                </div>
                <button
                  className="w-full h-14 rounded-2xl font-bold text-lg
                             bg-brand-600 text-white
                             shadow-md
                             active:translate-y-0 transition-all duration-200
                             flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  Kích hoạt
                </button>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
