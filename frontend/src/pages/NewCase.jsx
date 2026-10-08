import { useState } from 'react'
import { Check, FileText, Image, LockKeyhole, Mic, Sparkles, UploadCloud } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import DropZone from '../components/DropZone'
import VoiceRecorder from '../components/VoiceRecorder'
import { createCase, getErrorMessage } from '../lib/api'

const STEPS = ['Evidence', 'AI analysis', 'Review & send']

export default function NewCase() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [voice, setVoice] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const complete = [photo, invoice, voice].filter(Boolean).length
  const canSubmit = complete === 3

  async function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const data = await createCase({ photo, invoice, voice })
      navigate(`/cases/${data.case_id}/analyze`)
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout activeView="new" title="New claim" subtitle="Create a complete, evidence-backed consumer complaint">
      <div className="mx-auto max-w-7xl p-4 sm:p-6">
        <div className="mb-7 flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between" style={{ borderColor: 'rgba(132,204,22,0.10)' }}>
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono-ck text-[10px] uppercase tracking-[0.16em]" style={{ color: '#84CC16' }}>
              <Sparkles size={13} /> Guided evidence intake
            </p>
            <h1 className="font-jakarta text-2xl font-extrabold sm:text-3xl" style={{ color: '#E8EAF6' }}>Build your strongest claim.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: '#9196B0' }}>
              Add the three essentials below. ClaimKaro will extract the facts, assess your case, and prepare a send-ready complaint.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'rgba(132,204,22,0.07)', border: '1px solid rgba(132,204,22,0.16)' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'rgba(132,204,22,0.16)', color: '#84CC16' }}><LockKeyhole size={16} /></div>
            <div><p className="text-xs font-semibold" style={{ color: '#E8EAF6' }}>Private & secure</p><p className="text-[11px]" style={{ color: '#9196B0' }}>Your evidence stays with your case.</p></div>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-3 gap-2 rounded-2xl p-3 sm:gap-4" style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.10)' }}>
          {STEPS.map((step, index) => {
            const active = index === 0
            return <div key={step} className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: active ? '#84CC16' : '#252A38', color: active ? '#0B0D11' : '#9196B0' }}>{index + 1}</span>
              <span className="hidden text-xs font-semibold sm:block" style={{ color: active ? '#E8EAF6' : '#6B7280' }}>{step}</span>
            </div>
          })}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <UploadCard number="01" icon={<Image size={18} />} title="Defect photo" detail="Show the damage or defect clearly." complete={Boolean(photo)}>
              <DropZone label="Upload a clear photo" accept="image/jpeg,image/png,image/webp" description="JPG, PNG or WEBP • one well-lit image is enough" file={photo} onFileSelect={setPhoto} onClear={() => setPhoto(null)} />
            </UploadCard>
            <UploadCard number="02" icon={<FileText size={18} />} title="Invoice or bill" detail="This helps establish purchase and warranty details." complete={Boolean(invoice)}>
              <DropZone label="Upload purchase proof" accept="image/jpeg,image/png,image/webp,application/pdf" description="PDF, JPG or PNG • invoice, receipt or order summary" file={invoice} onFileSelect={setInvoice} onClear={() => setInvoice(null)} />
            </UploadCard>
            <UploadCard number="03" icon={<Mic size={18} />} title="Tell us what happened" detail="Record a short voice note, or upload one you already have." complete={Boolean(voice)}>
              <div className="space-y-4"><VoiceRecorder file={voice} onRecording={setVoice} onClear={() => setVoice(null)} /><div className="border-t pt-4" style={{ borderColor: 'rgba(132,204,22,0.09)' }}><DropZone label="Or upload an audio file" accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm" description="MP3, WAV, M4A or WEBM" file={voice} onFileSelect={setVoice} onClear={() => setVoice(null)} icon="♪" /></div></div>
            </UploadCard>
          </div>

          <aside className="h-fit rounded-2xl p-5 xl:sticky xl:top-5" style={{ background: 'linear-gradient(145deg, #1C2030, #161921)', border: '1px solid rgba(132,204,22,0.16)' }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', color: '#0B0D11' }}><UploadCloud size={21} /></div>
            <h2 className="mt-4 font-jakarta text-lg font-bold" style={{ color: '#E8EAF6' }}>Evidence checklist</h2>
            <p className="mt-1 text-sm leading-6" style={{ color: '#9196B0' }}>Complete all three items to begin the AI assessment.</p>
            <div className="mt-5 space-y-3">
              {[['Defect photo', photo], ['Invoice or bill', invoice], ['Voice note', voice]].map(([label, file]) => <div key={label} className="flex items-center justify-between rounded-xl px-3 py-3" style={{ background: 'rgba(11,13,17,0.38)' }}><span className="text-sm" style={{ color: file ? '#E8EAF6' : '#9196B0' }}>{label}</span><span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: file ? '#84CC16' : '#2A3050', color: file ? '#0B0D11' : '#6B7280' }}>{file ? <Check size={13} strokeWidth={3} /> : '—'}</span></div>)}
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full" style={{ background: '#2A3050' }}><div className="h-full rounded-full transition-all" style={{ width: `${(complete / 3) * 100}%`, background: 'linear-gradient(90deg, #84CC16, #65A300)' }} /></div>
            <p className="mt-2 text-right font-mono-ck text-[10px]" style={{ color: '#84CC16' }}>{complete} OF 3 COMPLETE</p>
            {error && <div className="mt-5 rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}>{error}</div>}
            <button type="submit" disabled={!canSubmit || submitting} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40" style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', color: '#0B0D11', boxShadow: canSubmit ? '0 8px 24px rgba(132,204,22,0.24)' : 'none' }}>
              {submitting ? 'Uploading evidence…' : <>Analyse my claim <Sparkles size={16} /></>}
            </button>
          </aside>
        </form>
      </div>
    </DashboardLayout>
  )
}

function UploadCard({ number, icon, title, detail, complete, children }) {
  return <section className="rounded-2xl p-5 sm:p-6" style={{ background: '#161921', border: `1px solid ${complete ? 'rgba(132,204,22,0.28)' : 'rgba(132,204,22,0.10)'}` }}><div className="mb-5 flex items-start gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: complete ? 'rgba(132,204,22,0.16)' : '#252A38', color: complete ? '#84CC16' : '#9196B0' }}>{complete ? <Check size={19} strokeWidth={3} /> : icon}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><h2 className="font-jakarta text-base font-bold" style={{ color: '#E8EAF6' }}>{title}</h2><span className="font-mono-ck text-[10px]" style={{ color: complete ? '#84CC16' : '#6B7280' }}>{complete ? 'ADDED' : number}</span></div><p className="mt-1 text-sm" style={{ color: '#9196B0' }}>{detail}</p></div></div>{children}</section>
}
