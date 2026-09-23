# XLock deployment checklist

## 1. Supabase

1. Create or choose a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. In Auth settings, enable Anonymous Sign-Ins.
5. Copy the project URL and publishable key.

The SQL enables RLS and restricts each row to the authenticated Supabase user that owns it.

## 2. Vercel

1. Import `starrtree/XLock`.
2. Framework preset: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Node.js: 22.
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - optional `VITE_XLOCK_PROFILE_KEY=primary`
7. Deploy.

## 3. Smoke test after deploy

- Create a new X.
- Reload and confirm it remains.
- Confirm the top-right persistence badge says **Cloud**.
- Lock into the X.
- Check a NEXT action.
- Capture a thought.
- Reload while the timer is running and confirm the session survives.
- Let a short test X enter overtime.
- Complete it and record a timing reason.
- Confirm the completion appears in history.
- Open the app in the same browser later and confirm cloud hydration restores the state.

## 4. Before calling the MVP finished

Do not add more visual systems until the core acceptance loop above passes on both desktop and mobile.

The next infrastructure milestone after this is permanent identity / cross-device auth. That should be implemented inside the persistence adapter rather than spreading database calls through UI components.
