import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCases, getErrorMessage } from '../lib/api'

const STATUS_CONFIG = {
  uploaded:  { color: 'text-slate-400',   bg: 'bg-slate-800',          label: 'Uploaded',   icon: '📂' },
  analyzing: { color: 'text-indigo-400',  bg: 'bg-indigo-950/50',      label: 'Analysing',  icon: '🔄' },
  review:    { color: 'text-amber-400',   bg: 'bg-amber-950/50',       label: 'Review',     icon: '✏️' },
  approved:  { color: 'text-violet-400',  bg: 'bg-violet-950/50',      label: 'Approved',   icon: '⚡' },
  done:      { color: 'text-emerald-400', bg: 'bg-emerald-950/50',     label: 'Done',       icon: '✅' },
  error:     { color: 'text-rose-400',    bg: 'bg-rose-950/50',        label: 'Error',      icon: '❌' },
}

function getRoute(caseItem) {
  switch (caseItem.status) {
    case 'uploaded':
    case 'analyzing':
      return `/cases/${caseItem.id}/analyze`
    case 'review':
      return `/cases/${caseItem.id}/review`
    case 'approved':
    case 'done':
      return `/cases/${caseItem.id}/result`
    default:
      return `/cases/${caseItem.id}/review`
  }
}

function CaseCard({ caseItem, onClick }) {
  const cfg = STATUS_CONFIG[caseItem.status] || STATUS_CONFIG.uploaded
  const createdAt = caseItem.created_at
    ? new Date(caseItem.created_at).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
            >
              {cfg.icon} {cfg.label}
            </span>
            {caseItem.score != null && (
              <span className="text-xs font-medium text-slate-400">
                Score: <span className="text-white font-bold">{caseItem.score}</span>
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
            {caseItem.product || caseItem.casefile?.product?.value || 'Unnamed case'}
          </p>
          <p className="text-xs text-slate-500 mt-1 truncate">
            {caseItem.defect_type || caseItem.casefile?.defect_type?.value || 'Defect not identified'}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-slate-500">{createdAt}</p>
          <p className="text-xs text-slate-600 font-mono mt-1">
            #{caseItem.id?.slice(0, 8)}
          </p>
        </div>
      </div>
    </button>
  )
}

export default function MyCases() {
  const navigate = useNavigate()

  const [cases, setCases]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    listCases()
      .then(setCases)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              My Cases
            </h1>
            <p className="mt-1 text-slate-400 text-sm">Track all your consumer complaints</p>
          </div>
          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all text-sm cursor-pointer"
          >
            + New Case
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-center">
            <p className="text-rose-400 font-semibold text-sm mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-5">📋</div>
            <h2 className="text-xl font-bold text-slate-200 mb-2">No cases yet</h2>
            <p className="text-slate-400 text-sm mb-8">
              File your first complaint and let AI do the heavy lifting.
            </p>
            <button
              onClick={() => navigate('/new')}
              className="px-7 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
            >
              Start a New Case →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((c) => (
              <CaseCard
                key={c.id}
                caseItem={c}
                onClick={() => navigate(getRoute(c))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
