import React, { useRef } from 'react'

export default function SpotlightPanel({
  children,
  className = '',
  spotlight = 'rgba(255, 221, 132, .13)',
}) {
  const ref = useRef(null)

  const handlePointerMove = (event) => {
    const node = ref.current
    if (!node || event.pointerType === 'touch') return
    const rect = node.getBoundingClientRect()
    node.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    node.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
    node.style.setProperty('--spot-color', spotlight)
  }

  return (
    <div
      ref={ref}
      className={`spotlight-panel ${className}`}
      onPointerMove={handlePointerMove}
    >
      {children}
    </div>
  )
}
