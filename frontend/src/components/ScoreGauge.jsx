import { useEffect, useRef } from 'react'

function getArc(score) {
  const radius = 70
  const circumference = Math.PI * radius // semicircle (180°)
  const filled = (score / 100) * circumference
  return { radius, circumference, filled }
}

function getColor(score) {
  if (score >= 70) return '#10b981' // emerald
  if (score >= 40) return '#f59e0b' // amber
  return '#f43f5e' // rose
}

/**
 * ScoreGauge({ score, label, reasons })
 * score: 0-100
 * label: "Strong" | "Fair" | "Weak"
 */
export default function ScoreGauge({ score = 0, label = '', reasons = [] }) {
  const { radius, circumference, filled } = getArc(score)
  const color = getColor(score)

  const cx = 100
  const cy = 100
  const startX = cx - radius
  const startY = cy
  const endX = cx + radius
  const endY = cy

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="110" viewBox="0 0 200 110" className="overflow-visible">
        {/* track */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* filled arc */}
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        {/* score text */}
        <text x="100" y="88" textAnchor="middle" fill="white" fontSize="30" fontWeight="700">
          {score}
        </text>
        <text x="100" y="108" textAnchor="middle" fill={color} fontSize="12" fontWeight="600">
          {label}
        </text>
      </svg>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-1.5 w-full max-w-sm">
          {reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
              <span className="mt-0.5 text-slate-500">•</span>
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
