import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + (process.env.KIOSK_PIN_SALT ?? 'kitahub-kiosk')).digest('hex')
}

// POST: PIN setzen/ändern
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { child_id, pin, label } = await req.json()
  if (!child_id || !pin || String(pin).length !== 4 || !/^\d{4}$/.test(String(pin))) {
    return NextResponse.json({ error: 'PIN muss 4 Ziffern haben' }, { status: 400 })
  }

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const pinHash = hashPin(String(pin))

  await (supabase as any)
    .from('kiosk_pins')
    .update({ active: false })
    .eq('child_id', child_id)
    .eq('site_id', siteId)

  const { error } = await (supabase as any)
    .from('kiosk_pins')
    .insert({ site_id: siteId, child_id, pin_hash: pinHash, label: label ?? 'Hauptzugang', active: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// GET: prüfen ob PIN existiert (ohne den Hash preiszugeben)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const childId = searchParams.get('child_id')
  if (!childId) return NextResponse.json({ has_pin: false })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await (supabase as any)
    .from('kiosk_pins')
    .select('id, label, created_at')
    .eq('child_id', childId)
    .eq('active', true)
    .maybeSingle()

  return NextResponse.json({ has_pin: !!data, pin_info: data })
}
