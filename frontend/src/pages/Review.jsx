import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  AlertTriangle, CheckCircle, Gavel, IndianRupee, FileText,
  Camera, Mic, ArrowRight, Zap, Share2, Download, Clock,
  ChevronRight, Shield, Star
} from 'lucide-react'

const MOCK_CASE = {
  id: 'CK-90428',
  product: 'boAt Airdopes 141 ANC',
  platform: 'Amazon',
  amount: '₹2,499',
  purchaseDate: '12 Sep 2026',
  defect: 'Fractured plastic casing — right earbud cracked within 3 days of use under normal conditions.',
  strength: 86,
  statutoryGround: 'Section 2(9) CPA 2019 — "Defect in Goods"',
  status: 'ready',
  evidence: [
    { type: 'Photo', label: 'Defect photo — right earbud fracture', color: '#84CC16', icon: Camera },
    { type: 'Invoice', label: 'Amazon Invoice INV-2026-994421', color: '#22C55E', icon: FileText },
    { type: 'Voice', label: 'Merchant call recording — 4m 12s', color: '#8B5CF6', icon: Mic },
  ],
  timeline: [
    { step: 'Claim Filed', date: '08 Oct 2026 14:32', done: true, active: false },
    { step: 'AI Analysis', date: '08 Oct 2026 14:33', done: true, active: false },
    { step: 'Legal Notice Drafted', date: '08 Oct 2026 14:34', done: true, active: false },
    { step: 'Notice Sent to Amazon', date: 'Pending', done: false, active: true },
    { step: 'Merchant Response', date: 'Awaiting', done: false, active: false },
    { step: 'Settlement / NCH Escalation', date: '—', done: false, active: false },
  ],
  draft: `LEGAL NOTICE

To,
The Grievance Officer,
Amazon Seller Services Pvt. Ltd.,
Brigade Gateway, 8th Floor, 26/1, Dr. Rajkumar Road, Bangalore – 560055

Subject: Notice of Defect in Goods under Section 2(9), Consumer Protection Act 2019

Dear Sir/Madam,

I, [Consumer Name], hereby serve this statutory legal notice upon your organization regarding the purchase of boAt Airdopes 141 ANC (Order ID: [ORDER-ID]) on September 12, 2026, through your platform Amazon.in.

The product developed a fractured plastic casing on the right earbud within 3 (three) days of purchase under normal operating conditions, constituting a "Defect in Goods" as defined under Section 2(9) of the Consumer Protection Act, 2019.

I hereby demand:
1. Full refund of ₹2,499 within 15 business days of receipt of this notice.
2. Alternatively, replacement with a brand new unit of identical or superior specifications.

Failure to comply will leave me with no option but to approach the District Consumer Disputes Redressal Commission under Section 35 of the Consumer Protection Act, 2019, where I shall also seek compensation for mental agony and litigation costs.

Yours faithfully,
[Consumer Name]
[Contact Details]
[Date: 08 October 2026]`,
}

function StrengthRing({ value }) {
  const color = value >= 80 ? '#84CC16' : value >= 60 ? '#F59E0B' : '#EF4444'
  const r = 45
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(132,204,22,0.08)" strokeWidth="7" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono-ck font-bold text-2xl" style={{ color }}>{value}</span>
        <span className="text-[9px] font-mono-ck uppercase" style={{ color: '#9196B0' }}>/ 100</span>
      </div>
    </div>
  )
}

export default function Review() {
  const { id } = useParams()
  const navigate = useNavigate()
  const c = MOCK_CASE

  return (
    <DashboardLayout title={`Case ${c.id}`} subtitle={`${c.product} · ${c.platform}`}>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* ─── STATUS BANNER ─── */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-2xl"
          style={{ background: 'rgba(132,204,22,0.06)', border: '1px solid rgba(132,204,22,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)' }}
            >
              <CheckCircle size={18} color="#0B0D11" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#84CC16' }}>Legal Notice Ready to Dispatch</p>
              <p className="text-xs" style={{ color: '#9196B0' }}>
                AI identified {c.statutoryGround} • Claim strength: {c.strength}/100
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.15)', color: '#9196B0' }}
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={() => navigate(`/cases/${id}/result`)}
              className="flex items-center gap-2 px-5 h-9 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #84CC16, #65A300)',
                color: '#0B0D11',
                boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
              }}
            >
              <Share2 size={14} />
              Send Notice
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* ─── LEFT: Score + Evidence ─── */}
          <div className="xl:col-span-4 space-y-5">

            {/* Strength Score Card */}
            <div
              className="p-6 rounded-2xl flex flex-col items-center gap-4"
              style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9196B0' }}>
                AI Legal Merit Score
              </p>
              <StrengthRing value={c.strength} />
              <div className="text-center">
                <p className="font-jakarta font-bold text-base" style={{ color: '#E8EAF6' }}>Strong Claim</p>
                <p className="text-xs mt-0.5" style={{ color: '#9196B0' }}>High win probability · 4 precedent matches</p>
              </div>
              <div
                className="w-full px-4 py-3 rounded-xl text-xs text-center"
                style={{ background: 'rgba(132,204,22,0.06)', border: '1px solid rgba(132,204,22,0.12)', color: '#84CC16' }}
              >
                <span className="font-mono-ck">{c.statutoryGround}</span>
              </div>
            </div>

            {/* Evidence */}
            <div
              className="p-5 rounded-2xl space-y-3"
              style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9196B0' }}>
                Evidence Vault ({c.evidence.length} items)
              </p>
              {c.evidence.map((ev) => {
                const Icon = ev.icon
                return (
                  <div
                    key={ev.label}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: 'rgba(28,32,48,0.8)', border: `1px solid ${ev.color}15` }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ev.color}12` }}
                    >
                      <Icon size={16} style={{ color: ev.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono-ck uppercase tracking-wider" style={{ color: ev.color }}>
                        {ev.type}
                      </p>
                      <p className="text-xs truncate" style={{ color: '#9196B0' }}>{ev.label}</p>
                    </div>
                    <CheckCircle size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
                  </div>
                )
              })}
            </div>

            {/* Timeline */}
            <div
              className="p-5 rounded-2xl space-y-4"
              style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9196B0' }}>
                Case Timeline
              </p>
              <div className="relative">
                <div className="absolute left-3.5 top-0 bottom-0 w-px"
                  style={{ background: 'rgba(132,204,22,0.1)' }} />
                <div className="space-y-4">
                  {c.timeline.map((t, i) => (
                    <div key={t.step} className="flex items-start gap-3 pl-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                        style={{
                          background: t.done ? 'linear-gradient(135deg, #84CC16, #65A300)'
                            : t.active ? 'rgba(132,204,22,0.2)'
                              : 'rgba(28,32,48,0.8)',
                          border: t.active ? '1px solid rgba(132,204,22,0.5)' : 'none',
                        }}
                      >
                        {t.done
                          ? <CheckCircle size={12} color="#0B0D11" />
                          : t.active
                            ? <Clock size={12} style={{ color: '#84CC16' }} />
                            : <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4a5070' }} />
                        }
                      </div>
                      <div>
                        <p className="text-xs font-semibold"
                          style={{ color: t.done || t.active ? '#E8EAF6' : '#6B7280' }}>
                          {t.step}
                        </p>
                        <p className="text-[10px] font-mono-ck"
                          style={{ color: t.done ? '#84CC16' : '#4a5070' }}>
                          {t.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Legal Notice Draft ─── */}
          <div className="xl:col-span-8 space-y-5">

            {/* Claim Summary */}
            <div
              className="p-5 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4"
              style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
            >
              {[
                { label: 'Product', value: c.product, mono: false },
                { label: 'Platform', value: c.platform, mono: false },
                { label: 'Claim Amount', value: c.amount, mono: true },
                { label: 'Purchase Date', value: c.purchaseDate, mono: true },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: '#6B7280' }}>
                    {item.label}
                  </p>
                  <p
                    className={`text-sm font-semibold ${item.mono ? 'font-mono-ck' : 'font-jakarta'}`}
                    style={{ color: '#E8EAF6' }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Defect description */}
            <div
              className="p-5 rounded-2xl"
              style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} style={{ color: '#F59E0B' }} />
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#9196B0' }}>
                  Identified Defect
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#E8EAF6' }}>{c.defect}</p>
            </div>

            {/* Legal Notice Draft */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderBottom: '1px solid rgba(132,204,22,0.06)', background: 'rgba(132,204,22,0.03)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)' }}
                  >
                    <Gavel size={15} color="#0B0D11" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#E8EAF6' }}>AI-Generated Legal Notice</p>
                    <p className="text-xs" style={{ color: '#9196B0' }}>Under Consumer Protection Act 2019 · Section 35</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#84CC16' }} />
                  <span className="text-xs font-mono-ck" style={{ color: '#84CC16' }}>AI Verified</span>
                </div>
              </div>

              <div className="p-5">
                <pre
                  className="font-mono-ck text-xs leading-relaxed whitespace-pre-wrap"
                  style={{ color: '#9196B0', maxHeight: '400px', overflowY: 'auto' }}
                >
                  {c.draft}
                </pre>
              </div>

              <div
                className="flex items-center justify-between px-5 py-4"
                style={{ borderTop: '1px solid rgba(132,204,22,0.06)' }}
              >
                <p className="text-xs" style={{ color: '#6B7280' }}>
                  Review the notice above. Confirm before sending to merchant.
                </p>
                <button
                  onClick={() => navigate(`/cases/${id}/result`)}
                  className="flex items-center gap-2 px-6 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #84CC16, #65A300)',
                    color: '#0B0D11',
                    boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
                  }}
                >
                  <Zap size={14} fill="currentColor" />
                  Confirm & Send Notice
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
