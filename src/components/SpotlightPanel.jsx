import React, { useRef } from 'react'

export default function SpotlightPanel({
  children,
  className = '',
  spotlight = 'rgba(255, 221, 132, .13)',
}) {
  const ref = useRef(null)

  const updateLight = (event) => {
    const node = ref.current
    if (!node) return

    const rect = node.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left))
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top))
    const dx = x - rect.width / 2
    const dy = y - rect.height / 2
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    const edgeX = Math.abs(dx) / Math.max(rect.width / 2, 1)
    const edgeY = Math.abs(dy) / Math.max(rect.height / 2, 1)
    const edge = Math.min(1, Math.max(edgeX, edgeY))

    node.style.setProperty('--spot-x', `${x}px`)
    node.style.setProperty('--spot-y', `${y}px`)
    node.style.setProperty('--spot-color', spotlight)
    node.style.setProperty('--spot-angle', `${angle}deg`)
    node.style.setProperty('--spot-edge', edge.toFixed(3))
  }

  const handlePointerMove = (event) => {
    if (event.pointerType === 'touch') return
    updateLight(event)
  }

  return (
    <div
      ref={ref}
      className={`spotlight-panel ${className}`}
      onPointerMove={handlePointerMove}
      onPointerDown={updateLight}
    >
      {children}
    </div>
  )
}
