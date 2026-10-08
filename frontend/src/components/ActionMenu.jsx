import { useState } from 'react'
import { downloadComplaintPdf, getPortalData, sendComplaintEmail } from '../lib/api'
import { getErrorMessage } from '../lib/api'

/**
 * ActionMenu({ caseId, draft })
 * Handles email, portal, and PDF template actions.
 */
export default function ActionMenu({ caseId, draft = {}, caseStatus }) {
  const [activeTab, setActiveTab] = useState(null)
  const [emailForm, setEmailForm] = useState({ name: '', phone: '', confirmed: false })
  const [emailState, setEmailState] = useState({ loading: false, done: false, error: null })
  const [portalData, setPortalData] = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [copied, setCopied] = useState({})

  const editedSubject = draft.subject || ''
  const editedBody = draft.body || ''

  // --- Email action ---
  const handleSendEmail = async () => {
    if (!emailForm.confirmed) return
    setEmailState({ loading: true, done: false, error: null })
    try {
      await sendComplaintEmail(caseId, {
        confirm: true,
        subject: editedSubject,
        body: editedBody,
        sender_name: emailForm.name || undefined,
        sender_phone: emailForm.phone || undefined,
      })
      setEmailState({ loading: false, done: true, error: null })
    } catch (err) {
      const msg = getErrorMessage(err)
      setEmailState({ loading: false, done: false, error: msg })
    }
  }

  // --- Portal action ---
  const handleOpenPortal = async () => {
    setPortalLoading(true)
    try {
      const data = await getPortalData(caseId)
      setPortalData(data)
    } catch (err) {
      alert(getErrorMessage(err))
    } finally {
      setPortalLoading(false)
    }
  }

  const copyField = (key, value) => {
    navigator.clipboard.writeText(value || '').then(() => {
      setCopied((c) => ({ ...c, [key]: true }))
      setTimeout(() => setCopied((c) => ({ ...c, [key]: false })), 2000)
    })
  }

  // --- PDF action ---
  const handleDownloadPdf = async () => {
    try {
      const blob = await downloadComplaintPdf(caseId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ClaimKaro_complaint.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(getErrorMessage(err))
    }
  }

  const Tab = ({ id, label, icon }) => (
    <button
      onClick={() => {
        setActiveTab(activeTab === id ? null : id)
        if (id === 'portal' && !portalData) handleOpenPortal()
      }}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
        activeTab === id
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  )

  return (
    <div className="space-y-4">
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-3">
        <Tab id="email" label="Send Email" icon="📧" />
        <Tab id="portal" label="Portal Guide" icon="🌐" />
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          <span>📄</span> Download PDF
        </button>
      </div>

      {/* Email Panel */}
      {activeTab === 'email' && (
        <div className="p-5 bg-slate-900 border border-slate-700 rounded-2xl space-y-4">
          <h3 className="text-base font-semibold text-white">Send Complaint Email</h3>
          <div className="p-3 bg-slate-800/70 rounded-xl text-sm text-slate-300">
            <span className="font-medium text-slate-200">Recipient: </span>
            {draft.to_email || (
              <span className="text-slate-400 italic">Company support (from policy)</span>
            )}
          </div>
          {emailState.done ? (
            <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm">
              ✅ Complaint email sent successfully!
            </div>
          ) : (
            <div className="space-y-3">
              {emailState.error && (
                <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-sm">
                  {emailState.error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Your Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={emailForm.name}
                    onChange={(e) => setEmailForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1 block">Your Phone</label>
                  <input
                    type="text"
                    placeholder="Your phone number"
                    value={emailForm.phone}
                    onChange={(e) => setEmailForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailForm.confirmed}
                  onChange={(e) => setEmailForm((f) => ({ ...f, confirmed: e.target.checked }))}
                  className="mt-0.5 accent-indigo-500"
                />
                <span className="text-sm text-slate-300">
                  I confirm sending this complaint email on my behalf.
                </span>
              </label>
              <button
                onClick={handleSendEmail}
                disabled={!emailForm.confirmed || emailState.loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all cursor-pointer"
              >
                {emailState.loading ? 'Sending...' : 'Send Complaint Email'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Portal Panel */}
      {activeTab === 'portal' && (
        <div className="p-5 bg-slate-900 border border-slate-700 rounded-2xl space-y-4">
          {portalLoading ? (
            <p className="text-slate-400 text-sm animate-pulse">Loading portal info...</p>
          ) : portalData ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{portalData.label}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Copy the fields below, then submit</p>
                </div>
                <a
                  href={portalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all"
                >
                  Open Portal ↗
                </a>
              </div>
              <ul className="space-y-2">
                {portalData.fields?.map((field) => (
                  <li key={field.label} className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium">{field.label}</p>
                      <p className="text-sm text-slate-200 mt-0.5 truncate">{field.value}</p>
                    </div>
                    <button
                      onClick={() => copyField(field.label, field.value)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      {copied[field.label] ? '✓ Copied' : 'Copy'}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Failed to load portal data. Please try again.</p>
          )}
        </div>
      )}
    </div>
  )
}
