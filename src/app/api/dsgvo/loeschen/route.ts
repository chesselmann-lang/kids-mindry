import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// POST /api/dsgvo/loeschen — löscht abgelaufene Daten gemäß Aufbewahrungsfristen
// GET  /api/dsgvo/loeschen — Vorschau was gelöscht werden würde (dry run)
export async function GET(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const jetzt = new Date()
  const vor3Jahren = new Date(jetzt); vor3Jahren.setFullYear(vor3Jahren.getFullYear() - 3)
  const vor10Jahren = new Date(jetzt); vor10Jahren.setFullYear(vor10Jahren.getFullYear() - 10)

  // Ausgetretene Kinder älter als 3 Jahre
  const { data: alteKinder } = await admin
    .from('children')
    .select('id, first_name, last_name, updated_at')
    .eq('status', 'archived')
    .lt('updated_at', vor3Jahren.toISOString())

  // Tagesberichte älter als 3 Jahre
  const { count: alteBerichte } = await admin
    .from('tagesberichte')
    .select('id', { count: 'exact', head: true })
    .lt('created_at', vor3Jahren.toISOString())

  // Alte Anmeldungen (abgelehnt/archiviert) älter als 3 Jahre
  const { count: alteAnmeldungen } = await admin
    .from('online_anmeldungen')
    .select('id', { count: 'exact', head: true })
    .in('status', ['abgelehnt', 'archiviert'])
    .lt('created_at', vor3Jahren.toISOString())

  return NextResponse.json({
    dryRun: true,
    stichtag3Jahre: vor3Jahren.toISOString().split('T')[0],
    stichtag10Jahre: vor10Jahren.toISOString().split('T')[0],
    zuLoeschen: {
      kinderArchiviert: alteKinder?.length ?? 0,
      kinder: alteKinder?.map(k => ({ id: k.id, name: `${k.first_name} ${k.last_name}`, seit: k.updated_at })),
      tagesberichte: alteBerichte ?? 0,
      onlineAnmeldungen: alteAnmeldungen ?? 0,
    }
  })
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => cookieStore.get(n)?.value } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { confirm } = await req.json()
  if (confirm !== 'DSGVO_LOESCHUNG_BESTAETIGT') {
    return NextResponse.json({ error: 'Bestätigung fehlt' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const jetzt = new Date()
  const vor3Jahren = new Date(jetzt); vor3Jahren.setFullYear(vor3Jahren.getFullYear() - 3)

  let geloescht = { kinder: 0, tagesberichte: 0, anmeldungen: 0 }

  // Ausgetretene Kinder anonymisieren (nicht hart löschen, um Unfallberichte zu erhalten)
  const { data: alteKinder } = await admin
    .from('children')
    .select('id')
    .eq('status', 'archived')
    .lt('updated_at', vor3Jahren.toISOString())

  if (alteKinder?.length) {
    for (const k of alteKinder) {
      await admin.from('children').update({
        first_name: '[gelöscht]',
        last_name: '[gelöscht]',
        photo_url: null,
        date_of_birth: null,
        notes: null,
        status: 'deleted',
      }).eq('id', k.id)
    }
    geloescht.kinder = alteKinder.length
  }

  // Tagesberichte löschen
  const { count: b } = await admin
    .from('tagesberichte')
    .delete({ count: 'exact' })
    .lt('created_at', vor3Jahren.toISOString())
  geloescht.tagesberichte = b ?? 0

  // Abgelehnte Anmeldungen löschen
  const { count: a } = await admin
    .from('online_anmeldungen')
    .delete({ count: 'exact' })
    .in('status', ['abgelehnt', 'archiviert'])
    .lt('created_at', vor3Jahren.toISOString())
  geloescht.anmeldungen = a ?? 0

  // Protokollieren
  try {
    await admin.from('audit_logs').insert({
      action: 'dsgvo_loeschung',
      user_id: user.id,
      changes: geloescht,
    })
  } catch (_) {}

  return NextResponse.json({ success: true, geloescht })
}
