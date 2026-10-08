import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  Gavel, IndianRupee, TrendingUp, Plus, Filter,
  ChevronRight, Clock, CheckCircle, AlertTriangle, XCircle,
  Eye, FileText, MoreHorizontal, Zap, ArrowUpRight
} from 'lucide-react'

const CASES = [
  {
    id: 'CK-90428',
    product: 'boAt Airdopes 141 ANC',
    platform: 'Amazon',
    amount: '₹2,499',
    status: 'ready',
    strength: 86,
    date: '2 hours ago',
    category: 'Electronics',
    defect: 'Fractured Casing',
    statutoryGround: 'Section 2(9) CPA 2019',
    evidence: 3,
  },
  {
    id: 'CK-88201',
    product: 'Samsung Galaxy M34 5G',
    platform: 'Flipkart',
    amount: '₹18,999',
    status: 'sent',
    strength: 92,
    date: '3 days ago',
    category: 'Electronics',
    defect: 'Battery Drain',
    statutoryGround: 'Section 2(9) CPA 2019',
    evidence: 5,
  },
  {
    id: 'CK-85110',
    product: 'Prestige Induction Cooktop',
    platform: 'Meesho',
    amount: '₹6,200',
    status: 'sent',
    strength: 79,
    date: '1 week ago',
    category: 'Home Appliances',
    defect: 'No power on delivery',
    statutoryGround: 'Section 2(9) CPA 2019',
    evidence: 4,
  },
  {
    id: 'CK-81003',
    product: 'Puma Sports Shoes',
    platform: 'Myntra',
    amount: '₹4,500',
    status: 'in-progress',
    strength: 71,
    date: '2 weeks ago',
    category: 'Footwear',
    defect: 'Sole separation within 2 days',
    statutoryGround: 'Section 2(9) CPA 2019',
    evidence: 2,
  },
]

const STATUS_CONFIG = {
  ready: {
    label: 'Ready to Send',
    color: '#84CC16',
    bg: 'rgba(132,204,22,0.1)',
    border: 'rgba(132,204,22,0.25)',
    icon: CheckCircle,
  },
  sent: {
    label: 'Notice Sent',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.25)',
    icon: CheckCircle,
  },
  'in-progress': {
    label: 'In Progress',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    icon: Clock,
  },
  escalated: {
    label: 'Escalated to NCH',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    icon: AlertTriangle,
  },
}

const FILTERS = ['All', 'Ready', 'Sent', 'In Progress']

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['in-progress']
  const Icon = cfg.icon
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function StrengthBar({ value }) {
  const color = value >= 80 ? '#84CC16' : value >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(132,204,22,0.1)' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-mono-ck text-xs font-bold" style={{ color, minWidth: '30px' }}>{value}</span>
    </div>
  )
}

export default function MyCases() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')
  const [hoveredCase, setHoveredCase] = useState(null)

  const filtered = activeFilter === 'All'
    ? CASES
    : CASES.filter(c => STATUS_CONFIG[c.status]?.label.toLowerCase().includes(activeFilter.toLowerCase()))

  const totalAmount = '₹38,400'
  const avgStrength = Math.round(CASES.reduce((a, c) => a + c.strength, 0) / CASES.length)

  return (
    <DashboardLayout
      title="My Cases"
      subtitle="Track, manage and dispatch your AI-powered consumer disputes"
    >
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* ─── KPI CARDS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Gavel,
              label: 'Total Claims',
              value: `${CASES.length}`,
              sub: 'dossiers logged',
              badge: '+1 this week',
              badgeColor: '#84CC16',
              iconBg: 'rgba(132,204,22,0.1)',
              iconColor: '#84CC16',
            },
            {
              icon: IndianRupee,
              label: 'Complaints Sent',
              value: '3',
              sub: `• ${totalAmount}`,
              badge: '100% payout rate',
              badgeColor: '#22C55E',
              iconBg: 'rgba(34,197,94,0.1)',
              iconColor: '#22C55E',
            },
            {
              icon: TrendingUp,
              label: 'Avg Claim Strength',
              value: avgStrength.toString(),
              sub: '/ 100',
              badge: 'High win probability',
              badgeColor: '#84CC16',
              iconBg: 'rgba(132,204,22,0.08)',
              iconColor: '#65A300',
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="relative overflow-hidden p-5 rounded-2xl flex flex-col justify-between"
                style={{
                  background: '#161921',
                  border: '1px solid rgba(132,204,22,0.08)',
                  minHeight: '150px',
                }}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl"
                  style={{ background: `${stat.badgeColor}10` }} />
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: stat.iconBg }}
                  >
                    <Icon size={20} style={{ color: stat.iconColor }} />
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: `${stat.badgeColor}15`,
                      color: stat.badgeColor,
                      border: `1px solid ${stat.badgeColor}30`,
                    }}
                  >
                    {stat.badge}
                  </span>
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#9196B0' }}>{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="font-jakarta font-extrabold text-4xl" style={{ color: '#E8EAF6', lineHeight: 1 }}>
                      {stat.value}
                    </h3>
                    <span className="font-mono-ck text-sm" style={{ color: '#9196B0' }}>{stat.sub}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── FILTER ROW ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-4 h-9 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: activeFilter === f ? 'linear-gradient(135deg, #84CC16, #65A300)' : 'rgba(28,32,48,0.8)',
                  color: activeFilter === f ? '#0B0D11' : '#9196B0',
                  border: activeFilter === f ? 'none' : '1px solid rgba(132,204,22,0.1)',
                }}
              >
                {f}
                {f === 'All' && (
                  <span
                    className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: activeFilter === f ? 'rgba(0,0,0,0.2)' : 'rgba(132,204,22,0.1)',
                      color: activeFilter === f ? '#0B0D11' : '#84CC16',
                    }}
                  >
                    {CASES.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium"
            style={{
              background: 'rgba(28,32,48,0.8)',
              border: '1px solid rgba(132,204,22,0.1)',
              color: '#9196B0',
            }}
          >
            <Filter size={14} />
            Filter & Sort
          </button>
        </div>

        {/* ─── CASES TABLE ─── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
        >
          {/* Table header */}
          <div
            className="grid gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: '#4a5070',
              borderBottom: '1px solid rgba(132,204,22,0.06)',
              gridTemplateColumns: '1fr 1fr 100px 120px 120px 80px',
            }}
          >
            <span>Case / Product</span>
            <span>Defect & Ground</span>
            <span>Evidence</span>
            <span>Claim Strength</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {/* Cases */}
          {filtered.map((c) => (
            <div
              key={c.id}
              className="grid gap-4 px-5 py-4 items-center cursor-pointer transition-all"
              style={{
                gridTemplateColumns: '1fr 1fr 100px 120px 120px 80px',
                borderBottom: '1px solid rgba(132,204,22,0.04)',
                background: hoveredCase === c.id ? 'rgba(132,204,22,0.03)' : 'transparent',
              }}
              onMouseEnter={() => setHoveredCase(c.id)}
              onMouseLeave={() => setHoveredCase(null)}
              onClick={() => navigate(`/cases/${c.id}/review`)}
            >
              {/* Product info */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono-ck text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(132,204,22,0.08)', color: '#84CC16' }}>
                    #{c.id}
                  </span>
                  <span className="text-[10px]" style={{ color: '#6B7280' }}>{c.date}</span>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#E8EAF6' }}>{c.product}</p>
                <p className="text-xs" style={{ color: '#6B7280' }}>{c.platform} · {c.category} · {c.amount}</p>
              </div>

              {/* Defect */}
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium" style={{ color: '#E8EAF6' }}>{c.defect}</p>
                <p className="text-[10px] font-mono-ck" style={{ color: '#65A300' }}>{c.statutoryGround}</p>
              </div>

              {/* Evidence count */}
              <div className="flex items-center gap-1.5">
                <FileText size={14} style={{ color: '#9196B0' }} />
                <span className="text-sm font-semibold font-mono-ck" style={{ color: '#E8EAF6' }}>{c.evidence}</span>
                <span className="text-xs" style={{ color: '#6B7280' }}>files</span>
              </div>

              {/* Strength */}
              <div className="w-28">
                <StrengthBar value={c.strength} />
              </div>

              {/* Status */}
              <StatusPill status={c.status} />

              {/* Actions */}
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(28,32,48,0.8)', color: '#9196B0', border: '1px solid rgba(132,204,22,0.08)' }}
                  onClick={() => navigate(`/cases/${c.id}/review`)}
                >
                  <Eye size={14} />
                </button>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(28,32,48,0.8)', color: '#9196B0', border: '1px solid rgba(132,204,22,0.08)' }}
                >
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* New claim row */}
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer transition-all"
            style={{ borderTop: '1px solid rgba(132,204,22,0.06)' }}
            onClick={() => navigate('/new')}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(132,204,22,0.08)', border: '1px dashed rgba(132,204,22,0.3)' }}
              >
                <Plus size={16} style={{ color: '#84CC16' }} />
              </div>
              <span className="text-sm font-medium" style={{ color: '#84CC16' }}>
                Start a new claim
              </span>
            </div>
            <ArrowUpRight size={16} style={{ color: '#84CC16' }} />
          </div>
        </div>

        {/* ─── AI BANNER ─── */}
        <div
          className="flex items-center justify-between p-5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(132,204,22,0.06) 0%, rgba(101,163,0,0.04) 100%)',
            border: '1px solid rgba(132,204,22,0.15)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)' }}
            >
              <Zap size={18} color="#0B0D11" fill="currentColor" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#E8EAF6' }}>
                AI Auto-Extraction is Active
              </p>
              <p className="text-xs" style={{ color: '#9196B0' }}>
                Your new claims are automatically classified and matched under CPA 2019
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-5 h-10 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              color: '#0B0D11',
              boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            New Claim
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}
