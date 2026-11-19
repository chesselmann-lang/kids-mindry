/**
 * GET /api/consent/verify?token=<token>
 * Verify an email confirmation token and activate the parental consent.
 *
 * - Finds the consent_token record
 * - Checks it hasn't expired or been used
 * - Sets confirmed_at on parental_consent
 * - Marks the token as used
 * - Redirects to /einwilligungen?confirmed=1
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return NextResponse.redirect(new URL('/einwilligungen?error=invalid_token', req.url))
  }

  const supabase = await createClient()

  // Look up token (using service-level access — no auth required for this callback)
  const { data: tokenRow, error: tokenErr } = await (supabase as any)
    .from('consent_tokens')
    .select('id, consent_id, expires_at, used_at')
    .eq('token', token)
    .eq('token_type', 'email_confirm')
    .maybeSingle()

  if (tokenErr || !tokenRow) {
    return NextResponse.redirect(new URL('/einwilligungen?error=invalid_token', req.url))
  }

  if (tokenRow.used_at) {
    return NextResponse.redirect(new URL('/einwilligungen?error=token_used', req.url))
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/einwilligungen?error=token_expired', req.url))
  }

  // Confirm the consent
  const { error: consentErr } = await (supabase as any)
    .from('parental_consent')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', tokenRow.consent_id)
    .is('confirmed_at', null)
    .is('revoked_at', null)

  if (consentErr) {
    return NextResponse.redirect(new URL('/einwilligungen?error=confirm_failed', req.url))
  }

  // Mark token as used
  await (supabase as any)
    .from('consent_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenRow.id)

  return NextResponse.redirect(new URL('/einwilligungen?confirmed=1', req.url))
}
