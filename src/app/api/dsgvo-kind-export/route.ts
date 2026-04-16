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

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

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

  // Alle relevanten Tabellen parallel laden
  const [
    { data: attendance },
    { data: reports },
    { data: milestones },
    { data: observations },
    { data: guardians },
    { data: meetings },
    { data: foerderplaene },
    { data: sismik },
    { data: healthRecords },
    { data: portfolio },
  ] = await Promise.all([
    supabase.from('attendance').select('date, status, notes').eq('child_id', childId).order('date'),
    supabase.from('daily_reports').select('report_date, mood, activities, notes, sleep_hours, sleep_minutes, breakfast, lunch, snack').eq('child_id', childId).order('report_date'),
    (supabase as any).from('milestones').select('title, category, achieved_at, description, notes').eq('child_id', childId).order('achieved_at'),
    (supabase as any).from('observations').select('content, domain, created_at, created_by').eq('child_id', childId).order('created_at'),
    supabase.from('guardians').select('relationship, is_primary, can_pickup, emergency_contact, profiles(full_name, email, phone)').eq('child_id', childId),
    (supabase as any).from('parent_meetings').select('meeting_date, topics, agreements, next_meeting, attendees').eq('child_id', childId).order('meeting_date'),
    (supabase as any).from('foerderplaene').select('title, ziele, massnahmen, status, created_at, updated_at').eq('child_id', childId).order('created_at'),
    (supabase as any).from('sismik_assessments').select('score_total, scores, notes, completed_at').eq('child_id', childId).order('completed_at'),
    (supabase as any).from('health_records').select('type, value, notes, recorded_at').eq('child_id', childId).order('recorded_at'),
    (supabase as any).from('portfolio_entries').select('title, content, media_url, category, created_at').eq('child_id', childId).order('created_at'),
  ])

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
sismik.json         - SISMIK-Bewertungen
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
      stammdaten: {
        vorname: c.first_name,
        nachname: c.last_name,
        geburtsdatum: c.date_of_birth,
        geschlecht: c.gender,
        gruppe: c.groups?.name ?? null,
        aufnahmedatum: c.enrollment_date ?? null,
        status: c.status,
        allergien: c.allergies ?? null,
        medizinische_hinweise: c.medical_notes ?? null,
      },
    }),
    'anwesenheit.json': toJsonBuffer({ exportedAt, eintraege: attendance ?? [] }),
    'tagesberichte.json': toJsonBuffer({ exportedAt, eintraege: reports ?? [] }),
    'meilensteine.json': toJsonBuffer({ exportedAt, eintraege: milestones ?? [] }),
    'beobachtungen.json': toJsonBuffer({ exportedAt, eintraege: observations ?? [] }),
    'erziehungsberechtigte.json': toJsonBuffer({ exportedAt, eintraege: (guardians ?? []).map((g: any) => ({
      beziehung: g.relationship,
      hauptkontakt: g.is_primary,
      abholberechtigt: g.can_pickup,
      notfallkontakt: g.emergency_contact,
      name: g.profiles?.full_name ?? null,
      // E-Mail + Telefon aus Datenschutzgründen nur für Admin
      ...(role === 'admin' ? { email: g.profiles?.email, telefon: g.profiles?.phone } : {}),
    })) }),
    'elterngespraeche.json': toJsonBuffer({ exportedAt, eintraege: meetings ?? [] }),
    'foerderplaene.json': toJsonBuffer({ exportedAt, eintraege: foerderplaene ?? [] }),
    'sismik.json': toJsonBuffer({ exportedAt, eintraege: sismik ?? [] }),
    'gesundheit.json': toJsonBuffer({ exportedAt, eintraege: healthRecords ?? [] }),
    'portfolio.json': toJsonBuffer({ exportedAt, eintraege: portfolio ?? [] }),
  }

  // ZIP erstellen (synchron mit fflate)
  const zipBuffer = await new Promise<Uint8Array>((resolve, reject) => {
    fflateZip(files, { level: 6 }, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  // Audit-Log
  supabase.from('audit_logs').insert({
    site_id: siteId,
    user_id: user.id,
    action: 'dsgvo_kind_export',
    table_name: 'children',
    record_id: childId,
    changes: { exported_at: exportedAt, exported_by_role: role },
  }).then(() => {}).catch(() => {})

  const filename = `dsgvo_export_${childName}_${dateLabel.replace(/\./g, '-')}.zip`

  return new NextResponse(zipBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(zipBuffer.length),
    },
  })
}
