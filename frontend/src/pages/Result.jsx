import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { openSSE } from '../lib/sse'
import ScoreGauge from '../components/ScoreGauge'
import FlagList from '../components/FlagList'
import ActionMenu from '../components/ActionMenu'

const ROUTE_LABELS = {
  return: 'Return & refund',
  replacement: 'Replacement',
  warranty: 'Warranty claim',
  consumer_helpline: 'Consumer helpline',
}

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [run, setRun] = useState(null)
  const [steps, setSteps] = useState({ verify: 'pending', score: 'pending', draft: 'pending' })
  const [streamError, setStreamError] = useState(null)

  useEffect(() => {
    let closed = false
    const cleanup = openSSE(`/cases/${id}/run`, {
      onEvent(event) {
        if (closed) return
        if (event.type === 'step') setSteps((s) => ({ ...s, [event.step]: event.status }))
        else if (event.type === 'complete') setRun(event)
        else if (event.type === 'error') setStreamError(event.message || 'Verification failed')
      },
      onError(err) { if (!closed) setStreamError(err?.message || 'Stream error') },
    })
    return () => { closed = true; cleanup?.() }
  }, [id])

  const loading = !run && !streamError
  const score   = run?.score?.score ?? 0
  const label   = run?.score?.label ?? ''
  const reasons = run?.score?.reasons ?? []
  const route   = run?.score?.route
  const flags   = run?.verify?.flags ?? []
  const verify  = run?.verify ?? {}
  const draft   = run?.draft ?? {}

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Running verification & complaint drafting…</p>
        <div className="flex flex-wrap justify-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          {['verify', 'score', 'draft'].map((s) => (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  steps[s] === 'done'
                    ? 'bg-emerald-400'
                    : steps[s] === 'running'
                    ? 'bg-indigo-400 animate-pulse'
                    : steps[s] === 'error'
                    ? 'bg-rose-400'
                    : 'bg-slate-600'
                }`}
              />
              <span className="capitalize text-slate-300 font-medium">{s}: {steps[s]}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            ✅ Claim Report
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Your Claim Results
          </h1>
          {streamError && (
            <div className="mt-3 p-4 bg-red-950/60 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {streamError}
            </div>
          )}
        </div>

        {/* Route Card */}
        {route && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Recommended Route</p>
              <p className="text-lg font-bold text-white mt-1">{ROUTE_LABELS[route] || route}</p>
            </div>
            <span className="text-3xl">🎯</span>
          </div>
        )}

        {/* Key Verification Metrics */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">📅 Verification Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Days Since Purchase</p>
              <p className="text-lg font-bold text-white mt-1">
                {verify.days_since_purchase ?? '—'}
              </p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Return Window</p>
              <p className="text-lg font-bold mt-1">
                {verify.within_return_window == null ? (
                  <span className="text-slate-400">—</span>
                ) : verify.within_return_window ? (
                  <span className="text-emerald-400">✓ Within window</span>
                ) : (
                  <span className="text-rose-400">✕ Expired</span>
                )}
              </p>
            </div>
            <div className="bg-slate-800/60 p-4 rounded-xl">
              <p className="text-xs text-slate-400 font-medium">Warranty Coverage</p>
              <p className="text-lg font-bold mt-1">
                {verify.within_warranty == null ? (
                  <span className="text-slate-400">—</span>
                ) : verify.within_warranty ? (
                  <span className="text-emerald-400">✓ Covered</span>
                ) : (
                  <span className="text-rose-400">✕ Expired</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <h2 className="text-base font-semibold text-slate-300 mb-6">📊 Claim Strength</h2>
          <ScoreGauge score={score} label={label} reasons={reasons} />
        </div>

        {/* Policy Clause Box */}
        {draft.policy_clause && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">📜 Applicable Policy Clause</h2>
            <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-200 text-sm leading-relaxed">
              "{draft.policy_clause}"
              {draft.policy_source && (
                <div className="mt-3 text-xs">
                  <a
                    href={draft.policy_source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-400 underline hover:text-indigo-300 font-medium"
                  >
                    View Policy Source ↗
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Draft Preview */}
        {draft.body && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-slate-200 mb-4">📝 Complaint Draft</h2>
            {draft.subject && (
              <div className="mb-3 p-3 bg-slate-800 rounded-xl">
                <span className="text-xs font-semibold text-slate-400">Subject: </span>
                <span className="text-sm text-slate-200">{draft.subject}</span>
              </div>
            )}
            <div className="p-4 bg-slate-800/70 rounded-xl">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {draft.body}
              </pre>
            </div>
          </div>
        )}

        {/* Flags */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">🔍 Verification Flags</h2>
          <FlagList flags={flags} />
        </div>

        {/* Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4">🚀 Take Action</h2>
          <ActionMenu caseId={id} draft={draft} caseStatus={run?.status} />
        </div>

        {/* Nav */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/cases/${id}/review`)}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            ← Back to Review
          </button>
          <button
            onClick={() => navigate('/cases')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            My Cases →
          </button>
        </div>
      </div>
    </div>
  )
}
