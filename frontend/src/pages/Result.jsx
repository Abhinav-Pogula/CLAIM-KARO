import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { openSSE } from '../lib/sse'
import { getCaseDetail, getErrorMessage } from '../lib/api'
import ScoreGauge from '../components/ScoreGauge'
import FlagList from '../components/FlagList'
import ActionMenu from '../components/ActionMenu'

export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [streamDone, setStreamDone] = useState(false)
  const [detail, setDetail]         = useState(null)
  const [streamError, setStreamError] = useState(null)
  const [loading, setLoading]       = useState(false)

  const closeRef = useRef(null)

  // 1. Start SSE run stream on mount
  useEffect(() => {
    let closed = false

    const cleanup = openSSE(
      `/cases/${id}/run`,
      {
        onEvent(event) {
          if (closed) return
          if (event.type === 'done') setStreamDone(true)
        },
        onError(err) {
          if (closed) return
          // If 409 (already run) treat as done
          if (err?.status === 409) {
            setStreamDone(true)
          } else {
            setStreamError(err?.message || 'Stream error')
            setStreamDone(true) // still try to load detail
          }
        },
      },
      { method: 'POST' }
    )

    closeRef.current = cleanup
    return () => {
      closed = true
      cleanup?.()
    }
  }, [id])

  // 2. When stream is done, fetch full detail
  useEffect(() => {
    if (!streamDone) return
    setLoading(true)
    getCaseDetail(id)
      .then(setDetail)
      .catch((e) => setStreamError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [streamDone, id])

  const score   = detail?.score ?? 0
  const label   = detail?.strength_label ?? ''
  const reasons = detail?.score_reasons ?? []
  const flags   = detail?.flags ?? []
  const draft   = detail?.draft ?? {}

  if (!streamDone || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">
          {!streamDone ? 'Running final analysis…' : 'Loading results…'}
        </p>
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
            <p className="mt-2 text-amber-400 text-xs">Note: {streamError}</p>
          )}
        </div>

        {/* Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
          <h2 className="text-base font-semibold text-slate-300 mb-6">📊 Claim Strength</h2>
          <ScoreGauge score={score} label={label} reasons={reasons} />
        </div>

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
          <ActionMenu caseId={id} draft={draft} />
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
