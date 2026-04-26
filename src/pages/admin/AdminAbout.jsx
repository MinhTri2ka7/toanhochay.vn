import { useState, useEffect } from 'react'
import { Save, Loader2, Info, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'

export default function AdminAbout() {
  const [settings, setSettings] = useState({})
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setSettings(data || {})
        // Parse timeline from settings
        try {
          const tl = JSON.parse(data?.about_timeline || '[]')
          setTimeline(tl.length > 0 ? tl : getDefaultTimeline())
        } catch {
          setTimeline(getDefaultTimeline())
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function getDefaultTimeline() {
    return [
      { year: '2016', title: 'Bắt đầu hành trình', desc: 'Khởi đầu con đường giảng dạy Toán với niềm đam mê cháy bỏng.' },
      { year: '2018', title: 'Mở rộng', desc: 'Phát triển chương trình và tiếp cận nhiều học sinh hơn.' },
      { year: '2020', title: 'Nền tảng trực tuyến', desc: 'Ra mắt hệ thống khóa học trực tuyến.' },
      { year: '2024', title: 'Thành tích', desc: 'Hàng trăm học sinh đạt giải quốc tế.' },
    ]
  }

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function updateTimelineItem(index, field, value) {
    setTimeline(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    setSaved(false)
  }

  function addTimelineItem() {
    setTimeline(prev => [...prev, { year: new Date().getFullYear().toString(), title: '', desc: '' }])
    setSaved(false)
  }

  function removeTimelineItem(index) {
    setTimeline(prev => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  function moveTimelineItem(index, direction) {
    setTimeline(prev => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true); setSaved(false)
    try {
      // Include timeline as JSON in settings
      const payload = {
        ...settings,
        about_timeline: JSON.stringify(timeline),
      }
      const r = await fetch('/api/admin/settings', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (r.ok) setSaved(true)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>
            Trang Giới thiệu
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Chỉnh sửa nội dung trang Giới thiệu hiển thị cho học sinh</p>
        </div>
        <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold
                           bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          ✅ Đã lưu thành công
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========== HERO SECTION ========== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Info size={18} className="text-brand-600" />
            Thông tin giáo viên
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên giáo viên</label>
              <input type="text" value={settings.about_teacher_name || ''} onChange={e => update('about_teacher_name', e.target.value)}
                     placeholder="Thầy Tuấn"
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chức danh / Chuyên môn</label>
              <input type="text" value={settings.about_teacher_title || ''} onChange={e => update('about_teacher_title', e.target.value)}
                     placeholder="Chuyên luyện thi Toán lớp 1 - 6, TIMO, SASMO"
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge nhỏ (góc avatar)</label>
              <input type="text" value={settings.about_badge || ''} onChange={e => update('about_badge', e.target.value)}
                     placeholder="Thủ khoa ĐH"
                     className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả giáo viên</label>
              <textarea value={settings.about_teacher_bio || ''} onChange={e => update('about_teacher_bio', e.target.value)} rows={4}
                        placeholder="Nhiều năm kinh nghiệm luyện thi Toán quốc tế..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
            </div>
            <div>
              <ImageUpload value={settings.about_avatar || ''} onChange={v => update('about_avatar', v)} label="Ảnh đại diện" />
              {settings.about_avatar && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={settings.about_avatar} alt="Avatar" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                  <span className="text-xs text-gray-400">Preview</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== STATS ========== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
            📊 Thống kê (4 ô)
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="grid grid-cols-3 gap-2 items-center">
                <span className="text-xs font-semibold text-gray-500">Ô {n}:</span>
                <input type="text" value={settings[`about_stat_${n}_value`] || ''} onChange={e => update(`about_stat_${n}_value`, e.target.value)}
                       placeholder={n===1?'8+':n===2?'170K+':n===3?'#1':'7+'}
                       className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                <input type="text" value={settings[`about_stat_${n}_label`] || ''} onChange={e => update(`about_stat_${n}_label`, e.target.value)}
                       placeholder={n===1?'Năm KN':n===2?'Học sinh':n===3?'Top Livestream':'Khóa học'}
                       className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
              </div>
            ))}
            <p className="text-[11px] text-gray-400">Mỗi hàng: Giá trị | Nhãn</p>
          </div>

          {/* ========== MISSION ========== */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              🎯 Sứ mệnh
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đoạn 1</label>
                <textarea value={settings.about_mission_1 || ''} onChange={e => update('about_mission_1', e.target.value)} rows={3}
                          placeholder="Với niềm đam mê giảng dạy và mong muốn truyền cảm hứng học tập..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đoạn 2</label>
                <textarea value={settings.about_mission_2 || ''} onChange={e => update('about_mission_2', e.target.value)} rows={3}
                          placeholder="Hệ thống khóa học được thiết kế khoa học, từ cơ bản đến nâng cao..."
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* ========== TIMELINE ========== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              🗓️ Hành trình phát triển (Timeline)
            </h2>
            <button onClick={addTimelineItem}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold
                               bg-brand-100 text-brand-800 hover:bg-brand-200 transition-colors">
              <Plus size={14} /> Thêm mốc
            </button>
          </div>

          {timeline.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Chưa có mốc thời gian nào. Bấm "Thêm mốc" để bắt đầu.</p>
          )}

          <div className="space-y-3">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex flex-col gap-0.5 pt-1.5 shrink-0">
                  <button onClick={() => moveTimelineItem(index, -1)} disabled={index === 0}
                          className="p-0.5 rounded text-gray-400 hover:text-brand-600 disabled:opacity-30 transition-colors">
                    <ChevronUp size={14} />
                  </button>
                  <GripVertical size={14} className="text-gray-300 mx-auto" />
                  <button onClick={() => moveTimelineItem(index, 1)} disabled={index === timeline.length - 1}
                          className="p-0.5 rounded text-gray-400 hover:text-brand-600 disabled:opacity-30 transition-colors">
                    <ChevronDown size={14} />
                  </button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[100px_1fr_2fr] gap-2">
                  <input type="text" value={item.year} onChange={e => updateTimelineItem(index, 'year', e.target.value)}
                         placeholder="2024"
                         className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-bold text-brand-700
                                    focus:border-brand-500 outline-none" />
                  <input type="text" value={item.title} onChange={e => updateTimelineItem(index, 'title', e.target.value)}
                         placeholder="Tiêu đề mốc"
                         className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                  <input type="text" value={item.desc} onChange={e => updateTimelineItem(index, 'desc', e.target.value)}
                         placeholder="Mô tả chi tiết"
                         className="h-9 px-3 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none" />
                </div>
                <button onClick={() => removeTimelineItem(index)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 mt-0.5">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
