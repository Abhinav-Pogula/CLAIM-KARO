import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCaseDetail, updateCaseFile, approveCase, getErrorMessage } from '../lib/api'
import CaseFileForm from '../components/CaseFileForm'
import DefectBox from '../components/DefectBox'

export default function Review() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [detail, setDetail]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState({})
  const [approving, setApproving] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getCaseDetail(id)
      .then(setDetail)
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async (field, value) => {
    setSaving((s) => ({ ...s, [field]: true }))
    try {
      const updated = await updateCaseFile(id, { [field]: value })
      setDetail((d) => ({
        ...d,
        case_file: updated.case_file,
        low_confidence: updated.low_confidence,
      }))
    } catch (e) {
      alert(getErrorMessage(e))
    } finally {
      setSaving((s) => ({ ...s, [field]: false }))
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      await approveCase(id)
      navigate(`/cases/${id}/result`)
    } catch (e) {
      alert(getErrorMessage(e))
      setApproving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-rose-400 text-lg font-semibold mb-2">Failed to load case</p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const cf = detail?.case_file || {}
  const photoUrl = detail?.evidence?.find((e) => e.kind === 'photo')?.url
  const flags = detail?.flags || []
  const hasFlags = flags.length > 0
  const blockingFlag = flags.find((f) => f.severity === 'blocking')
  const isExtracted = detail?.status === 'extracted'

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            ✏️ Review
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Review Your Case Details
          </h1>
          <p className="mt-2 text-slate-400 text-sm">
            Fix any incorrect fields, then approve to generate your complaint.
          </p>
        </div>

        {/* Defect Photo */}
        {photoUrl && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">📸 Defect Photo</h2>
            <DefectBox
              url={photoUrl}
              box={cf.defect_box}
            />
          </div>
        )}

        {/* Transcript preview */}
        {cf.complaint_summary?.value && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-2">🗣️ Complaint Summary</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{cf.complaint_summary.value}</p>
          </div>
        )}

        {/* Case File Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-5">📋 Case Details</h2>
          <CaseFileForm
            casefile={cf}
            onSave={handleSave}
            saving={saving}
          />
        </div>

        {/* Flags (if present) */}
        {hasFlags && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-3">⚠️ Verification Notes</h2>
            <ul className="space-y-2">
              {flags.map((flag, i) => (
                <li
                  key={i}
                  className={`text-xs px-3 py-2 rounded-lg ${
                    flag.severity === 'blocking'
                      ? 'bg-red-950/50 border border-red-500/30 text-red-300'
                      : 'bg-amber-950/40 border border-amber-600/30 text-amber-300'
                  }`}
                >
                  {flag.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate('/cases')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
          >
            ← My Cases
          </button>
          {isExtracted ? (
            <button
              onClick={handleApprove}
              disabled={approving || !!blockingFlag}
              title={blockingFlag ? `Blocking issue: ${blockingFlag.message}` : undefined}
              className="px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 
                transition-all cursor-pointer"
            >
              {approving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating…
                </span>
              ) : (
                'Approve & Generate →'
              )}
            </button>
          ) : (
            <button
              onClick={() => navigate(`/cases/${id}/result`)}
              className="px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
            >
              Continue to Result →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
