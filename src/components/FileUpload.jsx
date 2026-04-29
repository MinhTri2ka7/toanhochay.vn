import { useState, useRef } from 'react'
import { Upload, X, Link, AlertCircle, FileText, CheckCircle2 } from 'lucide-react'

/**
 * FileUpload component - supports both URL input and file upload to Supabase Storage
 * @param {string} value - current file URL
 * @param {function} onChange - callback with new file URL
 * @param {function} onFileInfo - optional callback with { name, size, type } on upload
 * @param {string} label - field label (default: "Tài liệu")
 * @param {string} accept - accepted file types (default: common doc types)
 * @param {number} maxSizeMB - max file size in MB (default: 20)
 */
export default function FileUpload({
  value, onChange, onFileInfo, label = 'Tài liệu',
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar',
  maxSizeMB = 20,
}) {
  const [mode, setMode] = useState('url') // 'url' or 'upload'
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadedName, setUploadedName] = useState('')
  const fileRef = useRef(null)

  function showError(msg) {
    setError(msg)
    setTimeout(() => setError(''), 8000)
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      showError(`File "${file.name}" quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa ${maxSizeMB}MB.`)
      return
    }

    setUploading(true)
    setError('')
    setUploadedName('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload-file', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await res.json().catch(() => ({ error: `Server trả về lỗi ${res.status}` }))

      if (!res.ok) {
        throw new Error(data.error || `Upload thất bại (HTTP ${res.status})`)
      }

      if (!data.url) {
        throw new Error('Server không trả về URL file')
      }

      onChange(data.url)
      setUploadedName(data.name || file.name)
      if (onFileInfo) {
        onFileInfo({ name: data.name || file.name, size: data.size || file.size, type: data.type || file.type })
      }
    } catch (err) {
      console.error('File upload error:', err)
      showError(err.message || 'Lỗi upload file. Vui lòng thử lại.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // Detect if current value looks like a Google Drive link
  const isDriveLink = value && (value.includes('drive.google.com') || value.includes('docs.google.com'))

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-2">
        <button type="button" onClick={() => { setMode('url'); setError('') }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${mode === 'url' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Link size={12} /> URL / Drive
        </button>
        <button type="button" onClick={() => { setMode('upload'); setError('') }}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all
                  ${mode === 'upload' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Upload size={12} /> Upload file
        </button>
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <div>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://drive.google.com/... hoặc link trực tiếp"
            className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            Hỗ trợ: Link Google Drive, Dropbox, hoặc URL trực tiếp đến file
          </p>
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative w-full h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all
            ${uploading ? 'border-brand-400 bg-brand-50' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-brand-500 hover:bg-brand-50'}`}
        >
          <input ref={fileRef} type="file" accept={accept} onChange={handleFileUpload} className="hidden" />
          {uploading ? (
            <div className="flex items-center gap-2 text-brand-600 text-sm">
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              Đang upload...
            </div>
          ) : (
            <div className="text-center text-gray-400 text-xs">
              <Upload size={20} className="mx-auto mb-1" />
              <p>Click để chọn file</p>
              <p className="text-[10px]">PDF, DOC, XLS, PPT, ZIP... • Tối đa {maxSizeMB}MB</p>
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

      {/* Preview / current value */}
      {value && (
        <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          {isDriveLink ? (
            <img src="https://www.google.com/images/about/logo.svg" alt="Drive" className="w-5 h-5 shrink-0 opacity-60" onError={e => { e.target.style.display = 'none' }} />
          ) : (
            <FileText size={16} className="text-brand-600 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700 font-medium truncate">
              {uploadedName || (isDriveLink ? 'Google Drive Link' : value.split('/').pop() || value)}
            </p>
            {isDriveLink && (
              <p className="text-[10px] text-blue-500">Google Drive</p>
            )}
          </div>
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
          <a href={value} target="_blank" rel="noopener noreferrer"
             className="text-xs text-brand-600 hover:text-brand-800 font-semibold shrink-0"
             onClick={e => e.stopPropagation()}>
            Xem
          </a>
          <button type="button" onClick={() => { onChange(''); setUploadedName('') }}
                  className="text-gray-400 hover:text-red-500 shrink-0">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
