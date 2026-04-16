import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin + (process.env.KIOSK_PIN_SALT ?? 'kitahub-kiosk')).digest('hex')
}

export async function POST(req: Request) {
  const { pin, child_id, action } = await req.json()
  if (!pin || !child_id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = await createClient()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const pinHash = hashPin(String(pin))

  const { data: kioskPin } = await (supabase as any)
    .from('kiosk_pins')
    .select('id, child_id')
    .eq('child_id', child_id)
    .eq('pin_hash', pinHash)
    .eq('active', true)
    .eq('site_id', siteId)
    .single()

  if (!kioskPin) return NextResponse.json({ error: 'Ungültige PIN' }, { status: 401 })

  const today = new Date().toISOString().slice(0, 10)
  const now = new Date().toISOString()

  if (action === 'checkin') {
    const { error } = await (supabase as any)
      .from('attendance')
      .upsert({
        site_id: siteId,
        child_id,
        date: today,
        status: 'present',
        check_in_at: now,
      }, { onConflict: 'site_id,child_id,date' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else if (action === 'checkout') {
    const { error } = await (supabase as any)
      .from('attendance')
      .update({ check_out_at: now })
      .eq('site_id', siteId)
      .eq('child_id', child_id)
      .eq('date', today)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: child } = await supabase
    .from('children').select('first_name, last_name, photo_url').eq('id', child_id).single()

  return NextResponse.json({ success: true, child, action })
}
