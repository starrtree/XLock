# StarrLign → XLock task signal (v1)

This feature adds a READ-ONLY, low-overwhelm task feed before the existing XLock instrument. It does not turn the feed items into local XLock task copies or silently switch the Current X. XLock's current lock/focus/capture loop remains unchanged.

## Server route
Root-level Vercel function: api/xlock/tasks.js

Flow:
XLock browser (verified Supabase access token) → same-origin /api/xlock/tasks → server verifies token and required allowlisted user ID → StarrLign /api/xlock/tasks with server-side shared secret → Turso.

Server environments for the XLock Vercel project:
- STARRLIGN_API_URL: exact HTTPS origin of the StarrLign deployment
- STARRLIGN_BRIDGE_API_KEY: same random 32+ character secret configured in the StarrLign server as STARRLIGN_XLOCK_BRIDGE_KEY
- XLOCK_ALLOWED_USER_ID: allowed Supabase auth.users ID for this personal MVP
- VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY: existing Supabase project/session configuration

Important:
- Never prefix the bridge service key or allowlist ID with VITE_/NEXT_PUBLIC_.
- Never place server secrets in the browser or Git.
- The function fails closed when env vars are missing.
- The browser sends its own Supabase session token to the XLock backend, never the StarrLign bridge key.
- Supabase anonymous sessions are DEVICE-SPECIFIC: the allowlisted account must be deliberately chosen. Cross-device identity is a separate feature.
- Both deployed backends must be configured and accessible to each other for real task data.

## Client semantics
- "Suggested Next" is a candidate from StarrLign, NOT automatically the locked/true NOW.
- Up to three Horizon items show approaching committed work.
- Feed is read-only until StarrLign's older whole-database save path can safely coexist with granular progress/completion writes.
- No fabricated revenue, gain/loss, task outcomes or deadlines.
- Connection errors must NOT break XLock's existing local/cloud focus functionality.

## Activation/testing checklist
1. Confirm StarrLign task API PR was merged/deployed and protected by its server secret.
2. Confirm StarrLign's existing /api/db access exposure is reviewed; it currently lacks route-level authentication in source.
3. Configure both server secrets and exact app origin; pick/allowlist the intended Supabase user ID.
4. On XLock preview call /api/xlock/tasks without Authorization; expect HTTP 401 (or 503 when not configured), NEVER a task feed.
5. Verify incorrect/other-user tokens return HTTP 403.
6. Verify valid allowlisted Supabase token returns a bounded StarrLign task feed, with correct sourceTaskId and generatedAt.
7. Verify mobile/desktop panel does not obstruct focus controls, and XLock's selection/lock session still works.
8. Only then consider merging each PR. Neither PR requires deploying real finance data.

## Next feature, not part of this milestone
Make StarrLign save granular/concurrency-safe; then allow XLock to lock a StarrLign canonical task ID and write back verified progress/completion. Do not call StarrLign POST /api/db for cross-app writes.
