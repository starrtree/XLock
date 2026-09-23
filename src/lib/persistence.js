import { createClient } from '@supabase/supabase-js'

const STORAGE_KEY = 'xlock-mvp-v2'
const LEGACY_STORAGE_KEY = 'xlock-mvp-v1'
const PROFILE_KEY = import.meta.env.VITE_XLOCK_PROFILE_KEY || 'primary'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

const CLOUD_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_KEY)

let supabase = null
let authPromise = null

function safeParse(value) {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function normalizeState(input, fallback) {
  const base = fallback ?? {
    tasks: [],
    activeSession: null,
    captures: [],
    completions: [],
  }

  if (!input || typeof input !== 'object') return base

  return {
    tasks: Array.isArray(input.tasks) ? input.tasks : base.tasks,
    activeSession: input.activeSession ?? null,
    captures: Array.isArray(input.captures) ? input.captures : [],
    completions: Array.isArray(input.completions) ? input.completions : [],
  }
}

export function readCachedState(fallback) {
  if (typeof window === 'undefined') return fallback

  const current = safeParse(window.localStorage?.getItem(STORAGE_KEY))
  if (current) return normalizeState(current, fallback)

  const legacy = safeParse(window.localStorage?.getItem(LEGACY_STORAGE_KEY))
  if (legacy) {
    const migrated = normalizeState(legacy, fallback)
    try {
      window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(migrated))
    } catch {
      // Local persistence is best-effort; the app must still run in memory.
    }
    return migrated
  }

  return fallback
}

export function writeCachedState(state) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('XLock local persistence unavailable.', error)
  }
}

function getSupabase() {
  if (!CLOUD_CONFIGURED) return null
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabase
}

async function ensureUser() {
  const client = getSupabase()
  if (!client) return null
  if (authPromise) return authPromise

  authPromise = (async () => {
    const { data: sessionData, error: sessionError } = await client.auth.getSession()
    if (sessionError) throw sessionError

    if (sessionData.session?.user) return sessionData.session.user

    const { data, error } = await client.auth.signInAnonymously({
      options: {
        data: { app: 'xlock' },
      },
    })

    if (error) throw error
    if (!data.user) throw new Error('Supabase anonymous sign-in returned no user.')
    return data.user
  })()

  try {
    return await authPromise
  } finally {
    authPromise = null
  }
}

export function cloudConfigured() {
  return CLOUD_CONFIGURED
}

export async function hydrateState(localState) {
  writeCachedState(localState)

  if (!CLOUD_CONFIGURED) {
    return { state: localState, mode: 'local', status: 'ready' }
  }

  try {
    const client = getSupabase()
    const user = await ensureUser()

    const { data, error } = await client
      .from('xlock_state')
      .select('payload, updated_at')
      .eq('owner_id', user.id)
      .eq('profile_key', PROFILE_KEY)
      .maybeSingle()

    if (error) throw error

    if (data?.payload) {
      const remoteState = normalizeState(data.payload, localState)
      writeCachedState(remoteState)
      return { state: remoteState, mode: 'cloud', status: 'synced' }
    }

    const result = await persistState(localState)
    return { state: localState, mode: result.mode, status: result.status }
  } catch (error) {
    console.warn('XLock cloud hydration failed; using local state.', error)
    return {
      state: localState,
      mode: 'local',
      status: 'offline',
      error: String(error?.message || error),
    }
  }
}

export async function persistState(state) {
  writeCachedState(state)

  if (!CLOUD_CONFIGURED) {
    return { mode: 'local', status: 'ready' }
  }

  try {
    const client = getSupabase()
    const user = await ensureUser()

    const { error } = await client
      .from('xlock_state')
      .upsert(
        {
          owner_id: user.id,
          profile_key: PROFILE_KEY,
          payload: state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'owner_id,profile_key' },
      )

    if (error) throw error
    return { mode: 'cloud', status: 'synced' }
  } catch (error) {
    console.warn('XLock cloud sync failed; local copy remains current.', error)
    return {
      mode: 'local',
      status: 'offline',
      error: String(error?.message || error),
    }
  }
}
