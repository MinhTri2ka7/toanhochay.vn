import { useState, useRef } from 'react'
import { Upload, X, Link, AlertCircle } from 'lucide-react'

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
  const [imgError, setImgError] = useState(false)
  const fileRef = useRef(null)

  function showError(msg) {
    setError(msg)
    // Auto-clear after 8 seconds
    setTimeout(() => setError(''), 8000)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate client-side
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showError(`File "${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa 5MB.`)
      return
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      const ext = file.name.split('.').pop()?.toUpperCase() || '?'
      showError(`Định dạng .${ext} không được hỗ trợ. Chỉ chấp nhận: JPEG, PNG, WebP, GIF`)
      return
    }

    setUploading(true)
    setError('')
    setImgError(false)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await res.json().catch(() => ({ error: `Server trả về lỗi ${res.status}` }))

      if (!res.ok) {
        throw new Error(data.error || `Upload thất bại (HTTP ${res.status})`)
      }

      if (!data.url) {
        throw new Error('Server không trả về URL ảnh')
      }

      onChange(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      showError(err.message || 'Lỗi upload ảnh. Vui lòng thử lại.')
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
        <button type="button" onClick={() => { setMode('url'); setError('') }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${mode === 'url' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Link size={12} /> URL
        </button>
        <button type="button" onClick={() => { setMode('upload'); setError('') }}
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
          onChange={e => { onChange(e.target.value); setImgError(false) }}
          placeholder="https://... hoặc /uploads/..."
          className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
        />
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
            ${uploading ? 'border-brand-400 bg-brand-50' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-brand-500 hover:bg-brand-50'}`}
        >
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileUpload} className="hidden" />
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

      {/* Error banner */}
      {error && (
        <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2.5">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-red-600 text-xs font-medium">{error}</p>
            {mode === 'upload' && (
              <button type="button" onClick={() => { setError(''); fileRef.current?.click() }}
                      className="text-red-500 text-xs underline mt-1 hover:text-red-700">
                Thử lại
              </button>
            )}
          </div>
          <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 relative inline-block">
          <img
            src={value}
            alt="Preview"
            className={`w-20 h-20 rounded-lg object-cover border ${imgError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
          />
          {imgError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
              <p className="text-[9px] text-red-500 text-center px-1">Ảnh lỗi</p>
            </div>
          )}
          <button type="button" onClick={() => { onChange(''); setImgError(false) }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
            <X size={10} />
          </button>
        </div>
      )}
    </div>
  )
}

