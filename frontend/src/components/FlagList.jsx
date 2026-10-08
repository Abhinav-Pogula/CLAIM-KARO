import { CheckCircle2, AlertCircle, Info, BookOpen } from 'lucide-react'

export default function FlagList({ flags = [] }) {
  const defaultFlags = [
    {
      id: 1,
      type: 'strength',
      title: 'Valid GST Invoice & Serial Match',
      desc: 'Invoice #INV-2024-912 contains registered GSTIN, matching MAC/IMEI identifier, and valid purchase date.',
      weight: '+35 pts',
    },
    {
      id: 2,
      type: 'strength',
      title: 'Timely Written Notice within Warranty',
      desc: 'Consumer lodged written grievance within standard 12-month manufacturer warranty period.',
      weight: '+25 pts',
    },
    {
      id: 3,
      type: 'strength',
      title: 'Unlawful Refusal by Authorized Service Center',
      desc: 'Recorded job sheet acknowledges malfunction but arbitrarily categorizes internal fault as user induced.',
      weight: '+26 pts',
    },
    {
      id: 4,
      type: 'precedent',
      title: 'Binding NCDRC Precedent Citation',
      desc: 'Direct match with NCDRC Ruling RP/182/2021 regarding consumer rights on electronic audio peripherals.',
      weight: 'Precedent Match',
    },
  ]

  const items = flags.length > 0 ? flags : defaultFlags

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const isStrength = item.type === 'strength'
        const isPrecedent = item.type === 'precedent'

        return (
          <div
            key={item.id}
            className="p-3 rounded-xl flex items-start justify-between gap-3 transition-colors"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: isStrength
                    ? 'rgba(132,204,22,0.1)'
                    : isPrecedent
                    ? 'rgba(99,102,241,0.1)'
                    : 'rgba(245,158,11,0.1)',
                  color: isStrength ? '#84CC16' : isPrecedent ? '#818CF8' : '#F59E0B',
                }}
              >
                {isStrength ? (
                  <CheckCircle2 size={14} />
                ) : isPrecedent ? (
                  <BookOpen size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}
              </div>

              <div>
                <h5 className="text-xs font-semibold text-white">{item.title}</h5>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#9196B0' }}>
                  {item.desc}
                </p>
              </div>
            </div>

            <span
              className="font-mono-ck text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
              style={{
                background: isStrength ? 'rgba(132,204,22,0.1)' : 'rgba(255,255,255,0.06)',
                color: isStrength ? '#84CC16' : '#E8EAF6',
              }}
            >
              {item.weight}
            </span>
          </div>
        )
      })}
    </div>
  )
}
