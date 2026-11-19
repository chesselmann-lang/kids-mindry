/**
 * POST /api/eltern-pin/verify
 * Verifies an Eltern-Bereich PIN against the kiosk_pins table.
 *
 * Body: { pin: string }  — 4-digit PIN
 * Returns: { valid: boolean }
 *
 * Security:
 * - IP-based sliding-window rate limit: max 10 attempts / 15 min per IP
 * - PIN is SHA-256 hashed with KIOSK_PIN_SALT before comparison
 * - Constant-time comparison via timingSafeEqual
 * - Returns no info about whether a PIN record exists
 * - No auth required (PIN modal is shown before login on kiosk)
 *
 * Rate-limit notes:
 *   In-memory store resets on cold start — acceptable for this threat model.
 *   A 4-digit PIN (10k combos) at 10/15min would take ≥ 250 h to brute-force
 *   across a single warm instance. For multi-instance production hardening,
 *   replace rateLimitStore with Upstash Redis or Vercel KV.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash, timingSafeEqual } from 'crypto'

// ── Rate limiting ─────────────────────────────────────────────────────────────
const RATE_MAX        = 10               // max attempts
const RATE_WINDOW_MS  = 15 * 60 * 1000  // 15 minutes

/** Module-level store — persists across requests within a warm lambda instance */
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()

function getIpKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
                 ?? req.headers.get('x-real-ip')
                 ?? 'unknown'
  const ip = forwarded.split(',')[0].trim()
  // Hash IP for privacy — never store plain IPs
  return createHash('sha256').update(ip + 'mindry-kids-rl').digest('hex').slice(0, 20)
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now })
    return { allowed: true, remaining: RATE_MAX - 1, retryAfterSec: 0 }
  }

  if (entry.count >= RATE_MAX) {
    const retryAfterSec = Math.ceil((RATE_WINDOW_MS - (now - entry.windowStart)) / 1000)
    return { allowed: false, remaining: 0, retryAfterSec }
  }

  entry.count++
  return { allowed: true, remaining: RATE_MAX - entry.count, retryAfterSec: 0 }
}

// ── Crypto helpers ────────────────────────────────────────────────────────────
function hashPin(pin: string): string {
  return createHash('sha256')
    .update(pin + (process.env.KIOSK_PIN_SALT ?? 'kitahub-kiosk'))
    .digest('hex')
}

/** Constant-time string comparison to prevent timing attacks */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
}

export async function POST(req: Request) {
  // ── Rate limit check ────────────────────────────────────────────────────────
  const ipKey = getIpKey(req)
  const rl = checkRateLimit(ipKey)
  if (!rl.allowed) {
    return NextResponse.json(
      { valid: false, error: 'Zu viele Versuche. Bitte warte kurz.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rl.retryAfterSec),
          'X-RateLimit-Limit':     String(RATE_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset':     String(Math.ceil(Date.now() / 1000) + rl.retryAfterSec),
        },
      }
    )
  }

  try {
    const body = await req.json()
    const pin = String(body?.pin ?? '')

    // Basic input validation
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const pinHash = hashPin(pin)
    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID ?? ''

    // Use service-role client so we can read kiosk_pins without user auth
    // (The PIN modal is shown to unauthenticated users on the kiosk)
    const supabase = await createClient()

    // Look for an active site-level Eltern-PIN (child_id IS NULL, label = 'eltern-bereich')
    // Fall back to any active PIN with label 'eltern-bereich' for this site
    const { data: pins, error } = await (supabase as any)
      .from('kiosk_pins')
      .select('pin_hash')
      .eq('label', 'eltern-bereich')
      .eq('active', true)
      .is('child_id', null)
      .limit(5)

    if (error) {
      console.error('[eltern-pin/verify] DB error:', error.message)
      // Fail secure — don't expose DB errors
      return NextResponse.json({ valid: false }, { status: 500 })
    }

    // If no PIN is configured yet, check env-var fallback (for initial setup)
    if (!pins || pins.length === 0) {
      const envPin = process.env.ELTERN_DEFAULT_PIN
      if (envPin && /^\d{4}$/.test(envPin)) {
        const envHash = hashPin(envPin)
        return NextResponse.json({ valid: safeEqual(pinHash, envHash) })
      }
      // No PIN configured — deny access (fail secure)
      return NextResponse.json({ valid: false })
    }

    // Check against all active hashes (supports PIN rotation grace period)
    const valid = pins.some((row: { pin_hash: string }) => {
      try {
        return safeEqual(pinHash, row.pin_hash)
      } catch {
        return false
      }
    })

    return NextResponse.json({ valid }, {
      headers: {
        'X-RateLimit-Limit':     String(RATE_MAX),
        'X-RateLimit-Remaining': String(rl.remaining),
      },
    })
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
