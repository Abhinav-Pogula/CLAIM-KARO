import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { openSSE } from '../lib/sse'
import Timeline from '../components/Timeline'
import BackButton from '../components/BackButton'

const ORDERED_STEPS = ['download', 'photo', 'voice', 'invoice', 'fuse']

const initialSteps = ORDERED_STEPS.map((name) => ({ name, status: 'pending', summary: '' }))

function summarize(step, output) {
  if (!output) return ''
  if (output.error) return output.error
  if (step === 'photo') return output.defect_type ? `Found: ${output.defect_type}` : 'No clear defect found'
  if (step === 'voice') return output.complaint_summary || output.transcript || ''
  if (step === 'invoice') return [output.order_id, output.price && `Rs. ${output.price}`, output.purchase_date].filter(Boolean).join(' · ')
  if (step === 'fuse') return output.low_confidence?.length ? `${output.low_confidence.length} fields need your check` : 'All fields filled'
  return ''
}

export default function Analyze() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [steps, setSteps] = useState(initialSteps)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const closeRef = useRef(null)

  const updateStep = (name, patch) => {
    setSteps((prev) =>
      prev.map((s) => (s.name === name ? { ...s, ...patch } : s))
    )
  }

  useEffect(() => {
    let closed = false

    const cleanup = openSSE(
      `/cases/${id}/extract`,
      {
        onEvent(event) {
          if (closed) return
          if (event.type === 'step') {
            updateStep(event.step, {
              status: event.status,
              summary: event.status === 'error' ? (event.output?.error || event.message || 'Failed') : summarize(event.step, event.output),
            })
          } else if (event.type === 'complete') {
            if (event.replayed) { navigate(`/cases/${id}/review`); return }
            setDone(true)
          } else if (event.type === 'error') {
            setError(event.message || 'Analysis failed')
          }
        },
        onError(err) {
          if (closed) return
          setError(err?.message || 'Stream error — please reload.')
        },
      }
    )

    closeRef.current = cleanup
    return () => {
      closed = true
      cleanup?.()
    }
  }, [id, navigate])

  // Auto-navigate to /review once complete
  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate(`/cases/${id}/review`), 1200)
      return () => clearTimeout(t)
    }
  }, [done, id, navigate])

  const hasError = steps.some((s) => s.status === 'error')

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <BackButton fallback={'/cases'} />
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            {done ? (
              <span className="text-emerald-400">✓ Analysis Complete</span>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Analysing…
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            AI Evidence Review
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            We're reading your files and building the case. This usually takes 20–40 seconds.
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <Timeline steps={steps} />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-950/60 border border-red-500/30 rounded-xl text-red-200 text-sm">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-3 underline text-red-300 hover:text-red-200 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Manual advance if stuck */}
        {hasError && !error && (
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(`/cases/${id}/review`)}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Continue to Review →
            </button>
          </div>
        )}

        {/* Done */}
        {done && (
          <div className="mt-6 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm text-center">
            ✅ Analysis complete! Redirecting to Review…
          </div>
        )}
      </div>
    </div>
  )
}
