# XLock / XO

A functional MVP of a **celestial commitment instrument**: choose one X, deliberately lock into it, hide everything else, capture stray thoughts without switching, and finish.

## What works now

- Create your own X with:
  - title
  - task mode / chakra-inspired color
  - expected duration
  - observable Definition of Done
  - NEXT 1–3 actions
- Radial X wheel with tap-to-inspect + physical drag-to-lock gesture
- Exactly one active X at a time
- Persistent focus timer with expected time, elapsed time, remaining time, and overtime
- Individually complete NEXT steps without exposing the backlog
- Capture thoughts into StarrTrack without leaving the current X
- Capture classification: idea, potential project, resource, research question, or note
- Blocker state + blocker-event history
- Structured completion review:
  - timing reason
  - optional execution note
  - delivered/published confirmation
  - step completion snapshot
  - blocker count
- Completion history
- Timeout tokens
- Responsive mobile focus state
- Reduced-motion fallback
- Local-first persistence
- Optional Supabase cloud persistence through the same state adapter
- Vercel-ready SPA configuration

## Core loop

1. Open XLock.
2. See the available X wheel.
3. Create or inspect one X.
4. Confirm Definition of Done + NEXT 1–3.
5. Turn the wheel 28° to lock in.
6. Unrelated Xs disappear.
7. Timer begins and continues into overtime.
8. Check NEXT actions as they are completed.
9. Capture distracting thoughts without leaving X.
10. Report a blocker when one is real.
11. Complete X and record one timing lesson.
12. Reopen the app and the state still exists.

## Local development

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Persistence modes

### Local-first mode

No configuration is required. XLock stores the full MVP state in browser localStorage.

### Supabase cloud mode

The repo already contains the adapter and database schema.

1. Create/connect a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable **Anonymous Sign-Ins** in Supabase Auth for the current MVP.
4. Copy `.env.example` to `.env.local` during local development.
5. Set:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_XLOCK_PROFILE_KEY=primary
```

If a Supabase project still exposes the older anon key, `VITE_SUPABASE_ANON_KEY` is also supported.

The app always writes a local copy first. If cloud setup is absent or temporarily fails, XLock remains usable and reports **Local** rather than blocking execution.

> Current cloud auth is deliberately lightweight for the personal MVP. Anonymous Supabase auth protects each browser/user row with RLS, but it is not yet the final cross-device identity model. A permanent login can be layered onto the persistence adapter later without changing the XLock core loop.

## Vercel

Import **`starrtree/XLock`** as a Vite project.

- Build command: `npm run build`
- Output directory: `dist`
- Node: 22
- SPA rewrites are already defined in `vercel.json`

For cloud persistence, add the same `VITE_SUPABASE_*` variables under:

**Vercel → Project → Settings → Environment Variables**

Then redeploy.

## Visual system / reusable asset policy

XLock follows the StarrTree AI Resource Motherboard rule: prefer proven reusable implementations before inventing advanced UI effects from scratch.

Current implementation uses:

- **Paper Shaders** via `@paper-design/shaders-react` for the lightweight animated cosmic field
- interactive SVG for the task wheel so the lock gesture remains a real control rather than a raster mockup
- custom StarrVis / StarrTree UI assets already adapted into the repo

The Motherboard lists ShaderGradient and Liquid Glass JS as additional resources, but they are intentionally not required for the MVP core loop. The focus surface should remain performant and low-choice before adding heavier visual layers.

## MVP acceptance test

The branch is considered functional when all of these pass:

- open app
- see Current X candidates
- create an X
- see Definition of Done
- see only NEXT 1–3
- lock into one X
- persistent timer begins
- check/uncheck NEXT progress
- capture a thought without leaving focus
- captured thought appears in the vault
- report a blocker
- timer crosses into overtime without stopping
- complete X
- record the primary timing reason
- close/reopen
- state persists
- with Supabase configured, sync status becomes **Cloud**

## Product principle

> Does this reduce digital choice and make commitment feel more physical?

**One X. Capture without switching. Finish what was chosen.**
