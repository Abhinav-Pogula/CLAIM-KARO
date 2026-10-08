import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DropZone from '../components/DropZone'
import VoiceRecorder from '../components/VoiceRecorder'
import { createCase, getErrorMessage } from '../lib/api'
import BackButton from '../components/BackButton'

export default function NewCase() {
  const navigate = useNavigate()

  const [photo, setPhoto]         = useState(null)
  const [invoice, setInvoice]     = useState(null)
  const [voice, setVoice]         = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)

  const canSubmit = photo && invoice && voice

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const files = {}
      if (photo)   files.photo   = photo
      if (invoice) files.invoice = invoice
      if (voice)   files.voice   = voice
      const data = await createCase(files)
      navigate(`/cases/${data.case_id}/analyze`)
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12 flex items-start justify-center">
      <div className="w-full max-w-xl">
        <BackButton fallback={'/cases'} />
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            New Complaint
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Upload Your Evidence
          </h1>
          <p className="mt-3 text-slate-400 text-sm leading-relaxed">
            Share your defect photo, invoice, and a voice note describing what went wrong.
            Our AI will analyse everything and draft your complaint automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Defect Photo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <DropZone
              label="Defect Photo"
              accept="image/jpeg,image/png,image/webp"
              description="Show the damage or defect clearly"
              file={photo}
              onFileSelect={setPhoto}
              onClear={() => setPhoto(null)}
            />
          </div>

          {/* Invoice / Bill */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <DropZone
              label="Invoice / Bill"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              description="Upload PDF or photo of your purchase receipt"
              file={invoice}
              onFileSelect={setInvoice}
              onClear={() => setInvoice(null)}
            />
          </div>

          {/* Voice Note */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <VoiceRecorder
              file={voice}
              onRecording={setVoice}
              onClear={() => setVoice(null)}
            />
            <div className="border-t border-slate-800 pt-3">
              <DropZone
                label="or upload an audio file"
                accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm"
                description="Upload an existing voice recording"
                file={voice}
                onFileSelect={setVoice}
                onClear={() => setVoice(null)}
                icon="🎵"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-950/60 border border-red-500/30 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-200
              bg-gradient-to-r from-indigo-600 to-violet-600
              hover:from-indigo-500 hover:to-violet-500
              disabled:opacity-40 disabled:cursor-not-allowed
              shadow-lg shadow-indigo-500/30 cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading…
              </span>
            ) : (
              'Analyse My Claim →'
            )}
          </button>

          {!canSubmit && (
            <p className="text-center text-xs text-slate-500">
              Please upload all three items (photo, invoice, voice note) to continue.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
