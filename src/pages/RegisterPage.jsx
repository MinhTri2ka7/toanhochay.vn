import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  function updateField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      return setError('Mật khẩu phải có ít nhất 8 ký tự')
    }
    if (form.password !== form.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp')
    }

    setLoading(true)
    try {
      await register(form.name, form.email, form.phone, form.password, form.confirmPassword)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 mb-8 mx-4 md:mx-16 xl:mx-[10%] flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="relative bg-white rounded-3xl shadow-section overflow-hidden">
          <div className="h-1 bg-brand-500" />

          <div className="p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-brand-100
                              flex items-center justify-center mx-auto mb-4">
                <UserPlus size={28} className="text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-brand-900"
                  style={{ fontFamily: 'var(--font-heading)' }}>
                Đăng ký tài khoản
              </h1>
              <p className="text-gray-400 text-sm mt-1">Tạo tài khoản để bắt đầu học</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4
                              animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200
                             focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                             placeholder:text-gray-300 transition-all duration-200
                             text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200
                             focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                             placeholder:text-gray-300 transition-all duration-200
                             text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="0xxx xxx xxx"
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200
                             focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                             placeholder:text-gray-300 transition-all duration-200
                             text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => updateField('password', e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    required
                    minLength={8}
                    className="w-full h-12 px-4 pr-12 rounded-xl border-2 border-gray-200
                               focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                               placeholder:text-gray-300 transition-all duration-200
                               text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                               hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu *</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => updateField('confirmPassword', e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200
                             focus:border-brand-500 focus:ring-4 focus:ring-brand-100
                             placeholder:text-gray-300 transition-all duration-200
                             text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-base
                           bg-brand-600 text-white
                           disabled:opacity-60 disabled:cursor-not-allowed
                           shadow-md
                           transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} />
                    Đăng ký
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Đã có tài khoản?{' '}
              <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
                    className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
