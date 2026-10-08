import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  Upload, Mic, FileText, ChevronRight, Zap, X,
  CheckCircle, Camera, Volume2, File, Info, ArrowRight
} from 'lucide-react'

const STEPS = [
  { n: '01', label: 'Upload Evidence' },
  { n: '02', label: 'AI Analysis' },
  { n: '03', label: 'Legal Review' },
  { n: '04', label: 'Restitution' },
  { n: '05', label: 'Notice Action' },
]

const CATEGORIES = [
  'Electronics & Gadgets',
  'Home Appliances',
  'Clothing & Footwear',
  'Food & Grocery',
  'Beauty & Health',
  'Automotive Parts',
  'Books & Media',
  'Other',
]

const PLATFORMS = [
  'Amazon', 'Flipkart', 'Myntra', 'Meesho', 'Snapdeal', 'Ajio',
  'BigBasket', 'Blinkit', 'Nykaa', 'Zomato', 'Swiggy', 'Other',
]

function DropZone({ type, icon: Icon, label, color, accept, hint }) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState([])
  const inputRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped.slice(0, 3)])
  }

  return (
    <div
      className="flex flex-col gap-3 p-6 rounded-2xl relative overflow-hidden cursor-pointer transition-all"
      style={{
        background: dragging ? `${color}08` : '#161921',
        border: `1px solid ${dragging ? color : 'rgba(132,204,22,0.07)'}`,
        boxShadow: dragging ? `0 0 24px ${color}20` : 'none',
        transition: 'all 0.2s ease',
      }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} multiple hidden
        onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])} />

      {/* Color accent top strip */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: color }} />

      <div className="flex items-center justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <span
          className="font-mono-ck text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
          style={{ background: `${color}10`, color, border: `1px solid ${color}25` }}
        >
          {type}
        </span>
      </div>

      <div>
        <h3 className="font-jakarta font-bold text-base" style={{ color: '#E8EAF6' }}>{label}</h3>
        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{hint}</p>
      </div>

      {files.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-6 rounded-xl"
          style={{ border: `1.5px dashed ${color}30`, background: `${color}04` }}
        >
          <Upload size={20} style={{ color: `${color}80` }} className="mb-2" />
          <p className="text-xs font-medium" style={{ color: `${color}80` }}>
            Drop files here or <span style={{ color }}>browse</span>
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs"
              style={{ color: '#9196B0' }}>
              <CheckCircle size={12} style={{ color: '#22C55E' }} />
              <span className="truncate">{f.name}</span>
              <button onClick={ev => { ev.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)) }}
                className="ml-auto" style={{ color: '#EF4444' }}>
                <X size={12} />
              </button>
            </div>
          ))}
          <div
            className="flex items-center gap-1 text-xs mt-2 px-3 py-1.5 rounded-lg"
            style={{ background: `${color}10`, color }}
          >
            <Upload size={11} />
            Add more files
          </div>
        </div>
      )}
    </div>
  )
}

export default function NewCase() {
  const navigate = useNavigate()
  const [step] = useState(0)
  const [form, setForm] = useState({
    productName: '',
    platform: '',
    category: '',
    orderDate: '',
    amount: '',
    description: '',
    invoiceNo: '',
  })
  const [focused, setFocused] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const inputStyle = (field) => ({
    background: 'rgba(28,32,48,0.8)',
    border: `1px solid ${focused === field ? 'rgba(132,204,22,0.5)' : 'rgba(132,204,22,0.1)'}`,
    borderRadius: '10px',
    color: '#E8EAF6',
    outline: 'none',
    boxShadow: focused === field ? '0 0 0 3px rgba(132,204,22,0.07)' : 'none',
    transition: 'all 0.2s ease',
    padding: '11px 14px',
    fontSize: '13px',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
  })

  const labelStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9196B0',
    letterSpacing: '0.05em',
    marginBottom: '6px',
    display: 'block',
    fontFamily: 'Inter, sans-serif',
  }

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1800))
    navigate('/cases/CK-NEW/review')
  }

  return (
    <DashboardLayout title="New Claim" subtitle="Fast-track statutory redressal under CPA 2019">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* ─── STEPPER ─── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
        >
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-mono-ck text-xs font-bold flex-shrink-0"
                    style={{
                      background: i === step
                        ? 'linear-gradient(135deg, #84CC16, #65A300)'
                        : i < step
                          ? 'rgba(34,197,94,0.2)'
                          : 'rgba(28,32,48,0.8)',
                      color: i === step ? '#0B0D11' : i < step ? '#22C55E' : '#6B7280',
                      border: i < step ? '1px solid rgba(34,197,94,0.3)' : 'none',
                      boxShadow: i === step ? '0 0 16px rgba(132,204,22,0.3)' : 'none',
                    }}
                  >
                    {i < step ? '✓' : s.n}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className="text-[9px] font-mono-ck uppercase tracking-wider"
                      style={{ color: i === step ? '#84CC16' : '#4a5070' }}>
                      Step {s.n}
                    </p>
                    <p className="text-xs font-semibold truncate"
                      style={{ color: i === step ? '#E8EAF6' : i < step ? '#9196B0' : '#4a5070' }}>
                      {s.label}
                    </p>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px" style={{ background: i < step ? 'rgba(132,204,22,0.3)' : 'rgba(132,204,22,0.08)' }} />
                )}
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 rounded-full mt-4" style={{ background: 'rgba(132,204,22,0.08)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${((step + 1) / STEPS.length) * 100}%`,
                background: 'linear-gradient(90deg, #84CC16, #65A300)',
              }}
            />
          </div>
        </div>

        {/* ─── AI BADGE ─── */}
        <div className="flex items-center justify-between">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium mb-2"
              style={{ background: 'rgba(132,204,22,0.08)', border: '1px solid rgba(132,204,22,0.2)', color: '#84CC16' }}
            >
              <Zap size={11} fill="currentColor" />
              Fast-track Statutory Redressal
            </div>
            <h2 className="font-jakarta font-bold text-2xl" style={{ color: '#E8EAF6', letterSpacing: '-0.02em' }}>
              Tell us what went wrong
            </h2>
            <p className="text-sm mt-1" style={{ color: '#9196B0' }}>Three things. About a minute.</p>
          </div>
          <div
            className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl"
            style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
          >
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#84CC16' }} />
            <span className="font-mono-ck text-xs" style={{ color: '#E8EAF6' }}>Consumer Protection Act 2019</span>
            <span className="font-mono-ck text-xs" style={{ color: '#6B7280' }}>Docket #IN-2025-9081</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* ─── EVIDENCE UPLOAD ─── */}
            <DropZone
              type="Photo"
              icon={Camera}
              label="Product Photo Evidence"
              color="#84CC16"
              accept="image/*"
              hint="Upload clear photos of the defect, packaging damage, or issue."
            />
            <DropZone
              type="Voice"
              icon={Mic}
              label="Voice Note / Recording"
              color="#8B5CF6"
              accept="audio/*"
              hint="Record your complaint or upload call recordings with merchant."
            />
            <DropZone
              type="Invoice"
              icon={FileText}
              label="Invoice / Purchase Proof"
              color="#22C55E"
              accept=".pdf,.jpg,.png"
              hint="GST invoice, UPI screenshot, or order confirmation page."
            />
          </div>

          {/* ─── CLAIM DETAILS ─── */}
          <div
            className="rounded-2xl p-6 mt-5 space-y-5"
            style={{ background: '#161921', border: '1px solid rgba(132,204,22,0.08)' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Info size={15} style={{ color: '#84CC16' }} />
              <h3 className="font-jakarta font-bold text-base" style={{ color: '#E8EAF6' }}>
                Claim Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>PRODUCT NAME *</label>
                <input
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  onFocus={() => setFocused('productName')}
                  onBlur={() => setFocused('')}
                  placeholder="e.g. boAt Airdopes 141 ANC"
                  style={inputStyle('productName')}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>PURCHASE PLATFORM *</label>
                <select
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  onFocus={() => setFocused('platform')}
                  onBlur={() => setFocused('')}
                  style={{ ...inputStyle('platform'), cursor: 'pointer' }}
                  required
                >
                  <option value="">Select platform…</option>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>PRODUCT CATEGORY</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  onFocus={() => setFocused('category')}
                  onBlur={() => setFocused('')}
                  style={{ ...inputStyle('category'), cursor: 'pointer' }}
                >
                  <option value="">Select category…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>PURCHASE DATE *</label>
                <input
                  name="orderDate"
                  type="date"
                  value={form.orderDate}
                  onChange={handleChange}
                  onFocus={() => setFocused('orderDate')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('orderDate')}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>CLAIM AMOUNT (₹) *</label>
                <div className="relative">
                  <span
                    className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-ck text-sm font-bold"
                    style={{ color: '#9196B0' }}
                  >₹</span>
                  <input
                    name="amount"
                    type="number"
                    value={form.amount}
                    onChange={handleChange}
                    onFocus={() => setFocused('amount')}
                    onBlur={() => setFocused('')}
                    placeholder="0.00"
                    style={{ ...inputStyle('amount'), paddingLeft: '28px' }}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>INVOICE / ORDER NUMBER</label>
                <input
                  name="invoiceNo"
                  value={form.invoiceNo}
                  onChange={handleChange}
                  onFocus={() => setFocused('invoiceNo')}
                  onBlur={() => setFocused('')}
                  placeholder="e.g. INV-2025-08841"
                  style={{ ...inputStyle('invoiceNo'), fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>DESCRIBE THE DEFECT / ISSUE *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                onFocus={() => setFocused('description')}
                onBlur={() => setFocused('')}
                placeholder="Describe the defect in your own words. Include when you noticed it, how it affects use, and any merchant communication…"
                rows={4}
                style={{ ...inputStyle('description'), resize: 'vertical', minHeight: '100px' }}
                required
              />
            </div>

            {/* CPA info bar */}
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(132,204,22,0.05)', border: '1px solid rgba(132,204,22,0.1)' }}
            >
              <Zap size={16} style={{ color: '#84CC16', marginTop: '1px', flexShrink: 0 }} fill="currentColor" />
              <p className="text-xs" style={{ color: '#9196B0', lineHeight: '1.6' }}>
                Your evidence will be automatically classified under the{' '}
                <span style={{ color: '#84CC16' }}>Consumer Protection Act 2019</span>. AI will identify
                applicable sections, generate a legal notice, and prepare your NCH filing in under 60 seconds.
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="px-5 h-11 rounded-xl text-sm font-medium"
                style={{
                  background: 'rgba(28,32,48,0.8)',
                  border: '1px solid rgba(132,204,22,0.1)',
                  color: '#9196B0',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 h-11 rounded-xl font-semibold text-sm transition-all active:scale-95"
                style={{
                  background: submitting ? 'rgba(132,204,22,0.5)' : 'linear-gradient(135deg, #84CC16, #65A300)',
                  color: '#0B0D11',
                  boxShadow: '0 4px 20px rgba(132,204,22,0.25)',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    AI Analyzing…
                  </>
                ) : (
                  <>
                    <Zap size={15} fill="currentColor" />
                    Analyze & Draft Notice
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
