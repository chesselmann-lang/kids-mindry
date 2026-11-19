/**
 * POST /api/consent/save
 * Upsert a parental consent record for a child.
 * Creates or updates the record; resets confirmed_at so email re-confirmation is required.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { child_id, scopes, consent_version } = body

  if (!child_id || typeof child_id !== 'string') {
    return NextResponse.json({ error: 'child_id erforderlich' }, { status: 400 })
  }

  // Verify the requesting user is a guardian of this child
  const { data: guardian } = await supabase
    .from('guardians')
    .select('id')
    .eq('child_id', child_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!guardian) {
    return NextResponse.json({ error: 'Forbidden — nicht erziehungsberechtigt für dieses Kind' }, { status: 403 })
  }

  const now = new Date().toISOString()

  // Upsert the consent record
  const { error } = await (supabase as any)
    .from('parental_consent')
    .upsert({
      child_id,
      guardian_id: user.id,
      consent_version: consent_version ?? '1.0',
      consented_at: now,
      confirmed_at: null,         // requires email confirmation
      revoked_at: null,
      scope_learning: true,       // always required
      scope_analytics: scopes?.scope_analytics ?? false,
      scope_marketing: scopes?.scope_marketing ?? false,
      scope_personalization: scopes?.scope_personalization ?? false,
    }, {
      onConflict: 'child_id,guardian_id',
      ignoreDuplicates: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Auto-send confirmation email (non-blocking)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'}/api/consent/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') ?? '' },
      body: JSON.stringify({ child_id }),
    })
  } catch { /* ignore — user can retry manually */ }

  return NextResponse.json({ success: true })
}
