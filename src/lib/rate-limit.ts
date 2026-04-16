/**
 * Simple sliding-window in-memory rate limiter.
 * Works for single-instance deployments (pm2 fork mode).
 */

interface Entry { count: number; reset: number }
const store = new Map<string, Entry>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of Array.from(store.entries())) {
      if (v.reset < now) store.delete(k)
    }
  }, 5 * 60 * 1000)
}

export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): { ok: boolean; remaining: number; reset: number } {
  const now = Date.now()
  let entry = store.get(key)

  if (!entry || entry.reset < now) {
    entry = { count: 0, reset: now + windowMs }
    store.set(key, entry)
  }

  entry.count++
  const remaining = Math.max(0, limit - entry.count)
  return { ok: entry.count <= limit, remaining, reset: entry.reset }
}

export function rateLimitResponse(reset: number) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  )
}
