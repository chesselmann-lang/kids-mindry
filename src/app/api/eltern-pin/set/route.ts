/**
 * POST /api/eltern-pin/set
 * Set or change the site-wide Eltern-Bereich PIN.
 *
 * Requires: authenticated admin or group_lead.
 * Body: { pin: string, current_pin?: string }
 *       current_pin is required if a PIN already exists (rotation protection).
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function hashPin(pin: string): string {
  return crypto
    .createHash('sha256')
    .update(pin + (process.env.KIOSK_PIN_SALT ?? 'kitahub-kiosk'))
    .digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, site_id')
    .eq('id', user.id)
    .single()

  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden — Nur Admins können den Eltern-PIN ändern' }, { status: 403 })
  }

  const body = await req.json()
  const newPin = String(body?.pin ?? '')
  const currentPin = String(body?.current_pin ?? '')

  if (!/^\d{4}$/.test(newPin)) {
    return NextResponse.json({ error: 'PIN muss genau 4 Ziffern haben' }, { status: 400 })
  }

  const siteId = (profile as any)?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID

  // Check if a PIN already exists — require current_pin for rotation
  const { data: existing } = await (supabase as any)
    .from('kiosk_pins')
    .select('id, pin_hash')
    .eq('label', 'eltern-bereich')
    .eq('active', true)
    .is('child_id', null)
    .limit(1)
    .maybeSingle()

  if (existing) {
    if (!currentPin || !/^\d{4}$/.test(currentPin)) {
      return NextResponse.json({ error: 'Aktueller PIN erforderlich zum Ändern' }, { status: 400 })
    }
    if (!safeEqual(hashPin(currentPin), existing.pin_hash)) {
      return NextResponse.json({ error: 'Aktueller PIN ist falsch' }, { status: 403 })
    }
    // Deactivate current PIN
    await (supabase as any)
      .from('kiosk_pins')
      .update({ active: false })
      .eq('id', existing.id)
  }

  // Insert new PIN
  const { error } = await (supabase as any)
    .from('kiosk_pins')
    .insert({
      site_id: siteId,
      child_id: null,
      pin_hash: hashPin(newPin),
      label: 'eltern-bereich',
      active: true,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Audit log
  try {
    await (supabase as any).from('audit_log').insert({
      actor_id: user.id,
      action: 'eltern_pin_changed',
      target_type: 'site',
      target_id: siteId,
      site_id: siteId,
      metadata: { changed_by: user.email ?? user.id },
    })
  } catch { /* audit failure must not block the main action */ }

  return NextResponse.json({ success: true })
}
