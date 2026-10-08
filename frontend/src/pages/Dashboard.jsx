import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, CheckCircle2, CircleDollarSign, FileText, Gavel,
  Plus, Send, ShieldCheck, Sparkles, TrendingUp
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

const CASES = [
  { id: 'CK-90428', merchant: 'Amazon', product: 'boAt Airdopes 141 ANC', amount: '₹2,499', status: 'Ready to send', score: 86, note: 'Warranty claim · 3 evidence files', action: 'Review & send' },
  { id: 'CK-88201', merchant: 'Flipkart', product: 'Samsung Galaxy M34 5G', amount: '₹18,999', status: 'Notice sent', score: 92, note: 'Awaiting merchant reply · Day 3 of 15', action: 'Track status' },
  { id: 'CK-81003', merchant: 'Myntra', product: 'Puma Sports Shoes', amount: '₹4,500', status: 'Needs evidence', score: 71, note: 'Add courier slip to strengthen the case', action: 'Continue claim' },
]

function ScoreRing({ score }) {
  const radius = 19
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative h-12 w-12 shrink-0">
      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48" aria-label={`Claim strength ${score} out of 100`}>
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#2A3050" strokeWidth="4" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke="#84CC16" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono-ck text-[11px] font-bold" style={{ color: '#E8EAF6' }}>{score}</span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const strength = useMemo(() => Math.round(CASES.reduce((sum, item) => sum + item.score, 0) / CASES.length), [])

  return (
    <DashboardLayout activeView="dashboard" title="Dashboard" subtitle="Your consumer-claim workspace at a glance">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono-ck text-[10px] uppercase tracking-[0.16em]" style={{ color: '#84CC16' }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#84CC16' }} /> Consumer litigation command centre
            </p>
            <h2 className="font-jakarta text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: '#E8EAF6' }}>Welcome back, Consumer.</h2>
            <p className="mt-1 text-sm" style={{ color: '#9196B0' }}>You have one claim ready to send today.</p>
          </div>
          <button onClick={() => navigate('/new')} className="btn-ai glow-primary flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-transform active:scale-95">
            <Plus size={17} strokeWidth={2.8} /> Start new claim
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: 'Total claims', value: '4', detail: '1 added this week', icon: Gavel },
            { label: 'Amount in dispute', value: '₹38,400', detail: '3 notices dispatched', icon: CircleDollarSign },
            { label: 'Average claim strength', value: `${strength}/100`, detail: 'High probability of recovery', icon: TrendingUp },
          ].map(({ label, value, detail, icon: Icon }) => (
            <article key={label} className="relative overflow-hidden rounded-2xl p-5" style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.1)' }}>
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl" style={{ background: 'rgba(132,204,22,0.12)' }} />
              <div className="relative flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(132,204,22,0.12)', color: '#84CC16' }}><Icon size={20} /></div>
                <span className="rounded-full px-2.5 py-1 font-mono-ck text-[10px]" style={{ background: 'rgba(132,204,22,0.1)', color: '#84CC16' }}>Active</span>
              </div>
              <p className="relative mt-6 text-xs" style={{ color: '#9196B0' }}>{label}</p>
              <p className="relative mt-1 font-jakarta text-3xl font-extrabold" style={{ color: '#E8EAF6' }}>{value}</p>
              <p className="relative mt-2 text-xs" style={{ color: '#84CC16' }}>{detail}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_0.8fr]">
          <div className="rounded-2xl p-5 sm:p-6" style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.1)' }}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><h3 className="font-jakarta text-lg font-bold" style={{ color: '#E8EAF6' }}>Priority case dossiers</h3><p className="mt-1 text-xs" style={{ color: '#9196B0' }}>Continue where your evidence and legal route are strongest.</p></div>
              <button onClick={() => navigate('/cases')} className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#84CC16' }}>View all cases <ArrowRight size={15} /></button>
            </div>
            <div className="space-y-3">
              {CASES.map((claim) => (
                <article key={claim.id} className="group flex flex-col gap-4 rounded-xl p-4 transition-colors sm:flex-row sm:items-center" style={{ background: '#1C2030', border: '1px solid rgba(132,204,22,0.07)' }}>
                  <ScoreRing score={claim.score} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-mono-ck text-[10px] uppercase" style={{ color: '#84CC16' }}>{claim.merchant}</span><span className="text-xs" style={{ color: '#4a5070' }}>•</span><span className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>{claim.id}</span></div>
                    <p className="mt-1 truncate text-sm font-bold" style={{ color: '#E8EAF6' }}>{claim.product}</p>
                    <p className="mt-1 text-xs" style={{ color: '#9196B0' }}>{claim.note}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:block sm:text-right"><div><p className="font-mono-ck text-sm font-bold" style={{ color: '#E8EAF6' }}>{claim.amount}</p><p className="mt-1 text-[11px]" style={{ color: '#84CC16' }}>{claim.status}</p></div><button onClick={() => navigate(`/cases/${claim.id}/review`)} className="btn-ai mt-0 flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold sm:mt-3"><Send size={13} /> {claim.action}</button></div>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl p-5 sm:p-6" style={{ background: 'linear-gradient(145deg, #1C2030, #161921)', border: '1px solid rgba(132,204,22,0.18)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', color: '#0B0D11' }}><Sparkles size={19} /></div>
            <h3 className="mt-5 font-jakarta text-lg font-bold" style={{ color: '#E8EAF6' }}>AI claim assistant</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: '#9196B0' }}>Upload your invoice and evidence. ClaimKaro identifies the consumer-law route and prepares your notice.</p>
            <div className="mt-5 space-y-3">
              {['Extract purchase proof', 'Match CPA 2019 protections', 'Draft a send-ready legal notice'].map((item) => <div key={item} className="flex items-center gap-2 text-xs" style={{ color: '#E8EAF6' }}><CheckCircle2 size={15} style={{ color: '#84CC16' }} />{item}</div>)}
            </div>
            <button onClick={() => navigate('/new')} className="btn-ai mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold"><FileText size={16} /> Create my claim</button>
          </aside>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between" style={{ background: 'rgba(132,204,22,0.06)', border: '1px solid rgba(132,204,22,0.15)' }}>
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(132,204,22,0.15)', color: '#84CC16' }}><ShieldCheck size={20} /></div><div><p className="text-sm font-bold" style={{ color: '#E8EAF6' }}>Consumer Protection Act, 2019 ready</p><p className="mt-1 text-xs" style={{ color: '#9196B0' }}>Every case is structured for a clear merchant escalation or NCH complaint.</p></div></div>
          <button onClick={() => navigate('/drafts')} className="btn-ai flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold"><Gavel size={16} /> Open legal drafts</button>
        </section>
      </div>
    </DashboardLayout>
  )
}
