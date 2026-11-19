/**
 * POST /api/consent/send-email
 * Send an Art. 8 consent confirmation email to the guardian.
 *
 * Creates a consent_token (48h TTL) and sends a Resend email with the confirmation link.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { child_id } = await req.json()
  if (!child_id) return NextResponse.json({ error: 'child_id erforderlich' }, { status: 400 })

  // Verify guardian
  const { data: guardian } = await supabase
    .from('guardians')
    .select('id, full_name, children(first_name)')
    .eq('child_id', child_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!guardian) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Verify a pending consent exists
  const { data: consent } = await (supabase as any)
    .from('parental_consent')
    .select('id')
    .eq('child_id', child_id)
    .eq('guardian_id', user.id)
    .is('revoked_at', null)
    .is('confirmed_at', null)
    .maybeSingle()

  if (!consent) {
    return NextResponse.json({ error: 'Keine ausstehende Einwilligung für dieses Kind' }, { status: 400 })
  }

  // Create confirmation token (48h TTL)
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  const { error: tokenError } = await (supabase as any)
    .from('consent_tokens')
    .insert({
      consent_id: consent.id,
      token,
      token_type: 'email_confirm',
      expires_at: expiresAt,
    })

  if (tokenError) {
    return NextResponse.json({ error: tokenError.message }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'
  const confirmUrl = `${appUrl}/api/consent/verify?token=${token}`

  const childName = (guardian.children as any)?.first_name ?? 'Ihr Kind'
  const guardianName = (guardian as any).full_name ?? 'Erziehungsberechtigte/r'

  // Send via Resend
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.warn('[consent/send-email] RESEND_API_KEY not configured — skipping email send')
    return NextResponse.json({ success: true, warning: 'E-Mail-Versand nicht konfiguriert' })
  }

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'mindry kids <datenschutz@kids.mindry.de>',
      to: [user.email!],
      subject: `Bitte bestätigen Sie Ihre Einwilligung für ${childName}`,
      html: buildConfirmEmail({ guardianName, childName, confirmUrl, expiresAt }),
    }),
  })

  if (!emailRes.ok) {
    const err = await emailRes.json()
    return NextResponse.json({ error: `E-Mail-Fehler: ${err.message ?? emailRes.statusText}` }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

function buildConfirmEmail(opts: {
  guardianName: string
  childName: string
  confirmUrl: string
  expiresAt: string
}): string {
  const expiryDate = new Date(opts.expiresAt).toLocaleString('de-DE', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 20px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px 32px 24px; text-align: center;">
      <div style="width: 48px; height: 48px; background: white; border-radius: 12px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 24px;">🔒</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">Einwilligung bestätigen</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 13px;">mindry kids · Datenschutz</p>
    </div>
    <!-- Body -->
    <div style="padding: 32px;">
      <p style="color: #374151; font-size: 15px; margin: 0 0 16px;">Hallo ${opts.guardianName},</p>
      <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
        Sie haben soeben eine Datenschutzeinwilligung für <strong>${opts.childName}</strong> auf <strong>mindry kids</strong> erteilt.
        Um die Einwilligung gemäß <strong>Art. 8 DSGVO</strong> zu aktivieren, müssen Sie diese per Klick bestätigen.
      </p>
      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${opts.confirmUrl}"
           style="display: inline-block; background: #2563eb; color: white; text-decoration: none;
                  padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px;">
          ✓ Einwilligung jetzt bestätigen
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0 0 20px;">
        Dieser Link ist gültig bis: <strong>${expiryDate} Uhr</strong>
      </p>
      <!-- Security note -->
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px;">
        <p style="color: #374151; font-size: 12px; margin: 0 0 6px; font-weight: 600;">🔐 Sicherheitshinweis</p>
        <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
          Falls Sie keine Einwilligung erteilt haben, ignorieren Sie diese E-Mail. Es wurden keine Daten gespeichert.
          Sie können Ihre Einwilligung jederzeit unter <em>Einstellungen → Einwilligungen</em> widerrufen.
        </p>
      </div>
    </div>
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0; text-align: center; line-height: 1.5;">
        Hesselmann Beratung UG · Adlerstraße 1 · 44137 Dortmund<br>
        <a href="https://kids.mindry.de/datenschutz" style="color: #6b7280;">Datenschutzerklärung</a> ·
        <a href="https://kids.mindry.de/impressum" style="color: #6b7280;">Impressum</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}
