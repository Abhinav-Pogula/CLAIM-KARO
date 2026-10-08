import { useRef, useState, useEffect } from 'react'

export default function VoiceRecorder({ onRecording, onClear, file }) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mr
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const voiceFile = new File([blob], 'voice.webm', { type: 'audio/webm' })
        onRecording(voiceFile)
        setRecording(false)
        clearInterval(timerRef.current)
      }
      mr.start(250)
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch (err) {
      alert('Microphone access denied: ' + err.message)
    }
  }

  const stop = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  if (file) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            🎙️ Voice Note
          </label>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
          >
            Remove
          </button>
        </div>
        <div className="border border-slate-700 bg-slate-900 rounded-xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 flex-shrink-0">
            <span className="text-2xl">🎵</span>
            <span className="text-[10px] font-bold uppercase mt-0.5">WEBM</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Recorded ✓
            </span>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            Re-record
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
        🎙️ Voice Note
      </label>
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] ${
          recording
            ? 'border-rose-500 bg-rose-950/30'
            : 'border-slate-700 bg-[#111318] hover:border-lime-500/50'
        }`}
      >
        {recording ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-rose-300 font-semibold text-lg">{fmt(seconds)}</span>
            </div>
            <p className="text-sm text-rose-200 mb-4">Recording your complaint...</p>
            <button
              type="button"
              onClick={stop}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-500/30 transition-all cursor-pointer"
            >
              ⏹ Stop Recording
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-3xl mb-3 text-slate-300">
              🎙️
            </div>
            <p className="text-sm font-medium text-slate-200 mb-1">Record your complaint</p>
            <p className="text-xs text-slate-400 mb-4">
              Describe what went wrong with your product (Hindi, English or Hinglish)
            </p>
            <button
              type="button"
              onClick={start}
              className="px-6 py-2.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold rounded-xl shadow-lg shadow-lime-500/20 transition-all cursor-pointer"
            >
              🔴 Start Recording
            </button>
          </>
        )}
      </div>
    </div>
  )
}
