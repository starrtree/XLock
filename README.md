# XLock / XO

A functional MVP of a **celestial commitment instrument**: choose one X, deliberately lock into it, hide everything else, capture stray thoughts without switching, and finish.

## Core loop

1. Open the task wheel.
2. Tap a sector to inspect Definition of Done + NEXT.
3. Drag/rotate the wheel 28° to lock in.
4. All unrelated tasks disappear.
5. Timer begins and keeps counting into overtime.
6. Capture thoughts without exposing the backlog.
7. Use scarce 10m / 30m timeout tokens if needed.
8. Complete X.
9. Wheel returns with remaining tasks.
10. State persists in localStorage.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Vercel

Import `starrtree/XLock` into Vercel as a Vite project. The included `vercel.json` rewrites SPA routes to `/`.

## Current MVP architecture

- React 19 + Vite
- SVG radial task wheel
- Pointer/touch drag-to-lock gesture
- CSS celestial visual system
- Persistent localStorage state
- Focus timer + overtime
- Capture vault
- Completion history
- Timeout tokens
- Responsive mobile focus state
- Reduced-motion fallback

## Asset integration next

Drop the generated visual assets into `public/assets/` using stable names:

- `starrx.png`
- `xlock-wheel.png`
- `capture-singularity.png`
- `timeout-10.png`
- `timeout-30.png`
- StarrVis sprites/GIFs under `public/assets/starrvis/`

The current wheel is intentionally implemented as interactive SVG rather than hard-coded raster art so the interaction works now. The next visual pass should use the generated wheel art as a skin with SVG sector masks / clipPaths over it.

## Product principle

> Does this reduce digital choice and make commitment feel more physical?

The wheel is the product.
