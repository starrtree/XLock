import { createClient } from '@supabase/supabase-js';

// Vercel Node function, not bundled into the Vite browser application.
// Every required secret and the allowed Supabase user ID must be configured
// server-side; the endpoint fails closed when any one is missing.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const upstreamOrigin = process.env.STARRLIGN_API_URL;
  const bridgeSecret = process.env.STARRLIGN_BRIDGE_API_KEY;
  const allowedUserId = process.env.XLOCK_ALLOWED_USER_ID;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!upstreamOrigin || !bridgeSecret || !allowedUserId || !supabaseUrl || !publishableKey) {
    return res.status(503).json({ success: false, error: 'StarrLign bridge not configured' });
  }

  const auth = req.headers.authorization || '';
  const token = /^Bearer\s+(.+)$/i.exec(auth)?.[1]?.trim();
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });

  try {
    // Verify a real Supabase session, not an untrusted client-supplied user ID.
    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user || data.user.id !== allowedUserId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const base = new URL(upstreamOrigin);
    if (base.protocol !== 'https:') {
      return res.status(503).json({ success: false, error: 'Bridge origin must use HTTPS' });
    }
    const upstream = new URL('/api/xlock/tasks?limit=6', base);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    let response;
    try {
      response = await fetch(upstream, {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + bridgeSecret, Accept: 'application/json' },
        cache: 'no-store',
        redirect: 'error',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return res.status(502).json({ success: false, error: 'StarrLign feed unavailable' });
    }
    const body = await response.json();
    if (!body?.success || !Array.isArray(body.tasks)) {
      return res.status(502).json({ success: false, error: 'Unexpected StarrLign response' });
    }
    return res.status(200).json(body);
  } catch (error) {
    console.error('StarrLign bridge request failed', error);
    return res.status(502).json({ success: false, error: 'StarrLign connection failed' });
  }
}
