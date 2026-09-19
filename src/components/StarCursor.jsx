import { useEffect, useRef } from 'react'

// Adapted from the StarrTree Assets Lab StarCursor.
// The native cursor remains available for precision/accessibility.
export default function StarCursor({ enabled = true }) {
  const ref = useRef(null)

  useEffect(() => {
    if (
      !enabled ||
      !window.matchMedia('(pointer:fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return

    let frame = 0
    let x = 0
    let y = 0

    const move = (event) => {
      x = event.clientX
      y = event.clientY
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (!ref.current) return
        ref.current.style.transform = `translate3d(${x - 15}px,${y - 15}px,0)`
        ref.current.style.opacity = '.7'
      })
    }

    const leave = () => {
      if (ref.current) ref.current.style.opacity = '0'
    }

    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [enabled])

  return enabled ? <span ref={ref} className="star-cursor" aria-hidden="true">✧</span> : null
}
