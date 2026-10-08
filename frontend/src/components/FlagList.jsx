const SEVERITY_CONFIG = {
  blocking: {
    icon: '🚫',
    bg: 'bg-red-950/60',
    border: 'border-red-500/40',
    text: 'text-red-200',
    badge: 'bg-red-900 text-red-300',
    label: 'Blocking',
  },
  warning: {
    icon: '⚠️',
    bg: 'bg-amber-950/50',
    border: 'border-amber-500/40',
    text: 'text-amber-200',
    badge: 'bg-amber-900 text-amber-300',
    label: 'Warning',
  },
  info: {
    icon: 'ℹ️',
    bg: 'bg-sky-950/40',
    border: 'border-sky-500/30',
    text: 'text-sky-200',
    badge: 'bg-sky-900 text-sky-300',
    label: 'Info',
  },
}

/**
 * FlagList({ flags })
 * flags: [{ code, severity, message, fields, source }]
 */
export default function FlagList({ flags = [] }) {
  if (!flags.length) {
    return (
      <div className="flex items-center gap-3 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-sm font-semibold text-emerald-300">No issues found</p>
          <p className="text-xs text-emerald-500 mt-0.5">All evidence checks passed cleanly.</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {flags.map((flag, i) => {
        const cfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.info
        return (
          <li
            key={flag.code || i}
            className={`flex gap-3 p-4 rounded-xl border ${cfg.bg} ${cfg.border}`}
          >
            <span className="flex-shrink-0 text-lg mt-0.5">{cfg.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
                {flag.source && (
                  <span className="text-xs text-slate-500">{flag.source}</span>
                )}
                {flag.fields?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {flag.fields.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${cfg.text}`}>{flag.message}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
