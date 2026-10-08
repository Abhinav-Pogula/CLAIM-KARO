import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  CheckCircle, Share2, Download, ArrowLeft, Zap,
  Shield, Clock, TrendingUp, IndianRupee
} from 'lucide-react'

const NEXT_STEPS = [
  {
    icon: Clock,
    title: 'Merchant Response Window',
    desc: "Amazon has 15 business days to respond. We'll notify you immediately.",
    color: '#F59E0B',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    desc: 'Monitor your case status in real-time from your Case Dossiers dashboard.',
    color: '#84CC16',
  },
  {
    icon: Shield,
    title: 'Auto-Escalation Ready',
    desc: "If unanswered, we'll auto-prepare your NCH Forum filing under Section 35.",
    color: '#8B5CF6',
  },
]

export default function Result() {
  const navigate = useNavigate()

  return (
    <DashboardLayout title="Notice Sent" subtitle="Your legal notice has been dispatched">
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* ─── SUCCESS HERO ─── */}
        <div
          className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-3xl relative overflow-hidden"
          style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.12)' }}
        >
          {/* Glow */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(132,204,22,0.08) 0%, transparent 70%)' }} />

          {/* Confetti dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 3 === 0 ? '#84CC16' : i % 3 === 1 ? '#65A300' : '#22C55E',
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.4,
              }}
            />
          ))}

          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative z-10"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              boxShadow: '0 12px 48px rgba(132,204,22,0.4)',
            }}
          >
            <CheckCircle size={36} color="#0B0D11" strokeWidth={2.5} />
          </div>

          <h2 className="font-jakarta font-extrabold text-4xl mb-3 relative z-10"
            style={{ color: '#E8EAF6', letterSpacing: '-0.03em' }}>
            Notice Dispatched!
          </h2>
          <p className="text-base max-w-md relative z-10" style={{ color: '#9196B0' }}>
            Your AI-drafted legal notice has been sent to Amazon under Consumer Protection Act 2019.
            Reference case <span className="font-mono-ck" style={{ color: '#84CC16' }}>CK-90428</span>.
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 relative z-10">
            {[
              { label: 'Claim Amount', value: '₹2,499', color: '#84CC16' },
              { label: 'Legal Strength', value: '86/100', color: '#65A300' },
              { label: 'Response Deadline', value: '15 business days', color: '#22C55E' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center px-6 py-4 rounded-2xl"
                style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.1)' }}
              >
                <span className="font-mono-ck font-bold text-xl" style={{ color: s.color }}>{s.value}</span>
                <span className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 relative z-10">
            <button
              className="flex items-center gap-2 px-5 h-11 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: 'rgba(28,32,48,0.8)',
                border: '1px solid rgba(132,204,22,0.15)',
                color: '#9196B0',
              }}
            >
              <Download size={15} />
              Download Notice PDF
            </button>
            <button
              className="flex items-center gap-2 px-5 h-11 rounded-xl font-semibold text-sm"
              style={{
                background: 'rgba(28,32,48,0.8)',
                border: '1px solid rgba(132,204,22,0.15)',
                color: '#9196B0',
              }}
            >
              <Share2 size={15} />
              Share Case Link
            </button>
            <button
              onClick={() => navigate('/cases')}
              className="flex items-center gap-2 px-6 h-11 rounded-xl font-semibold text-sm transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #84CC16, #65A300)',
                color: '#0B0D11',
                boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
              }}
            >
              <ArrowLeft size={15} />
              Back to Cases
            </button>
          </div>
        </div>

        {/* ─── WHAT HAPPENS NEXT ─── */}
        <div
          className="p-6 rounded-2xl space-y-4"
          style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
        >
          <h3 className="font-jakarta font-bold text-base" style={{ color: '#E8EAF6' }}>
            What happens next?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {NEXT_STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="p-4 rounded-xl flex flex-col gap-3"
                  style={{ background: 'rgba(28,32,48,0.8)', border: `1px solid ${step.color}15` }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${step.color}15` }}
                  >
                    <Icon size={18} style={{ color: step.color }} />
                  </div>
                  <h4 className="font-semibold text-sm" style={{ color: '#E8EAF6' }}>{step.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#9196B0' }}>{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── NEW CLAIM CTA ─── */}
        <div
          className="flex items-center justify-between p-5 rounded-2xl"
          style={{
            background: 'rgba(132,204,22,0.04)',
            border: '1px solid rgba(132,204,22,0.12)',
          }}
        >
          <div>
            <p className="font-semibold text-sm" style={{ color: '#E8EAF6' }}>Have another defective product?</p>
            <p className="text-xs mt-0.5" style={{ color: '#9196B0' }}>
              File another claim — it's free and takes under a minute.
            </p>
          </div>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-5 h-10 rounded-xl font-semibold text-sm transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              color: '#0B0D11',
              boxShadow: '0 4px 16px rgba(132,204,22,0.2)',
            }}
          >
            <Zap size={14} fill="currentColor" />
            New Claim
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
