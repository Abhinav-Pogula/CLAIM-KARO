import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  Gavel, FileText, Send, Download, Copy, Check, Clock,
  CheckCircle2, AlertTriangle, ExternalLink, ShieldAlert
} from 'lucide-react'

const DRAFTS = [
  {
    id: 'DRAFT-9042',
    caseId: 'CK-90428',
    title: 'Statutory Demand Notice under Section 35 CPA 2019',
    respondent: 'Imagine Marketing Ltd. (boAt Lifestyle) & Amazon Seller Services Pvt Ltd',
    amount: '₹2,499 + ₹10,000 compensation',
    date: 'Today, 2:15 PM',
    status: 'ready',
    precedent: 'RP No. 182/2021 (NCDRC)',
    noticeSnippet: `LEGAL NOTICE UNDER SECTION 35 OF CONSUMER PROTECTION ACT, 2019

TO:
1. Imagine Marketing Ltd. (boAt Lifestyle), Andheri East, Mumbai - 400093
2. Amazon Seller Services Private Limited, World Trade Centre, Bengaluru - 560055

SUBJECT: DEMAND FOR IMMEDIATE RESTITUTION OF ₹2,499/- ALONG WITH STATUTORY INTEREST AND DAMAGES FOR DEFICIENCY IN SERVICE AND ARBITRARY WARRANTY REPUDIATION IN RE: BOAT AIRDOPES 141 ANC.

Sir/Madam,
Under instructions and on behalf of our client, notice is hereby served upon you as follows...`,
  },
  {
    id: 'DRAFT-8820',
    caseId: 'CK-88201',
    title: 'Formal Notice of Breach of Contract & Deficiency of Service',
    respondent: 'Samsung India Electronics Pvt Ltd & Flipkart Internet Pvt Ltd',
    amount: '₹18,999 + ₹25,000 compensation',
    date: '3 days ago',
    status: 'sent',
    precedent: 'CC/104/2019 (State Consumer Forum)',
    noticeSnippet: `LEGAL NOTICE FOR DEFICIENCY OF SERVICE UNDER CPA 2019

TO:
Samsung India Electronics Pvt. Ltd., DLF Cyber City, Gurugram, Haryana.

REGARDING: UNRESOLVED BATTERY DRAIN AND REPEATED OVERHEATING DEFECT IN SAMSUNG GALAXY M34 5G WITHIN WARRANTY.`,
  },
  {
    id: 'DRAFT-8511',
    caseId: 'CK-85110',
    title: 'Statutory Notice for Delivery of Non-Functional Goods (Dead on Arrival)',
    respondent: 'Prestige TTK Prestige Ltd & Meesho Fashnear Technologies',
    amount: '₹6,200',
    date: '1 week ago',
    status: 'sent',
    precedent: 'Section 2(47) Unfair Trade Practice',
    noticeSnippet: `STATUTORY NOTICE UNDER CPA 2019

TO:
TTK Prestige Ltd & Fashnear Technologies Pvt Ltd (Meesho).

REGARDING: REFUSAL TO ACCEPT RETURN OF NON-FUNCTIONING INDUCTION COOKTOP DELIVERED ON 28 JAN 2024.`,
  },
]

export default function LegalDrafts() {
  const navigate = useNavigate()
  const [selectedDraft, setSelectedDraft] = useState(DRAFTS[0])
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedDraft.noticeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardLayout
      title="AI Legal Drafts"
      subtitle="Consumer Protection Act 2019 compliant demand notices and forum pleadings"
    >
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Drafts List */}
          <div className="lg:col-span-5 space-y-3">
            <p className="font-mono-ck text-[10px] uppercase tracking-wider text-white/50 px-1">
              Active Legal Notices ({DRAFTS.length})
            </p>

            {DRAFTS.map((draft) => {
              const isSelected = selectedDraft.id === draft.id
              const isReady = draft.status === 'ready'

              return (
                <div
                  key={draft.id}
                  onClick={() => setSelectedDraft(draft)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'border-[#84CC16] bg-[#161921]' : 'hover:border-white/20'
                  }`}
                  style={{
                    background: isSelected ? '#161921' : '#111318',
                    border: isSelected
                      ? '1px solid #84CC16'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className="font-mono-ck text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        background: isReady ? 'rgba(132,204,22,0.1)' : 'rgba(34,197,94,0.1)',
                        color: isReady ? '#84CC16' : '#22C55E',
                      }}
                    >
                      {isReady ? 'Ready for Dispatch' : 'Served (SLA Active)'}
                    </span>

                    <span className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
                      {draft.date}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white mb-1.5 leading-snug">
                    {draft.title}
                  </h4>

                  <p className="text-[11px] line-clamp-2 mb-2" style={{ color: '#9196B0' }}>
                    {draft.respondent}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/5">
                    <span className="font-mono-ck text-[#84CC16] font-semibold">
                      {draft.amount}
                    </span>
                    <span className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
                      Docket #{draft.caseId}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Draft Editor / Viewer */}
          <div
            className="lg:col-span-7 p-6 rounded-2xl flex flex-col justify-between"
            style={{
              background: '#111318',
              border: '1px solid rgba(132,204,22,0.15)',
            }}
          >
            <div>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono-ck text-[10px] px-2 py-0.5 rounded font-bold"
                      style={{ background: '#84CC16', color: '#0B0D11' }}
                    >
                      CPA 2019 COMPLIANT
                    </span>
                    <span className="font-mono-ck text-[11px] text-white/60">
                      Docket: {selectedDraft.caseId}
                    </span>
                  </div>
                  <h3 className="font-jakarta font-bold text-sm text-white mt-1">
                    {selectedDraft.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: '#161921',
                      color: copied ? '#84CC16' : '#E8EAF6',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: '#161921',
                      color: '#E8EAF6',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Download size={13} />
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              {/* Precedent Banner */}
              <div
                className="my-4 p-3 rounded-xl flex items-center justify-between text-xs"
                style={{ background: 'rgba(132,204,22,0.06)', border: '1px solid rgba(132,204,22,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <Gavel size={15} style={{ color: '#84CC16' }} />
                  <span className="text-white/80">Cited Legal Precedent:</span>
                  <span className="font-mono-ck text-[#84CC16] font-semibold">
                    {selectedDraft.precedent}
                  </span>
                </div>
                <span className="font-mono-ck text-[10px] text-white/50">Binding Authority</span>
              </div>

              {/* Document Text Area */}
              <div
                className="p-4 rounded-xl font-mono-ck text-xs leading-relaxed text-white/80 overflow-y-auto max-h-[360px]"
                style={{
                  background: '#0B0D11',
                  border: '1px solid rgba(255,255,255,0.05)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedDraft.noticeSnippet}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 mt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono-ck text-[11px]" style={{ color: '#9196B0' }}>
                Total Relief: <strong className="text-white">{selectedDraft.amount}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/cases/${selectedDraft.caseId}/review`)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 transition-colors"
                  style={{ color: '#E8EAF6' }}
                >
                  Edit Legal Notice
                </button>

                <button
                  onClick={() => navigate(`/cases/${selectedDraft.caseId}/result`)}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-transform active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #84CC16, #65A300)',
                    color: '#0B0D11',
                    boxShadow: '0 4px 14px rgba(132,204,22,0.25)',
                  }}
                >
                  <Send size={14} strokeWidth={2.5} />
                  <span>Dispatch Registered Notice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
