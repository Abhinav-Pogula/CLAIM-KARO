import { CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck, Mail, Send } from 'lucide-react'

export default function Timeline({ events = [] }) {
  const defaultEvents = [
    {
      id: 1,
      title: 'Evidence Ingestion & Dossier Assembled',
      desc: 'Tax invoice OCR verified, photographic damage scored, and audio transcription processed.',
      date: 'Today, 2:15 PM',
      status: 'completed',
      badge: 'Section 2(9) CPA 2019',
    },
    {
      id: 2,
      title: 'Statutory Legal Notice Generated',
      desc: '15-day formal notice drafted citing relevant NCDRC precedents and deficiency of service.',
      date: 'Today, 2:16 PM',
      status: 'completed',
      badge: 'AI Legal OS',
    },
    {
      id: 3,
      title: 'Formal Notice Dispatched to Merchant & Brand',
      desc: 'Transmitted via registered statutory email channels to brand nodal officer and merchant legal team.',
      date: 'Today, 2:18 PM',
      status: 'active',
      badge: 'Registered Delivery',
    },
    {
      id: 4,
      title: 'Mandatory 15-Day Merchant SLA Window',
      desc: 'Merchant must respond with full restitution, replacement, or settlement offer under statutory guidelines.',
      date: 'Expires in 14 days',
      status: 'pending',
      badge: 'Statutory SLA',
    },
    {
      id: 5,
      title: 'Automatic NCH e-Daakhil Escalation',
      desc: 'If merchant fails to provide restitution, the case dossier is submitted to National Consumer Helpline Forum.',
      date: 'Scheduled',
      status: 'pending',
      badge: 'Consumer Court',
    },
  ]

  const timelineEvents = events.length > 0 ? events : defaultEvents

  return (
    <div className="relative pl-6 space-y-6">
      {/* Vertical Track Line */}
      <div
        className="absolute left-[11px] top-2 bottom-4 w-[2px]"
        style={{
          background: 'linear-gradient(to bottom, #84CC16 0%, rgba(132,204,22,0.2) 60%, rgba(255,255,255,0.05) 100%)',
        }}
      />

      {timelineEvents.map((ev, index) => {
        const isCompleted = ev.status === 'completed'
        const isActive = ev.status === 'active'
        const isPending = ev.status === 'pending'

        return (
          <div key={ev.id || index} className="relative flex items-start gap-4 group">
            {/* Step Marker Dot */}
            <div
              className="absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: isCompleted
                  ? '#84CC16'
                  : isActive
                  ? '#161921'
                  : '#1C2030',
                border: isActive
                  ? '2px solid #84CC16'
                  : isPending
                  ? '2px solid #2A3050'
                  : 'none',
                boxShadow: isActive
                  ? '0 0 12px rgba(132,204,22,0.4)'
                  : isCompleted
                  ? '0 0 8px rgba(132,204,22,0.3)'
                  : 'none',
              }}
            >
              {isCompleted ? (
                <CheckCircle2 size={14} color="#0B0D11" strokeWidth={3} />
              ) : isActive ? (
                <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-ping" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#9196B0]" />
              )}
            </div>

            {/* Event Content Card */}
            <div
              className="flex-1 p-3.5 rounded-xl transition-all"
              style={{
                background: isActive ? '#161921' : '#111318',
                border: isActive
                  ? '1px solid rgba(132,204,22,0.2)'
                  : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span
                  className="text-xs font-semibold"
                  style={{ color: isActive ? '#84CC16' : '#E8EAF6' }}
                >
                  {ev.title}
                </span>
                <div className="flex items-center gap-2">
                  {ev.badge && (
                    <span
                      className="font-mono-ck text-[9px] uppercase px-2 py-0.5 rounded-full"
                      style={{
                        background: isActive ? 'rgba(132,204,22,0.12)' : 'rgba(255,255,255,0.06)',
                        color: isActive ? '#84CC16' : '#9196B0',
                        border: isActive ? '1px solid rgba(132,204,22,0.2)' : 'none',
                      }}
                    >
                      {ev.badge}
                    </span>
                  )}
                  <span className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
                    {ev.date}
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed" style={{ color: '#9196B0' }}>
                {ev.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
