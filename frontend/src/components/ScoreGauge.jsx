import { useEffect, useState } from 'react'

export default function ScoreGauge({
  score = 86,
  size = 120,
  strokeWidth = 8,
  title = 'Win Probability',
  subtitle = 'NCH Precedent Match',
  showDetails = true,
}) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100)
    return () => clearTimeout(timer)
  }, [score])

  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  // Color scheme based on score
  const color =
    score >= 80 ? '#84CC16' : score >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center"
          style={{ filter: `drop-shadow(0 0 12px ${color}33)` }}
        >
          {/* Track background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#1C2030"
            strokeWidth={strokeWidth}
          />
          {/* Animated score stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            className="font-mono-ck font-bold tracking-tight leading-none"
            style={{
              fontSize: size > 100 ? '28px' : '18px',
              color: '#E8EAF6',
            }}
          >
            {score}
            <span style={{ fontSize: '12px', color: '#9196B0', fontWeight: 'normal' }}>
              %
            </span>
          </span>
          <span
            className="font-mono-ck uppercase tracking-widest text-[9px] mt-0.5"
            style={{ color: color }}
          >
            {score >= 80 ? 'STRONG' : score >= 60 ? 'MODERATE' : 'WEAK'}
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="text-center mt-2">
          <p className="text-xs font-semibold" style={{ color: '#E8EAF6' }}>
            {title}
          </p>
          <p className="font-mono-ck text-[10px]" style={{ color: '#9196B0' }}>
            {subtitle}
          </p>
        </div>
      )}
    </div>
  )
}
