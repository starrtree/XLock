import React from 'react'
import { DotOrbit, LiquidMetal, MeshGradient } from '@paper-design/shaders-react'

const STARRTREE_TEXTURE =
  'https://raw.githubusercontent.com/starrtree/StarrTree/main/assets/starrtree_background_final.png'

export default function CosmicField({
  colors = ['#160a28', '#3d1b68', '#07152f', '#b16b20'],
  intensity = 1,
  speed = 0.12,
}) {
  return (
    <div className="paper-cosmic-field" aria-hidden="true" style={{ opacity: intensity }}>
      <img
        className="starrtree-source-texture"
        src={STARRTREE_TEXTURE}
        alt=""
        loading="eager"
        decoding="async"
      />
      <MeshGradient
        colors={colors}
        distortion={0.72}
        swirl={0.68}
        speed={speed}
        style={{ width: '100%', height: '100%' }}
      />
      <div className="paper-metal-accent">
        <LiquidMetal
          shape="circle"
          colorBack="#030304"
          colorTint="#d7ae52"
          scale={0.66}
          speed={0.14}
          softness={0.42}
          repetition={2.1}
          distortion={0.08}
          contour={0.48}
          shiftRed={0}
          shiftBlue={0}
          angle={68}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="paper-orbit-accent">
        <DotOrbit
          colors={[colors[0], colors[2], colors[1], colors[3]]}
          colorBack="#050309"
          scale={0.32}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="paper-cosmic-vignette" />
    </div>
  )
}
