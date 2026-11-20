import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

// Löschung nach Aufbewahrungsfristen – immer nur für die Einrichtung des Admins.
// GET  /api/dsgvo/loeschen — Vorschau (dry run)
// POST /api/dsgvo/loeschen — ausführen, Body { confirm: 'DSGVO_LOESCHUNG_BESTAETIGT' }

const AUFBEWAHRUNG_JAHRE = 3

async function requireSiteAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()
  if (profile?.role !== 'admin' || !profile.site_id) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { user, siteId: profile.site_id }
}

function adminClient() {
  return createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function stichtag() {
  const d = new Date()
  d.setFullYear(d.getFullYear() - AUFBEWAHRUNG_JAHRE)
  return d.toISOString()
}

async function sammeln(admin: ReturnType<typeof adminClient>, siteId: string, grenze: string) {
  // Ausgetretene Kinder dieser Einrichtung, seit mehr als 3 Jahren archiviert
  const { data: alteKinder, error: e1 } = await admin
    .from('children')
    .select('id, first_name, last_name, updated_at')
    .eq('site_id', siteId)
    .eq('status', 'archived')
    .lt('updated_at', grenze)
  if (e1) throw e1

  // Alle Kinder der Einrichtung (daily_reports hat keine site_id)
  const { data: kinderDerEinrichtung, error: e2 } = await admin
    .from('children').select('id').eq('site_id', siteId)
  if (e2) throw e2
  const kindIds = (kinderDerEinrichtung ?? []).map(k => k.id)

  return { alteKinder: alteKinder ?? [], kindIds }
}

export async function GET(_req: NextRequest) {
  const auth = await requireSiteAdmin()
  if ('error' in auth) return auth.error

  const admin = adminClient()
  const grenze = stichtag()

  try {
    const { alteKinder, kindIds } = await sammeln(admin, auth.siteId, grenze)

    let alteBerichte = 0
    if (kindIds.length) {
      const { count, error } = await admin
        .from('daily_reports')
        .select('id', { count: 'exact', head: true })
        .in('child_id', kindIds)
        .lt('created_at', grenze)
      if (error) throw error
      alteBerichte = count ?? 0
    }

    const { count: alteAnmeldungen, error: e3 } = await admin
      .from('online_anmeldungen')
      .select('id', { count: 'exact', head: true })
      .eq('site_id', auth.siteId)
      .in('status', ['abgelehnt', 'archiviert'])
      .lt('created_at', grenze)
    if (e3) throw e3

    return NextResponse.json({
      dryRun: true,
      stichtag3Jahre: grenze.split('T')[0],
      zuLoeschen: {
        kinderArchiviert: alteKinder.length,
        kinder: alteKinder.map(k => ({ id: k.id, name: `${k.first_name} ${k.last_name}`, seit: k.updated_at })),
        tagesberichte: alteBerichte,
        onlineAnmeldungen: alteAnmeldungen ?? 0,
      },
    })
  } catch (err) {
    console.error('[dsgvo/loeschen] Vorschau fehlgeschlagen', err)
    return NextResponse.json({ error: 'Vorschau fehlgeschlagen' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireSiteAdmin()
  if ('error' in auth) return auth.error

  const { confirm } = await req.json().catch(() => ({ confirm: null }))
  if (confirm !== 'DSGVO_LOESCHUNG_BESTAETIGT') {
    return NextResponse.json({ error: 'Bestätigung fehlt' }, { status: 400 })
  }

  const admin = adminClient()
  const grenze = stichtag()
  const geloescht = { kinder: 0, tagesberichte: 0, anmeldungen: 0 }
  const fehler: string[] = []

  try {
    const { alteKinder, kindIds } = await sammeln(admin, auth.siteId, grenze)

    // Kinder anonymisieren (nicht hart löschen – Unfallberichte bleiben erhalten).
    // anonymize_child_data räumt auch Fotos, Einwilligungen und Bildschirmzeit auf.
    for (const k of alteKinder) {
      const { error } = await admin.rpc('anonymize_child_data', { p_child_id: k.id })
      if (error) { fehler.push(`Kind ${k.id}: ${error.message}`); continue }
      const { error: e } = await admin.from('children')
        .update({ status: 'deleted' }).eq('id', k.id).eq('site_id', auth.siteId)
      if (e) { fehler.push(`Kind ${k.id}: ${e.message}`); continue }
      geloescht.kinder++
    }

    if (kindIds.length) {
      const { count, error } = await admin
        .from('daily_reports')
        .delete({ count: 'exact' })
        .in('child_id', kindIds)
        .lt('created_at', grenze)
      if (error) fehler.push(`Tagesberichte: ${error.message}`)
      geloescht.tagesberichte = count ?? 0
    }

    const { count: a, error: e4 } = await admin
      .from('online_anmeldungen')
      .delete({ count: 'exact' })
      .eq('site_id', auth.siteId)
      .in('status', ['abgelehnt', 'archiviert'])
      .lt('created_at', grenze)
    if (e4) fehler.push(`Anmeldungen: ${e4.message}`)
    geloescht.anmeldungen = a ?? 0
  } catch (err) {
    console.error('[dsgvo/loeschen] Löschung fehlgeschlagen', err)
    fehler.push('Abbruch beim Sammeln der Daten')
  }

  const { error: logError } = await admin.from('audit_logs').insert({
    action: 'dsgvo_loeschung',
    user_id: auth.user.id,
    site_id: auth.siteId,
    table_name: 'children',
    changes: { ...geloescht, fehler },
  })
  if (logError) console.error('[dsgvo/loeschen] Audit-Log fehlgeschlagen', logError)

  return NextResponse.json(
    { success: fehler.length === 0, geloescht, fehler },
    { status: fehler.length ? 207 : 200 }
  )
}
