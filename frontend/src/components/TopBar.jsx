import { Bell, Search, Shield, Zap } from 'lucide-react'

export default function TopBar({ title, subtitle }) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 flex-shrink-0"
      style={{
        background: 'rgba(17, 19, 24, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(132, 204, 22, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Left: Title */}
      <div>
        {title && (
          <h1
            className="font-jakarta font-bold text-lg leading-tight"
            style={{ color: '#E8EAF6' }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: '#9196B0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: Badges + Actions */}
      <div className="flex items-center gap-3">
        {/* NCH Status */}
        <div
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            color: '#22C55E',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          NCH Active • CPA 2019
        </div>

        {/* AI Status */}
        <div
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
          style={{
            background: 'rgba(132,204,22,0.06)',
            border: '1px solid rgba(132,204,22,0.15)',
            color: '#84CC16',
          }}
        >
          <Zap size={12} fill="currentColor" />
          <span className="font-mono-ck text-[11px]">AI Auto-Extraction: Active</span>
        </div>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{
            background: 'rgba(28,32,48,0.8)',
            border: '1px solid rgba(132,204,22,0.08)',
            color: '#9196B0',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#84CC16'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9196B0'; e.currentTarget.style.borderColor = 'rgba(132,204,22,0.08)' }}
        >
          <Bell size={16} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#84CC16' }}
          />
        </button>
      </div>
    </header>
  )
}
