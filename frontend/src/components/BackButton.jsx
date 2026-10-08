import { useNavigate } from 'react-router-dom'

/**
 * BackButton: goes to the previous page in this app, or to `fallback`
 * when the user landed here directly (refresh, shared link).
 */
export default function BackButton({ fallback = '/cases', label = 'Back' }) {
  const navigate = useNavigate()

  const goBack = () => {
    const idx = window.history.state?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback)
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full px-4 py-1.5 transition-colors cursor-pointer"
    >
      <span aria-hidden="true">←</span> {label}
    </button>
  )
}
