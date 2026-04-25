import { useState, useRef } from 'react'
import { Upload, X, Link, Image } from 'lucide-react'

/**
 * ImageUpload component - supports both URL input and file upload
 * @param {string} value - current image URL
 * @param {function} onChange - callback with new image URL
 * @param {string} label - field label (default: "Ảnh")
 */
export default function ImageUpload({ value, onChange, label = 'Ảnh' }) {
  const [mode, setMode] = useState('url') // 'url' or 'upload'
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate client-side
    if (file.size > 5 * 1024 * 1024) {
      setError('File quá lớn (tối đa 5MB)')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Chỉ chấp nhận ảnh JPEG, PNG, WebP, GIF')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onChange(data.url)
    } catch (err) {
      setError(err.message || 'Lỗi upload ảnh')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-2">
        <button type="button" onClick={() => setMode('url')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${mode === 'url' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Link size={12} /> URL
        </button>
        <button type="button" onClick={() => setMode('upload')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${mode === 'upload' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Upload size={12} /> Upload
        </button>
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... hoặc /uploads/..."
          className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
            ${uploading ? 'border-brand-400 bg-brand-50' : 'border-gray-300 hover:border-brand-500 hover:bg-brand-50'}`}
        >
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          {uploading ? (
            <div className="flex items-center gap-2 text-brand-600 text-sm">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              Đang upload...
            </div>
          ) : (
            <div className="text-center text-gray-400 text-xs">
              <Upload size={20} className="mx-auto mb-1" />
              <p>Click để chọn ảnh</p>
              <p className="text-[10px]">JPEG, PNG, WebP, GIF • Tối đa 5MB</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="mt-2 relative inline-block">
          <img src={value} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
          <button type="button" onClick={() => onChange('')}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  )
}
