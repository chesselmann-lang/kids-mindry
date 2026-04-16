export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { shift = 'morning', groupId = null } = await req.json()

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]
  const dayLabel = format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })

  // Fetch all today's data in parallel
  let attQuery = supabase.from('attendance')
    .select('status, check_in_at, check_out_at, children(first_name, last_name)')
    .eq('site_id', siteId).eq('date', today)

  let reportQuery = supabase.from('daily_reports')
    .select('mood, notes, activities, sleep_minutes, children(first_name)')
    .eq('report_date', today)

  let incidentQuery = (supabase as any).from('incidents')
    .select('title, description, severity, children(first_name)')
    .eq('site_id', siteId)
    .gte('created_at', today + 'T00:00:00')
    .lte('created_at', today + 'T23:59:59')

  const [
    { data: attendance },
    { data: children },
    { data: incidents },
    { data: quickNotes },
  ] = await Promise.all([
    attQuery,
    supabase.from('children')
      .select('id, first_name, last_name')
      .eq('site_id', siteId).eq('status', 'active'),
    incidentQuery,
    (supabase as any).from('quick_notes')
      .select('content, created_at')
      .eq('site_id', siteId)
      .gte('created_at', today + 'T00:00:00')
      .order('created_at', { ascending: false }).limit(5),
  ])

  // Also fetch daily reports for present children
  const childIds = (children ?? []).map((c: any) => c.id)
  let reports: any[] = []
  if (childIds.length > 0) {
    const { data: r } = await reportQuery.in('child_id', childIds)
    reports = r ?? []
  }

  const att = attendance ?? []
  const presentList = att.filter((a: any) => a.status === 'present')
  const sickList = att.filter((a: any) => a.status === 'absent_sick')
  const presentCount = presentList.length
  const totalChildren = (children ?? []).length

  const moodMap: Record<string, string> = {
    great: 'sehr gut', good: 'gut', okay: 'okay', sad: 'besorgniserregend', sick: 'krank',
  }

  const moodSummary = reports
    .filter((r: any) => r.mood)
    .map((r: any) => `${(r as any).children?.first_name}: ${moodMap[r.mood] ?? r.mood}`)
    .join(', ')

  const activitiesList = [...new Set(reports.filter((r: any) => r.activities).map((r: any) => r.activities))].slice(0, 4).join(', ')

  const notesList = (quickNotes as any[] ?? []).map((n: any) => `• ${n.content}`).join('\n')

  const incidentList = (incidents as any[] ?? []).map((i: any) =>
    `• ${i.children?.first_name ?? 'Allgemein'}: ${i.title}${i.severity === 'high' ? ' [DRINGEND]' : ''}`
  ).join('\n')

  const sickNames = sickList.map((a: any) => (a as any).children?.first_name).filter(Boolean).join(', ')

  const shiftLabels: Record<string, string> = {
    morning: 'Frühdienst',
    midday: 'Mittagsdienst',
    afternoon: 'Spätdienst',
  }
  const shiftLabel = shiftLabels[shift] ?? shift

  const prompt = `Erstelle eine professionelle Übergabenotiz für die Kita.

Datum: ${dayLabel}
Dienst: ${shiftLabel}
Verfasser: ${(profile as any)?.full_name ?? 'Unbekannt'}
Anwesende Kinder: ${presentCount} von ${totalChildren}
Krankmeldungen: ${sickNames || 'keine'}

Stimmungen heute:
${moodSummary || '– keine Berichte'}

Aktivitäten des Tages:
${activitiesList || '– keine Einträge'}

Vorfälle:
${incidentList || '– keine'}

Notizen aus dem Tagesjournal:
${notesList || '– keine'}

Schreibe eine strukturierte Übergabenotiz (4-6 Sätze) auf Deutsch:
- Beginne mit dem Überblick: Anwesenheit und Gesamtstimmung der Gruppe
- Erwähne besondere Ereignisse, Aktivitäten oder Beobachtungen
- Nenne Krankmeldungen oder auffällige Kinder namentlich (nur Vornamen)
- Erwähne Vorfälle falls vorhanden klar und sachlich
- Schließe mit offenen Aufgaben oder wichtigen Hinweisen für den nächsten Dienst
- Sachlicher, professioneller Ton

Antworte NUR mit dem Übergabetext (keine Überschrift, kein JSON).`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = (response.content[0] as any).text?.trim() ?? ''
    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
