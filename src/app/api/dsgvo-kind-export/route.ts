/**
 * DSGVO Art. 20 – Vollständiger Datenexport für ein Kind (Admin)
 * Gibt eine ZIP-Datei zurück, die alle personenbezogenen Daten des Kindes enthält.
 *
 * GET /api/dsgvo-kind-export?childId=<uuid>
 * Berechtigung: admin oder group_lead
 */
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { strToU8, zip as fflateZip } from 'fflate'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

function toJsonBuffer(data: unknown): Uint8Array {
  return strToU8(JSON.stringify(data, null, 2))
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  const role = (profile as any)?.role ?? ''
  if (!['admin', 'group_lead'].includes(role)) {
    return NextResponse.json({ error: 'Nur Admins und Gruppenleiter können Daten exportieren.' }, { status: 403 })
  }

  const childId = req.nextUrl.searchParams.get('childId')
  if (!childId || !/^[0-9a-f-]{36}$/i.test(childId)) {
    return NextResponse.json({ error: 'childId (UUID) fehlt oder ungültig' }, { status: 400 })
  }

  const siteId = (profile as any)?.site_id as string | null
  if (!siteId) {
    return NextResponse.json({ error: 'Keine Einrichtung zugeordnet.' }, { status: 403 })
  }

  // Site-Isolation: Kind muss zur eigenen Kita gehören
  const { data: child, error: childErr } = await supabase
    .from('children')
    .select('*, groups(name)')
    .eq('id', childId)
    .eq('site_id', siteId)
    .single()

  if (childErr || !child) {
    return NextResponse.json({ error: 'Kind nicht gefunden oder kein Zugriff.' }, { status: 404 })
  }

  const c = child as any
  const childName = `${c.first_name}_${c.last_name}`.replace(/\s+/g, '_')

  // Alle relevanten Tabellen parallel laden – vollständige Zeilen (Art. 15/20 DSGVO)
  const db = supabase as any
  const results = await Promise.all([
    db.from('attendance').select('*').eq('child_id', childId).order('date'),
    db.from('daily_reports').select('*').eq('child_id', childId).order('report_date'),
    db.from('milestones').select('*').eq('child_id', childId).order('achieved_date'),
    db.from('observations').select('*').eq('child_id', childId).order('created_at'),
    db.from('guardians').select('*').eq('child_id', childId),
    db.from('parent_meetings').select('*').eq('child_id', childId).order('meeting_date'),
    db.from('foerderplaene').select('*').eq('child_id', childId).order('created_at'),
    db.from('health_records').select('*').eq('child_id', childId).order('record_date'),
    db.from('portfolio_entries').select('*').eq('child_id', childId).order('created_at'),
  ])
  const failed = results.find((r: any) => r.error)
  if (failed) {
    // Lieber abbrechen als einen unvollständigen Export ausliefern
    console.error('[dsgvo-kind-export] Abfrage fehlgeschlagen', failed.error)
    return NextResponse.json({ error: 'Export unvollständig – bitte Support kontaktieren.' }, { status: 500 })
  }
  const [
    attendance, reports, milestones, observations, guardians,
    meetings, foerderplaene, healthRecords, portfolio,
  ] = results.map((r: any) => (r.data ?? []) as any[])

  const exportedAt = new Date().toISOString()
  const dateLabel = format(new Date(), 'dd.MM.yyyy', { locale: de })

  // README im ZIP
  const readme = `DSGVO-Datenexport gemäß Art. 20 DSGVO
======================================
Exportiert am: ${dateLabel}
Kind: ${c.first_name} ${c.last_name}
Kita-ID: ${siteId}
Exportiert von: ${user.email}

Enthaltene Dateien
------------------
kind.json           - Stammdaten des Kindes
anwesenheit.json    - Anwesenheitsprotokoll
tagesberichte.json  - Tagesberichte (Pädagogen-Notizen)
meilensteine.json   - Entwicklungsmeilensteine
beobachtungen.json  - Pädagogische Beobachtungen
erziehungsberechtigte.json - Erziehungsberechtigte
elterngespraeche.json - Elterngespräch-Protokolle
foerderplaene.json  - Förderpläne
gesundheit.json     - Gesundheitsdaten
portfolio.json      - Portfolio-Einträge

Hinweis: Dieser Export enthält alle gespeicherten personenbezogenen Daten des Kindes.
Bei Fragen wenden Sie sich an: datenschutz@mindry.de
`

  // ZIP zusammenbauen
  const files: Record<string, Uint8Array> = {
    'README.txt': strToU8(readme),
    'kind.json': toJsonBuffer({
      exportedAt,
      gruppe: c.groups?.name ?? null,
      stammdaten: Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'groups')),
    }),
    'anwesenheit.json': toJsonBuffer({ exportedAt, eintraege: attendance }),
    'tagesberichte.json': toJsonBuffer({ exportedAt, eintraege: reports }),
    'meilensteine.json': toJsonBuffer({ exportedAt, eintraege: milestones }),
    'beobachtungen.json': toJsonBuffer({ exportedAt, eintraege: observations }),
    'erziehungsberechtigte.json': toJsonBuffer({ exportedAt, eintraege: guardians.map((g: any) => {
      // E-Mail + Telefon aus Datenschutzgründen nur für Admin
      if (role === 'admin') return g
      const { email: _e, phone: _p, ...rest } = g
      return rest
    }) }),
    'elterngespraeche.json': toJsonBuffer({ exportedAt, eintraege: meetings }),
    'foerderplaene.json': toJsonBuffer({ exportedAt, eintraege: foerderplaene }),
    'gesundheit.json': toJsonBuffer({ exportedAt, eintraege: healthRecords }),
    'portfolio.json': toJsonBuffer({ exportedAt, eintraege: portfolio }),
  }

  // ZIP erstellen (synchron mit fflate)
  const zipBuffer = await new Promise<Uint8Array>((resolve, reject) => {
    fflateZip(files, { level: 6 }, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  // Audit-Log
  const { error: logError } = await supabase.from('audit_logs').insert({
    site_id: siteId,
    user_id: user.id,
    action: 'dsgvo_kind_export',
    table_name: 'children',
    record_id: childId,
    changes: { exported_at: exportedAt, exported_by_role: role },
  })
  if (logError) console.error('[dsgvo-kind-export] Audit-Log fehlgeschlagen', logError)

  const filename = `dsgvo_export_${childName}_${dateLabel.replace(/\./g, '-')}.zip`

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(zipBuffer.length),
    },
  })
}
