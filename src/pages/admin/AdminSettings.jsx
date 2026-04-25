import { useState, useEffect } from 'react'
import { Save, Loader2, Globe, Phone, Mail, MapPin, CreditCard, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

export default function AdminSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setSettings(data || {}))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true); setSaved(false)
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (r.ok) setSaved(true)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Cài đặt trang</h1>
        <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          ✅ Cài đặt đã được lưu thành công
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Globe size={18} className="text-brand-600" /> Thông tin chung
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên trang web</label>
              <input type="text" value={settings.site_name || ''} onChange={e => update('site_name', e.target.value)}
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea value={settings.site_description || ''} onChange={e => update('site_description', e.target.value)} rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <ImageIcon size={18} className="text-brand-600" /> Hình ảnh
          </h2>
          <div className="space-y-4">
            <div>
              <ImageUpload value={settings.logo || ''} onChange={v => update('logo', v)} label="Logo" />
              {settings.logo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={settings.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  <span className="text-xs text-gray-400">Preview logo</span>
                </div>
              )}
            </div>
            <div>
              <ImageUpload value={settings.avatar || ''} onChange={v => update('avatar', v)} label="Avatar giáo viên" />
              {settings.avatar && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={settings.avatar} alt="Avatar" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  <span className="text-xs text-gray-400">Preview avatar</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Phone size={18} className="text-brand-600" /> Liên hệ
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={13} /> Địa chỉ
              </label>
              <input type="text" value={settings.address || ''} onChange={e => update('address', e.target.value)}
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Mail size={13} /> Email
              </label>
              <input type="email" value={settings.email || ''} onChange={e => update('email', e.target.value)}
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Phone size={13} /> Số điện thoại
              </label>
              <input type="text" value={settings.phone || ''} onChange={e => update('phone', e.target.value)}
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Social media */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            🌐 Mạng xã hội
          </h2>
          <div className="space-y-3">
            {[
              { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
              { key: 'youtube', label: 'Youtube', placeholder: 'https://youtube.com/...' },
              { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...' },
              { key: 'zalo', label: 'Zalo', placeholder: 'https://zalo.me/...' },
            ].map(s => (
              <div key={s.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
                <input type="text" value={settings[s.key] || ''} onChange={e => update(s.key, e.target.value)}
                       placeholder={s.placeholder}
                       className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Banking */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-brand-600" /> Thông tin ngân hàng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên ngân hàng</label>
              <input type="text" value={settings.bank_name || ''} onChange={e => update('bank_name', e.target.value)}
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
              <input type="text" value={settings.bank_account || ''} onChange={e => update('bank_account', e.target.value)}
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chủ tài khoản</label>
              <input type="text" value={settings.bank_owner || ''} onChange={e => update('bank_owner', e.target.value)}
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
