import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, FileText, Download, Share2, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'

export default function ActionMenu({ caseItem, onAction }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (action) => {
    setIsOpen(false)
    if (onAction) onAction(action, caseItem)
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
        style={{ color: '#9196B0' }}
        title="More actions"
      >
        <MoreHorizontal size={16} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1 w-52 rounded-xl py-1 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
          style={{
            background: '#161921',
            border: '1px solid rgba(132,204,22,0.18)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
          }}
        >
          <button
            onClick={() => handleSelect('view')}
            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors hover:bg-[#84CC16]/10 hover:text-[#84CC16]"
            style={{ color: '#E8EAF6' }}
          >
            <FileText size={14} />
            <span>View Full Dossier</span>
          </button>

          <button
            onClick={() => handleSelect('download')}
            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors hover:bg-[#84CC16]/10 hover:text-[#84CC16]"
            style={{ color: '#E8EAF6' }}
          >
            <Download size={14} />
            <span>Download Legal Notice PDF</span>
          </button>

          <button
            onClick={() => handleSelect('share')}
            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors hover:bg-[#84CC16]/10 hover:text-[#84CC16]"
            style={{ color: '#E8EAF6' }}
          >
            <Share2 size={14} />
            <span>Copy Tracking Docket</span>
          </button>

          <div className="my-1 border-t border-white/5" />

          <button
            onClick={() => handleSelect('escalate')}
            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors hover:bg-amber-500/10 text-amber-400"
          >
            <AlertTriangle size={14} />
            <span>Escalate to NCH Portal</span>
          </button>

          <button
            onClick={() => handleSelect('resolve')}
            className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 transition-colors hover:bg-emerald-500/10 text-emerald-400"
          >
            <CheckCircle size={14} />
            <span>Mark Restitution Received</span>
          </button>
        </div>
      )}
    </div>
  )
}
