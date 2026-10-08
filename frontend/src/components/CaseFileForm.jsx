import { useState } from 'react'

const FIELD_META = [
  { key: 'product',            label: 'Product Name',       type: 'text' },
  { key: 'brand',              label: 'Brand',              type: 'text' },
  { key: 'defect_type',        label: 'Defect Type',        type: 'text' },
  { key: 'defect_description', label: 'Defect Description', type: 'textarea' },
  { key: 'order_id',           label: 'Order ID',           type: 'text' },
  { key: 'purchase_date',      label: 'Purchase Date',      type: 'text', hint: 'YYYY-MM-DD' },
  { key: 'price',              label: 'Price (₹)',          type: 'text' },
  { key: 'seller',             label: 'Seller',             type: 'text' },
  { key: 'platform',           label: 'Platform',           type: 'text' },
  { key: 'color',              label: 'Color',              type: 'text' },
  { key: 'variant',            label: 'Variant',            type: 'text' },
  { key: 'complaint_summary',  label: 'Complaint Summary',  type: 'textarea' },
]

function FieldRow({ meta, field, onChange }) {
  const val = field?.value || ''
  const confidence = field?.confidence ?? null
  const hasLowConf = confidence !== null && confidence < 0.7

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          {meta.label}
          {hasLowConf && (
            <span
              className="text-[10px] font-medium bg-amber-900/60 text-amber-300 border border-amber-700/40 px-1.5 py-0.5 rounded-full"
              title={`Low confidence: ${(confidence * 100).toFixed(0)}%`}
            >
              ⚠ Verify
            </span>
          )}
        </label>
        {confidence !== null && (
          <span className="text-[10px] text-slate-500">
            {(confidence * 100).toFixed(0)}% conf.
          </span>
        )}
      </div>

      {meta.type === 'textarea' ? (
        <textarea
          value={val}
          onChange={(e) => onChange(meta.key, e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors
            ${hasLowConf ? 'border-amber-600/50 bg-amber-950/10' : 'border-slate-700'}`}
        />
      ) : (
        <input
          type="text"
          value={val}
          placeholder={meta.hint || ''}
          onChange={(e) => onChange(meta.key, e.target.value)}
          className={`w-full px-3 py-2 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-500 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
            ${hasLowConf ? 'border-amber-600/50 bg-amber-950/10' : 'border-slate-700'}`}
        />
      )}
    </div>
  )
}

/**
 * CaseFileForm
 * casefile: { product: {value, confidence}, ... }
 * onSave(fieldKey, value) — called on blur / change
 */
export default function CaseFileForm({ casefile = {}, onSave, saving = {} }) {
  const [local, setLocal] = useState(() => {
    const out = {}
    for (const m of FIELD_META) {
      out[m.key] = casefile[m.key]?.value ?? ''
    }
    return out
  })

  const handleChange = (key, value) => {
    setLocal((l) => ({ ...l, [key]: value }))
  }

  const handleBlur = (key) => {
    const originalValue = casefile[key]?.value ?? ''
    if (local[key] !== originalValue) {
      onSave?.(key, local[key])
    }
  }

  const enrichedCasefile = {}
  for (const m of FIELD_META) {
    enrichedCasefile[m.key] = {
      ...casefile[m.key],
      value: local[m.key],
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {FIELD_META.map((meta) => (
        <div
          key={meta.key}
          className={meta.type === 'textarea' ? 'sm:col-span-2' : ''}
          onBlur={() => handleBlur(meta.key)}
        >
          <FieldRow
            meta={meta}
            field={enrichedCasefile[meta.key]}
            onChange={handleChange}
          />
          {saving[meta.key] && (
            <p className="text-[10px] text-indigo-400 mt-0.5">Saving…</p>
          )}
        </div>
      ))}
    </div>
  )
}
