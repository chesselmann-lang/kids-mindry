/**
 * GET /api/health
 * Public health-check — no auth required.
 *
 * Critical checks (503 on failure): database
 * Optional checks (degraded but 200): anthropic, stripe, resend
 *
 * Used by uptime monitors (UptimeRobot etc.) and Vercel cron health pings.
 * Response: { status: 'ok'|'degraded'|'down', version, timestamp, checks }
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function envCheck(key: string): boolean {
  const v = process.env[key]
  return !!v && v !== 'REPLACE_ME' && !v.startsWith('your_')
}

export async function GET() {
  const start = Date.now()
  const checks: Record<string, { ok: boolean; critical?: boolean; ms?: number; note?: string }> = {}

  // ── Critical: Database ─────────────────────────────────────────────────────
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const t0 = Date.now()
    const { error } = await supabase.from('sites').select('id', { head: true, count: 'exact' })
    checks.database = { ok: !error, critical: true, ms: Date.now() - t0 }
  } catch {
    checks.database = { ok: false, critical: true }
  }

  // ── Optional: external services (env-var presence only) ───────────────────
  checks.anthropic = { ok: envCheck('ANTHROPIC_API_KEY'), note: 'KI-Features' }
  checks.stripe    = { ok: envCheck('STRIPE_SECRET_KEY'), note: 'Zahlungen' }
  checks.resend    = { ok: envCheck('RESEND_API_KEY'),    note: 'E-Mail-Versand' }
  checks.kiosk_pin = { ok: envCheck('KIOSK_PIN_SALT'),    note: 'Eltern-PIN' }

  const criticalOk = Object.values(checks).every(c => !c.critical || c.ok)
  const allOk      = Object.values(checks).every(c => c.ok)

  const status = criticalOk && allOk ? 'ok' : criticalOk ? 'degraded' : 'down'
  const httpStatus = criticalOk ? 200 : 503

  return NextResponse.json(
    {
      status,
      version: process.env.npm_package_version ?? '0.1.0',
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - start,
      checks,
    },
    {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    }
  )
}
