import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const start = Date.now()
  const checks: Record<string, { ok: boolean; ms?: number; error?: string }> = {}

  // DB check
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const t0 = Date.now()
    const { error } = await supabase.from('sites').select('id').limit(1)
    checks.database = { ok: !error, ms: Date.now() - t0, error: error?.message }
  } catch (e: any) {
    checks.database = { ok: false, error: e.message }
  }

  // Anthropic check (just env var presence)
  checks.anthropic = {
    ok: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'REPLACE_ME'
  }

  // Stripe check
  checks.stripe = {
    ok: !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'REPLACE_ME'
  }

  // Resend check
  checks.resend = {
    ok: !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'REPLACE_ME'
  }

  const allOk = Object.values(checks).every(c => c.ok)
  const totalMs = Date.now() - start

  return NextResponse.json(
    {
      status: allOk ? 'ok' : 'degraded',
      uptime: process.uptime(),
      responseMs: totalMs,
      version: process.env.npm_package_version ?? '0.1.0',
      checks,
      timestamp: new Date().toISOString(),
    },
    {
      status: allOk ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
