import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FolderOpen, FileText, Gavel, IndianRupee, Settings,
  LogOut, Bell, Plus, Shield, Menu, X, ChevronRight,
  LayoutDashboard, Star
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',           icon: LayoutDashboard, path: '/dashboard' },
  { id: 'cases',    label: 'Case Dossiers',       icon: FolderOpen,   path: '/cases'  },
  { id: 'new',      label: 'New Claim',            icon: Plus,         path: '/new'    },
  { id: 'evidence', label: 'Evidence Vault',       icon: FileText,     path: '/evidence' },
  { id: 'drafts',   label: 'AI Legal Drafts',      icon: Gavel,        path: '/drafts' },
  { id: 'tracker',  label: 'Restitution Tracker',  icon: IndianRupee,  path: '/tracker' },
]

const BOTTOM_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

export default function Sidebar({ activeView, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  function handleNav(item) {
    if (onNavigate) onNavigate(item.id)
    navigate(item.path)
  }

  const currentPath = location.pathname

  return (
    <>
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full transition-all duration-300"
        style={{
          width: collapsed ? '72px' : '260px',
          background: '#111318',
          borderRight: '1px solid rgba(132,204,22,0.08)',
          flexShrink: 0,
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-5"
          style={{ borderBottom: '1px solid rgba(132,204,22,0.06)' }}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)' }}
              >
                <Shield size={18} color="#0B0D11" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-jakarta font-bold text-sm" style={{ color: '#E8EAF6', lineHeight: '1.2' }}>
                  ClaimKaro
                </p>
                <p className="font-mono-ck text-[10px]" style={{ color: '#84CC16', letterSpacing: '0.08em' }}>
                  AI · Legal OS
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto"
              style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)' }}
            >
              <Shield size={18} color="#0B0D11" strokeWidth={2.5} />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#9196B0', background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.color = '#84CC16'}
            onMouseLeave={e => e.currentTarget.style.color = '#9196B0'}
          >
            {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* New Claim CTA */}
        {!collapsed && (
          <div className="px-3 pt-4 pb-2">
            <button
              onClick={() => { navigate('/new') }}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #84CC16, #65A300)',
                color: '#0B0D11',
                boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="font-jakarta">New Claim</span>
            </button>
          </div>
        )}
        {collapsed && (
          <div className="px-2 pt-4 pb-2">
            <button
              onClick={() => navigate('/new')}
              className="w-full flex items-center justify-center h-10 rounded-xl transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', color: '#0B0D11' }}
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
          <p
            className="font-mono-ck text-[9px] uppercase tracking-widest px-3 py-2"
            style={{ color: '#4a5070' }}
          >
            {!collapsed ? 'Navigation' : '···'}
          </p>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path || (activeView && activeView === item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'nav-active' : ''}`}
                style={{
                  color: isActive ? '#84CC16' : '#9196B0',
                  background: isActive ? 'rgba(132,204,22,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #84CC16' : '3px solid transparent',
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? '#84CC16' : '#6B7280', flexShrink: 0 }}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="px-2 pb-4 space-y-0.5"
          style={{ borderTop: '1px solid rgba(132,204,22,0.06)', paddingTop: '12px' }}>
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.path || (activeView && activeView === item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'nav-active' : ''}`}
                style={{
                  color: isActive ? '#84CC16' : '#9196B0',
                  background: isActive ? 'rgba(132,204,22,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #84CC16' : '3px solid transparent',
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{ color: isActive ? '#84CC16' : '#6B7280', flexShrink: 0 }}
                />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}

          {/* User Avatar */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1"
            style={{ background: 'rgba(28,32,48,0.6)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-jakarta font-bold text-xs"
              style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', color: '#0B0D11' }}
            >
              CK
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: '#E8EAF6' }}>
                  Consumer
                </p>
                <p className="font-mono-ck text-[10px] truncate" style={{ color: '#9196B0' }}>
                  #CK-8941
                </p>
              </div>
            )}
            {!collapsed && (
              <button
                className="p-1 rounded-lg transition-colors"
                style={{ color: '#6B7280' }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
