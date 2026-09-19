import React from 'react'
import { MeshGradient } from '@paper-design/shaders-react'

export default function CosmicField({
  colors = ['#160a28', '#3d1b68', '#07152f', '#b16b20'],
  intensity = 1,
  speed = 0.12,
}) {
  return (
    <div className="paper-cosmic-field" aria-hidden="true" style={{ opacity: intensity }}>
      <MeshGradient
        colors={colors}
        distortion={0.72}
        swirl={0.68}
        speed={speed}
        style={{ width: '100%', height: '100%' }}
      />
      <div className="paper-cosmic-vignette" />
    </div>
  )
}
