import React, { useEffect, useState } from 'react'

const MOODS = {
  idle: { eyes: 'open', mouth: 'smile', tilt: 0, scale: 1, caption: 'Ready.' },
  happy: { eyes: 'open', mouth: 'smile', tilt: 0, scale: 1.05, caption: 'Good move.' },
  excited: { eyes: 'open', mouth: 'smile', tilt: -2, scale: 1.1, caption: 'Locked in.' },
  thinking: { eyes: 'open', mouth: 'flat', tilt: -7, scale: 1, caption: 'Thinking…' },
  curious: { eyes: 'open', mouth: 'flat', tilt: -9, scale: 1.02, caption: 'That one?' },
  warning: { eyes: 'narrow', mouth: 'flat', tilt: 5, scale: 1.03, caption: 'Stay on X.' },
  sleepy: { eyes: 'closed', mouth: 'flat', tilt: -5, scale: .96, caption: 'Quiet mode.' },
}

export default function StarrVis({ mood = 'idle', message, compact = false }) {
  const [blink, setBlink] = useState(false)
  const config = MOODS[mood] ?? MOODS.idle

  useEffect(() => {
    if (config.eyes === 'closed') return
    let timer
    const schedule = () => {
      timer = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 130)
        schedule()
      }, 2400 + Math.random() * 2800)
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [mood, config.eyes])

  const eyesClosed = blink || config.eyes === 'closed' || config.eyes === 'narrow'

  return (
    <div
      className={`starrvis ${compact ? 'starrvis-compact' : ''} mood-${mood}`}
      style={{ '--starrvis-tilt': `${config.tilt}deg`, '--starrvis-scale': config.scale }}
      aria-label="StarrVis"
    >
      <div className="starrvis-aura" />
      <svg className="starrvis-body" viewBox="0 0 220 220" role="img" aria-label={config.caption}>
        <defs>
          <radialGradient id="starrvisGold" cx="35%" cy="25%">
            <stop offset="0" stopColor="#fffbe0" />
            <stop offset=".35" stopColor="#ffe36c" />
            <stop offset=".72" stopColor="#f4ad27" />
            <stop offset="1" stopColor="#e47c14" />
          </radialGradient>
          <filter id="starrvisGlow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <polygon
          points="110,14 137,70 198,58 164,110 201,160 139,151 110,207 82,151 19,161 56,110 22,58 83,70"
          fill="url(#starrvisGold)"
          stroke="rgba(255,255,255,.8)"
          strokeWidth="2"
          filter="url(#starrvisGlow)"
        />

        {mood === 'thinking' && (
          <g className="starrvis-thought-stars" fill="#fff4a8">
            <path d="M62 34l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
            <path d="M157 31l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" />
          </g>
        )}

        <g className="starrvis-face" fill="#241600" stroke="#241600" strokeLinecap="round">
          <line x1="82" y1="102" x2="82" y2={eyesClosed ? 104 : 119} strokeWidth="9" />
          <line x1="138" y1="102" x2="138" y2={eyesClosed ? 104 : 119} strokeWidth="9" />
          {config.mouth === 'smile' ? (
            <path d="M90 137 Q110 154 130 137" fill="none" strokeWidth="7" />
          ) : (
            <line x1="97" y1="143" x2="123" y2="140" strokeWidth="7" />
          )}
        </g>
      </svg>

      {message && <div className="starrvis-bubble">{message}</div>}
    </div>
  )
}
