import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  FileText, Image as ImageIcon, Mic, ShieldCheck, Download,
  ExternalLink, Search, Filter, Plus, CheckCircle2, Lock
} from 'lucide-react'

const EVIDENCE_ITEMS = [
  {
    id: 'EV-8910',
    name: 'Amazon Tax Invoice #408-9128472.pdf',
    caseId: 'CK-90428',
    product: 'boAt Airdopes 141 ANC',
    type: 'invoice',
    size: '1.4 MB',
    date: '12 Apr 2024',
    ocrStatus: 'Verified (100%)',
    hash: '0x9fa4...3b1a',
  },
  {
    id: 'EV-8911',
    name: 'Damaged Casing Macro Photograph.jpg',
    caseId: 'CK-90428',
    product: 'boAt Airdopes 141 ANC',
    type: 'photo',
    size: '4.2 MB',
    date: '15 Apr 2024',
    ocrStatus: 'Damage Scored 94/100',
    hash: '0x3c81...89ee',
  },
  {
    id: 'EV-8912',
    name: 'Service Center Rejection Voice Memo.webm',
    caseId: 'CK-90428',
    product: 'boAt Airdopes 141 ANC',
    type: 'audio',
    size: '840 KB',
    date: '16 Apr 2024',
    ocrStatus: 'Whisper Transcribed',
    hash: '0x7e29...11ac',
  },
  {
    id: 'EV-8820',
    name: 'Flipkart Tax Invoice & Warranty Card.pdf',
    caseId: 'CK-88201',
    product: 'Samsung Galaxy M34 5G',
    type: 'invoice',
    size: '2.1 MB',
    date: '02 Mar 2024',
    ocrStatus: 'Verified (100%)',
    hash: '0x5b33...902a',
  },
  {
    id: 'EV-8821',
    name: 'Battery Diagnostics Log File.png',
    caseId: 'CK-88201',
    product: 'Samsung Galaxy M34 5G',
    type: 'photo',
    size: '1.8 MB',
    date: '05 Mar 2024',
    ocrStatus: 'OCR Analyzed',
    hash: '0x12dc...44ff',
  },
  {
    id: 'EV-8510',
    name: 'Meesho Order Receipt #MEE-90291.pdf',
    caseId: 'CK-85110',
    product: 'Prestige Induction Cooktop',
    type: 'invoice',
    size: '980 KB',
    date: '28 Jan 2024',
    ocrStatus: 'Verified (100%)',
    hash: '0xaa41...776d',
  },
]

export default function EvidenceVault() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filteredItems = EVIDENCE_ITEMS.filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.caseId.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <DashboardLayout
      title="Evidence Vault"
      subtitle="Cryptographically sealed consumer dispute evidence repository"
    >
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner */}
        <div
          className="p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(135deg, #161921 0%, #1C2030 100%)',
            border: '1px solid rgba(132,204,22,0.15)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #84CC16, #65A300)', color: '#0B0D11' }}
            >
              <Lock size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-jakarta font-bold text-base text-white">
                  Tamper-Evident Evidence Locker
                </h3>
                <span
                  className="font-mono-ck text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(132,204,22,0.12)', color: '#84CC16' }}
                >
                  SHA-256 HASHED
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#9196B0' }}>
                All uploaded receipts, defect photographs, and audio recordings are authenticated and admissible in NCH Consumer Court under Section 65B of Indian Evidence Act.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs flex-shrink-0 transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #84CC16, #65A300)',
              color: '#0B0D11',
              boxShadow: '0 4px 16px rgba(132,204,22,0.25)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Upload New Evidence</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'invoice', label: 'Invoices & Receipts' },
              { id: 'photo', label: 'Damage Photos' },
              { id: 'audio', label: 'Voice Notes' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                style={{
                  background: filter === tab.id ? '#84CC16' : '#161921',
                  color: filter === tab.id ? '#0B0D11' : '#9196B0',
                  border: filter === tab.id ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl max-w-xs w-full"
            style={{ background: '#161921', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Search size={14} style={{ color: '#9196B0' }} />
            <input
              type="text"
              placeholder="Search evidence files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-white/30 focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Evidence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isInvoice = item.type === 'invoice'
            const isPhoto = item.type === 'photo'
            const isAudio = item.type === 'audio'

            const Icon = isInvoice ? FileText : isPhoto ? ImageIcon : Mic

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl flex flex-col justify-between transition-all group hover:border-[#84CC16]/40"
                style={{
                  background: '#111318',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isInvoice
                          ? 'rgba(132,204,22,0.1)'
                          : isPhoto
                          ? 'rgba(99,102,241,0.1)'
                          : 'rgba(245,158,11,0.1)',
                        color: isInvoice ? '#84CC16' : isPhoto ? '#818CF8' : '#F59E0B',
                      }}
                    >
                      <Icon size={20} />
                    </div>

                    <span
                      className="font-mono-ck text-[10px] px-2 py-0.5 rounded-md"
                      style={{ background: '#161921', color: '#9196B0' }}
                    >
                      {item.size}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#84CC16] transition-colors mb-1">
                    {item.name}
                  </h4>

                  <p className="font-mono-ck text-[11px]" style={{ color: '#9196B0' }}>
                    Linked: {item.product} ({item.caseId})
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} style={{ color: '#84CC16' }} />
                    <span className="font-mono-ck text-[10px] text-white/80">
                      {item.ocrStatus}
                    </span>
                  </div>

                  <button
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: '#9196B0' }}
                    title="Download evidence"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
