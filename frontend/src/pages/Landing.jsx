import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Zap, ArrowRight, CheckCircle, Star, Users, TrendingUp, Play, ChevronRight } from 'lucide-react'

const STATS = [
  { value: '94.2%', label: 'Merchant Reply Rate', color: '#84CC16' },
  { value: '<60s',  label: 'AI Drafting Speed',   color: '#65A300' },
  { value: '₹0',   label: 'Upfront Legal Cost',  color: '#E8EAF6' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload Evidence',
    desc: 'Photo of defect, voice note, invoice PDF — we accept all formats.',
    icon: '📸',
  },
  {
    step: '02',
    title: 'AI Analysis',
    desc: 'Our engine classifies defects, cross-references Consumer Protection Act 2019.',
    icon: '🤖',
  },
  {
    step: '03',
    title: 'Legal Draft',
    desc: 'Personalized notice generated under Section 2(9) CPA, NCH-ready.',
    icon: '📋',
  },
  {
    step: '04',
    title: 'Track & Recover',
    desc: 'Monitor merchant response. Escalate to NCH Forum if needed.',
    icon: '💰',
  },
]

const TESTIMONIALS = [
  {
    name: 'Priya S.',
    location: 'Mumbai',
    amount: '₹12,499',
    text: 'Got full refund for my defective boAt earbuds in 6 days. The AI drafted my notice perfectly.',
    rating: 5,
  },
  {
    name: 'Rahul K.',
    location: 'Bengaluru',
    amount: '₹38,400',
    text: 'Flipkart refused initially but ClaimKaro escalated to NCH. Full settlement received.',
    rating: 5,
  },
  {
    name: 'Ananya M.',
    location: 'Delhi',
    amount: '₹6,800',
    text: 'Amazingly simple. Uploaded my invoice photo, AI built the entire complaint in seconds.',
    rating: 5,
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [hoveredStep, setHoveredStep] = useState(null)

  return (
    <div className="min-h-screen" style={{ background: '#0B0D11' }}>
      {/* ─── NAVBAR ─── */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-16 h-20"
        style={{
          background: 'rgba(11,13,17,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(132,204,22,0.07)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', boxShadow: '0 4px 20px rgba(132,204,22,0.25)' }}
          >
            <Shield size={20} color="#0B0D11" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-jakarta font-bold text-base" style={{ color: '#E8EAF6' }}>
              ClaimKaro
            </span>
            <span
              className="ml-2 font-mono-ck text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{ background: 'rgba(132,204,22,0.12)', color: '#84CC16', border: '1px solid rgba(132,204,22,0.2)' }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {['How it works', 'Features', 'My Cases'].map((l) => (
            <button
              key={l}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ color: '#9196B0' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E8EAF6'; e.currentTarget.style.background = 'rgba(132,204,22,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#9196B0'; e.currentTarget.style.background = 'transparent' }}
              onClick={() => l === 'My Cases' && navigate('/cases')}
            >
              {l}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <div
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            NCH Connected • CPA 2019
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
            style={{ color: '#9196B0' }}
            onMouseEnter={e => e.currentTarget.style.color = '#E8EAF6'}
            onMouseLeave={e => e.currentTarget.style.color = '#9196B0'}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-5 h-10 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              color: '#0B0D11',
              boxShadow: '0 4px 20px rgba(132,204,22,0.25)',
            }}
          >
            <Zap size={14} fill="currentColor" />
            New Claim
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden px-6 lg:px-16 pt-20 pb-24">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-40 right-10 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(132,204,22,0.06) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute top-1/2 -left-32 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(101,163,0,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left copy */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6 animate-float-up">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(132,204,22,0.08)',
                border: '1px solid rgba(132,204,22,0.2)',
                color: '#84CC16',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#84CC16' }} />
              AI Arbitration Engine • 2,410+ Claims Settled This Month
            </div>

            {/* H1 */}
            <h1 className="font-jakarta font-extrabold text-5xl lg:text-6xl leading-tight" style={{ color: '#E8EAF6', letterSpacing: '-0.03em' }}>
              Defective product?{' '}
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #84CC16, #65A300, #84CC16)' }}
              >
                Let AI fight for your refund.
              </span>
            </h1>

            <p className="text-lg max-w-xl" style={{ color: '#9196B0', lineHeight: '1.7' }}>
              Upload a photo, a voice note and your invoice. ClaimKaro verifies your evidence and drafts a legal notice in under 60 seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/new')}
                className="flex items-center gap-2 px-7 h-12 rounded-xl font-semibold text-sm transition-all active:scale-95 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #84CC16, #65A300)',
                  color: '#0B0D11',
                  boxShadow: '0 8px 32px rgba(132,204,22,0.3)',
                }}
              >
                <Zap size={16} fill="currentColor" />
                Start a claim — it's free
              </button>
              <button
                className="flex items-center gap-2 px-6 h-12 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: 'rgba(28,32,48,0.8)',
                  border: '1px solid rgba(132,204,22,0.15)',
                  color: '#E8EAF6',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(132,204,22,0.4)'; e.currentTarget.style.color = '#84CC16' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(132,204,22,0.15)'; e.currentTarget.style.color = '#E8EAF6' }}
              >
                <Play size={16} />
                See how it works
              </button>
            </div>

            {/* Stats ribbon */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="p-3 rounded-xl"
                  style={{ background: 'rgba(28,32,48,0.7)', border: '1px solid rgba(132,204,22,0.07)' }}
                >
                  <p className="font-mono-ck font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Hero claim card */}
          <div className="lg:col-span-5 relative">
            <div
              className="absolute -inset-3 rounded-3xl blur-2xl opacity-50"
              style={{ background: 'linear-gradient(135deg, rgba(132,204,22,0.08), rgba(101,163,0,0.04))' }}
            />
            <div
              className="relative rounded-2xl p-5 flex flex-col gap-4"
              style={{
                background: '#161921',
                border: '1px solid rgba(132,204,22,0.12)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="font-mono-ck text-sm" style={{ color: '#E8EAF6' }}>CASE #CK-90428</span>
                </div>
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(132,204,22,0.1)', color: '#84CC16', border: '1px solid rgba(132,204,22,0.2)' }}
                >
                  boAt Airdopes 141
                </span>
              </div>

              {/* Product image placeholder */}
              <div
                className="relative rounded-xl h-44 flex items-center justify-center overflow-hidden"
                style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.06)' }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-2">🎧</div>
                  <p className="text-xs" style={{ color: '#6B7280' }}>Product image detected</p>
                </div>
                {/* Bounding box */}
                <div
                  className="absolute top-4 left-8 w-32 h-24 rounded-lg animate-pulse"
                  style={{ border: '2px dashed #EF4444' }}
                >
                  <div
                    className="absolute -top-3 left-2 px-2 py-0.5 rounded text-[10px] font-mono-ck flex items-center gap-1"
                    style={{ background: '#EF4444', color: '#fff' }}
                  >
                    Defect: Fractured Casing 98%
                  </div>
                </div>
                {/* Bottom overlays */}
                <div className="absolute bottom-2 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-ck" style={{ background: 'rgba(0,0,0,0.7)', color: '#9196B0' }}>
                    Serial #BT-990-23
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] flex items-center gap-1" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                    <CheckCircle size={10} /> Verified Purchase
                  </span>
                </div>
              </div>

              {/* Score + Legal */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.07)' }}
                >
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(132,204,22,0.1)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#84CC16" strokeWidth="3"
                        strokeDasharray="86 100" strokeLinecap="round" />
                    </svg>
                    <span className="absolute font-mono-ck font-bold text-sm" style={{ color: '#84CC16' }}>86</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#E8EAF6' }}>Strong claim</p>
                    <p className="text-[10px] font-mono-ck" style={{ color: '#9196B0' }}>86/100 Legal Merit</p>
                  </div>
                </div>
                <div
                  className="flex flex-col justify-center p-3 rounded-xl"
                  style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.07)' }}
                >
                  <p className="text-[10px] font-mono-ck uppercase tracking-wider" style={{ color: '#65A300' }}>Statutory Ground</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: '#E8EAF6' }}>Section 2(9) CPA</p>
                  <p className="text-[10px]" style={{ color: '#9196B0' }}>"Defect in Goods"</p>
                </div>
              </div>

              {/* Progress steps */}
              <div
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(28,32,48,0.8)', border: '1px solid rgba(132,204,22,0.07)' }}
              >
                {['Evidence', 'AI Analysis', 'Notice', 'Sent'].map((step, i) => (
                  <div key={step} className="flex items-center gap-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: i === 0 ? '#84CC16' : i < 2 ? 'rgba(132,204,22,0.2)' : 'rgba(28,32,48,0.8)',
                        color: i === 0 ? '#0B0D11' : '#9196B0',
                        border: i < 2 ? '1px solid rgba(132,204,22,0.3)' : '1px solid rgba(132,204,22,0.07)',
                      }}
                    >
                      {i < 1 ? '✓' : i + 1}
                    </div>
                    <span className="text-[9px] hidden sm:block" style={{ color: i === 0 ? '#84CC16' : '#6B7280' }}>{step}</span>
                    {i < 3 && <ChevronRight size={10} style={{ color: '#4a5070' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="px-6 lg:px-16 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono-ck text-xs uppercase tracking-widest mb-3" style={{ color: '#84CC16' }}>
              Simple Process
            </p>
            <h2 className="font-jakarta font-bold text-4xl" style={{ color: '#E8EAF6', letterSpacing: '-0.02em' }}>
              From complaint to refund in 4 steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="relative p-6 rounded-2xl flex flex-col gap-4 transition-all cursor-pointer"
                style={{
                  background: hoveredStep === i ? 'rgba(132,204,22,0.06)' : '#161921',
                  border: `1px solid ${hoveredStep === i ? 'rgba(132,204,22,0.25)' : 'rgba(132,204,22,0.07)'}`,
                  transform: hoveredStep === i ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredStep === i ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{step.icon}</span>
                  <span className="font-mono-ck text-3xl font-bold" style={{ color: 'rgba(132,204,22,0.12)' }}>
                    {step.step}
                  </span>
                </div>
                <h3 className="font-jakarta font-bold text-base" style={{ color: '#E8EAF6' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#9196B0' }}>{step.desc}</p>
                {i < 3 && (
                  <div
                    className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:block"
                    style={{ zIndex: 1 }}
                  >
                    <ArrowRight size={16} style={{ color: 'rgba(132,204,22,0.3)' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="px-6 lg:px-16 py-20" style={{ background: '#0D0F14' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-mono-ck text-xs uppercase tracking-widest mb-3" style={{ color: '#84CC16' }}>
              Real Consumers
            </p>
            <h2 className="font-jakarta font-bold text-4xl" style={{ color: '#E8EAF6', letterSpacing: '-0.02em' }}>
              Indians winning refunds every day
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl flex flex-col gap-4"
                style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="#84CC16" style={{ color: '#84CC16' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#9196B0' }}>"{t.text}"</p>
                <div className="flex items-center justify-between mt-auto pt-3"
                  style={{ borderTop: '1px solid rgba(132,204,22,0.07)' }}>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#E8EAF6' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>{t.location}</p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full font-mono-ck font-bold text-sm"
                    style={{ background: 'rgba(132,204,22,0.1)', color: '#84CC16', border: '1px solid rgba(132,204,22,0.2)' }}
                  >
                    {t.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="px-6 lg:px-16 py-24">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', boxShadow: '0 8px 32px rgba(132,204,22,0.3)' }}
          >
            <Shield size={28} color="#0B0D11" strokeWidth={2.5} />
          </div>
          <h2 className="font-jakarta font-extrabold text-5xl" style={{ color: '#E8EAF6', letterSpacing: '-0.03em' }}>
            Your refund is one click away.
          </h2>
          <p className="text-lg max-w-xl" style={{ color: '#9196B0' }}>
            No lawyers. No fees. Just AI-powered consumer rights under the Consumer Protection Act 2019.
          </p>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-3 px-10 h-14 rounded-2xl font-jakarta font-bold text-base transition-all active:scale-95 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              color: '#0B0D11',
              boxShadow: '0 12px 48px rgba(132,204,22,0.35)',
            }}
          >
            <Zap size={20} fill="currentColor" />
            Start Your Claim — Free
            <ArrowRight size={18} />
          </button>
          <div className="flex items-center gap-8 pt-2">
            {[
              { icon: <Users size={14} />, text: '12,000+ consumers served' },
              { icon: <TrendingUp size={14} />, text: '₹2.4Cr+ recovered' },
              { icon: <CheckCircle size={14} />, text: 'Section 35 CPA 2019 compliant' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                <span style={{ color: '#84CC16' }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer
        className="px-6 lg:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
        style={{ borderTop: '1px solid rgba(132,204,22,0.07)', color: '#6B7280' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)' }}>
            <Shield size={12} color="#0B0D11" />
          </div>
          <span style={{ color: '#9196B0' }}>ClaimKaro AI © 2026</span>
        </div>
        <p>Consumer Protection Act 2019 • National Consumer Helpline</p>
      </footer>
    </div>
  )
}
