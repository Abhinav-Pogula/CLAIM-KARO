import { useState } from 'react'
import { Check, Edit3, IndianRupee, Calendar, ShoppingBag, ShieldAlert, FileText } from 'lucide-react'

export default function CaseFileForm({ initialData = {}, onSave, isSubmitting = false }) {
  const [formData, setFormData] = useState({
    merchant: initialData.merchant || 'boAt Lifestyle (Imagine Marketing Ltd.)',
    platform: initialData.platform || 'Amazon India',
    product: initialData.product || 'boAt Airdopes 141 ANC True Wireless Earbuds',
    orderId: initialData.orderId || '408-9128472-1082918',
    purchaseDate: initialData.purchaseDate || '2024-04-12',
    amount: initialData.amount || '2499',
    category: initialData.category || 'manufacturing_defect',
    reliefDemanded: initialData.reliefDemanded || 'full_refund_compensation',
    defectDescription:
      initialData.defectDescription ||
      'Left acoustic driver stopped functioning after 3 weeks of standard use. Authorized service center arbitrarily rejected warranty coverage alleging user damage without technical diagnostic proof.',
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
    if (onSave) onSave(formData)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 2-Column Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Merchant / Brand */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
            <ShoppingBag size={13} style={{ color: '#84CC16' }} />
            <span>Target Merchant / Brand</span>
          </label>
          <input
            type="text"
            name="merchant"
            value={formData.merchant}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            placeholder="e.g. boAt Lifestyle / Amazon"
          />
        </div>

        {/* E-Commerce Platform */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5">
            E-Commerce Platform / Seller
          </label>
          <input
            type="text"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            placeholder="e.g. Amazon / Flipkart / Official Store"
          />
        </div>

        {/* Disputed Product */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
            <FileText size={13} style={{ color: '#84CC16' }} />
            <span>Disputed Product & Model</span>
          </label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            placeholder="Product brand and model number"
          />
        </div>

        {/* Order / Invoice Number */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5">
            Order / Invoice Number
          </label>
          <input
            type="text"
            name="orderId"
            value={formData.orderId}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono-ck text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            placeholder="Invoice / Order Docket #"
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
            <Calendar size={13} style={{ color: '#84CC16' }} />
            <span>Purchase Date</span>
          </label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>

        {/* Claim Amount */}
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
            <IndianRupee size={13} style={{ color: '#84CC16' }} />
            <span>Amount Paid (INR)</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono-ck text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            placeholder="2499"
          />
        </div>
      </div>

      {/* Defect Category & Relief Demand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
            <ShieldAlert size={13} style={{ color: '#84CC16' }} />
            <span>Statutory Defect Ground</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <option value="manufacturing_defect">Manufacturing Defect (Section 2(10))</option>
            <option value="deficiency_service">Deficiency in Service (Section 2(11))</option>
            <option value="unfair_trade">Unfair Trade Practice (Section 2(47))</option>
            <option value="counterfeit">Counterfeit / Spurious Good</option>
            <option value="warranty_refusal">Arbitrary Warranty Repudiation</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/80 mb-1.5">
            Relief Demanded
          </label>
          <select
            name="reliefDemanded"
            value={formData.reliefDemanded}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#84CC16]"
            style={{
              background: '#161921',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <option value="full_refund_compensation">Full Refund + Statutory Compensation</option>
            <option value="replacement_damages">Product Replacement + Incidentals</option>
            <option value="immediate_refund">Immediate Unconditional Restitution</option>
          </select>
        </div>
      </div>

      {/* Grievance Narrative */}
      <div>
        <label className="block text-xs font-semibold text-white/80 mb-1.5">
          Grievance Narrative / Evidence Summary
        </label>
        <textarea
          name="defectDescription"
          rows={3}
          value={formData.defectDescription}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#84CC16] leading-relaxed resize-none"
          style={{
            background: '#161921',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          placeholder="Describe the failure, refusal, and consumer rights violation..."
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95"
          style={{
            background: saved ? '#22C55E' : 'linear-gradient(135deg, #84CC16, #65A300)',
            color: '#0B0D11',
            boxShadow: '0 4px 14px rgba(132,204,22,0.25)',
          }}
        >
          {saved ? <Check size={14} strokeWidth={3} /> : <Edit3 size={14} />}
          <span>{saved ? 'Dossier Saved' : 'Save & Update Dossier'}</span>
        </button>
      </div>
    </form>
  )
}
