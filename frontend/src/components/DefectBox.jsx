/**
 * DefectBox — shows a photo with an optional bounding box overlay.
 * box: [ymin, xmin, ymax, xmax] on a 0-1000 scale
 * url: signed URL for the photo
 */
export default function DefectBox({ url, box, alt = 'Defect photo' }) {
  if (!url) return null

  const toPercent = (v) => `${(v / 10).toFixed(2)}%`

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
      <img
        src={url}
        alt={alt}
        className="w-full object-contain max-h-96"
        onError={(e) => { e.target.style.display = 'none' }}
      />
      {box && Array.isArray(box) && box.length === 4 && (
        <div
          className="absolute border-2 border-rose-500 rounded shadow-lg shadow-rose-500/40 pointer-events-none"
          style={{
            top:    toPercent(box[0]),
            left:   toPercent(box[1]),
            height: toPercent(box[2] - box[0]),
            width:  toPercent(box[3] - box[1]),
          }}
        >
          <span className="absolute -top-5 left-0 text-[10px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded">
            Defect
          </span>
        </div>
      )}
    </div>
  )
}
