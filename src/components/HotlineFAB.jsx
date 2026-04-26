import { Link } from 'react-router-dom'
import { ShoppingCart, Phone } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useSettings } from '../contexts/SettingsContext'

export default function HotlineFAB() {
  const { totalItems } = useCart()
  const settings = useSettings()
  const phone = settings.phone || '0984511618'
  const zaloLink = settings.zalo || `https://zalo.me/${phone}`

  return (
    <div className="fixed bottom-24 right-4 xl:bottom-28 xl:right-5 z-30
                    flex flex-col items-end gap-3">

      {/* Cart FAB */}
      <Link to="/gio-hang" className="fab-item group">
        <div className="relative w-[52px] h-[52px] rounded-full
                        bg-brand-600 text-white shadow-lg
                        flex items-center justify-center
                        ring-4 ring-brand-400/20
                        group-hover:bg-brand-700 group-hover:scale-110 group-hover:shadow-xl
                        active:scale-95 transition-all duration-200">
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1
                             bg-red-500 text-white text-[10px] font-bold
                             rounded-full flex items-center justify-center shadow-md">
              {totalItems}
            </span>
          )}
        </div>
      </Link>

      {/* Hotline FAB */}
      <a href={`tel:${phone}`} className="fab-item group flex items-center gap-2">
        <span className="hidden group-hover:flex items-center h-8 px-3
                         bg-white text-gray-700 text-xs font-bold
                         rounded-full shadow-lg whitespace-nowrap
                         animate-fade-in">
          {phone}
        </span>
        <div className="relative w-[52px] h-[52px] rounded-full
                        bg-red-500 text-white shadow-lg
                        flex items-center justify-center
                        ring-4 ring-red-400/20
                        group-hover:scale-110 group-hover:shadow-xl
                        active:scale-95 transition-all duration-200">
          <Phone size={22} className="animate-wiggle" />
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-red-400/40 animate-ping-slow" />
        </div>
      </a>

      {/* Zalo FAB */}
      <a href={zaloLink} target="_blank" rel="noopener noreferrer"
         className="fab-item group flex items-center gap-2">
        <span className="hidden group-hover:flex items-center h-8 px-3
                         bg-white text-gray-700 text-xs font-bold
                         rounded-full shadow-lg whitespace-nowrap
                         animate-fade-in">
          Chat Zalo
        </span>
        <div className="w-[52px] h-[52px] rounded-full
                        bg-blue-500 text-white shadow-lg
                        flex items-center justify-center
                        ring-4 ring-blue-400/20
                        group-hover:scale-110 group-hover:shadow-xl
                        active:scale-95 transition-all duration-200">
          {/* Zalo "Z" icon */}
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.18-.432-.792-.576-1.188-.576H8.34l6.804 7.56c.36.396.288.996-.108 1.356a.96.96 0 01-.636.24.96.96 0 01-.72-.312l-3.24-3.6v3.264a.96.96 0 01-1.92 0v-5.448L5.796 7.92a.96.96 0 01.108-1.356.96.96 0 011.356.108l1.98 2.196h7.38c1.476 0 2.148.696 2.4 1.332.252.636.108 1.476-.66 2.244l-3.36 3.36a.96.96 0 01-1.356-1.356l3.36-3.36c.288-.288.36-.504.264-.768z"/>
          </svg>
        </div>
      </a>
    </div>
  )
}
