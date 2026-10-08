const STATUS_CONFIG = {
  pending:  { icon: '○', color: 'text-slate-500', ring: 'border-slate-700', bg: 'bg-slate-900' },
  running:  { icon: '◎', color: 'text-indigo-400', ring: 'border-indigo-500', bg: 'bg-indigo-950/40', pulse: true },
  done:     { icon: '✓', color: 'text-emerald-400', ring: 'border-emerald-500', bg: 'bg-emerald-950/40' },
  error:    { icon: '✕', color: 'text-rose-400',    ring: 'border-rose-500',    bg: 'bg-rose-950/40' },
}

const STEP_LABELS = {
  download: 'Downloading evidence files',
  photo:    'Analysing defect photo',
  voice:    'Transcribing voice note',
  invoice:  'Reading invoice details',
  fuse:     'Merging into Case File',
  verify:   'Verifying claim rules',
  score:    'Scoring claim strength',
  draft:    'Drafting complaint letter',
}

/**
 * Timeline({ steps })
 * steps: [{ name, status, summary }]
 * status: 'pending' | 'running' | 'done' | 'error'
 * summary: short one-line text (optional)
 */
export default function Timeline({ steps = [] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, idx) => {
        const cfg = STATUS_CONFIG[step.status] || STATUS_CONFIG.pending
        const isLast = idx === steps.length - 1
        return (
          <li key={step.name} className="relative flex gap-4">
            {/* connector line */}
            {!isLast && (
              <div className="absolute left-[19px] top-[36px] bottom-0 w-px bg-slate-800" />
            )}

            {/* icon */}
            <div
              className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-base transition-all duration-300 ${cfg.ring} ${cfg.bg} ${cfg.color}`}
            >
              {cfg.pulse ? (
                <>
                  <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-60" />
                  <span className={cfg.color}>{cfg.icon}</span>
                </>
              ) : (
                cfg.icon
              )}
            </div>

            {/* text */}
            <div className="flex-1 pt-1.5 pb-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    step.status === 'error'
                      ? 'text-rose-300'
                      : step.status === 'done'
                      ? 'text-emerald-300'
                      : step.status === 'running'
                      ? 'text-indigo-200'
                      : 'text-slate-500'
                  }`}
                >
                  {STEP_LABELS[step.name] || step.name}
                </span>
                <span className={`text-xs font-medium capitalize ${cfg.color}`}>
                  {step.status}
                </span>
              </div>
              {step.summary && (
                <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{step.summary}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
