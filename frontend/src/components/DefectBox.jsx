import { AlertTriangle, ShieldAlert, CheckCircle, FileText, Scale } from 'lucide-react'

export default function DefectBox({
  section = 'Section 2(10) & 2(11) CPA 2019',
  title = 'Manufacturing Defect & Deficiency of Service',
  severity = 'High',
  description = 'Hardware acoustic driver failure resulting in silent audio output within warranty term. Merchant refused statutory warranty replacement.',
  remedies = [
    'Full restitution of purchase price (₹2,499)',
    '18% per annum statutory interest from date of refusal',
    '₹10,000 compensation for mental harassment under CPA Section 39(d)',
  ],
}) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: '#161921',
        border: '1px solid rgba(132,204,22,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(132,204,22,0.12)', color: '#84CC16' }}
          >
            <Scale size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">{title}</h4>
            <p className="font-mono-ck text-[10px]" style={{ color: '#84CC16' }}>
              {section}
            </p>
          </div>
        </div>

        <span
          className="font-mono-ck text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
          style={{
            background:
              severity === 'Critical'
                ? 'rgba(239,68,68,0.15)'
                : severity === 'High'
                ? 'rgba(245,158,11,0.15)'
                : 'rgba(132,204,22,0.15)',
            color:
              severity === 'Critical'
                ? '#EF4444'
                : severity === 'High'
                ? '#F59E0B'
                : '#84CC16',
            border: `1px solid ${
              severity === 'Critical'
                ? 'rgba(239,68,68,0.3)'
                : severity === 'High'
                ? 'rgba(245,158,11,0.3)'
                : 'rgba(132,204,22,0.3)'
            }`,
          }}
        >
          {severity} Severity
        </span>
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed mb-3.5" style={{ color: '#9196B0' }}>
        {description}
      </p>

      {/* Statutory Remedies List */}
      <div
        className="p-3 rounded-lg"
        style={{ background: 'rgba(28,32,48,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="font-mono-ck text-[9px] uppercase tracking-wider text-white/50 block mb-2">
          Demanded Statutory Restitution
        </span>
        <ul className="space-y-1.5">
          {remedies.map((remedy, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: '#E8EAF6' }}>
              <CheckCircle size={13} style={{ color: '#84CC16', flexShrink: 0, marginTop: '2px' }} />
              <span>{remedy}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
