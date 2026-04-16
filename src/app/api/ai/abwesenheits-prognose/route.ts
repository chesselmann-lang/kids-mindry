export const revalidate = 900

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { subDays, format, eachDayOfInterval, getDay, addDays } from 'date-fns'
import { de } from 'date-fns/locale'



export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const since60 = subDays(today, 60).toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  // Next 10 working days
  const nextWorkDays: string[] = []
  let d = addDays(today, 1)
  while (nextWorkDays.length < 10) {
    const wd = getDay(d)
    if (wd >= 1 && wd <= 5) nextWorkDays.push(d.toISOString().split('T')[0])
    d = addDays(d, 1)
  }

  const [
    { data: children },
    { data: attendance },
    { data: plannedAbsences },
    { data: events },
  ] = await Promise.all([
    supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('attendance').select('child_id, date, status').eq('site_id', siteId)
      .gte('date', since60).lte('date', todayStr),
    supabase.from('absence_requests').select('child_id, start_date, end_date, reason')
      .eq('site_id', siteId).gte('start_date', todayStr).eq('status', 'approved'),
    supabase.from('events').select('title, starts_at, description').eq('site_id', siteId)
      .gte('starts_at', today.toISOString()).lte('starts_at', nextWorkDays[nextWorkDays.length - 1] + 'T23:59:59'),
  ])

  const totalChildren = (children ?? []).length
  if (totalChildren === 0) return NextResponse.json({ error: 'Keine Kinder' }, { status: 400 })

  const allAtt = (attendance ?? []) as any[]

  // Calculate historical patterns by weekday
  const weekdayStats: Record<number, { present: number; total: number }> = {}
  for (let wd = 1; wd <= 5; wd++) {
    weekdayStats[wd] = { present: 0, total: 0 }
  }

  // Count by weekday
  const dayMap: Record<string, Record<string, string>> = {}
  for (const a of allAtt) {
    if (!dayMap[a.date]) dayMap[a.date] = {}
    dayMap[a.date][a.child_id] = a.status
  }

  for (const [dateStr, records] of Object.entries(dayMap)) {
    const date = new Date(dateStr)
    const wd = getDay(date)
    if (wd < 1 || wd > 5) continue
    const presentCount = Object.values(records).filter(s => s === 'present').length
    weekdayStats[wd].present += presentCount
    weekdayStats[wd].total += totalChildren
  }

  const weekdayRates: Record<string, number> = {}
  const dayNames = ['', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
  for (let wd = 1; wd <= 5; wd++) {
    const stats = weekdayStats[wd]
    weekdayRates[dayNames[wd]] = stats.total > 0 ? Math.round(stats.present / stats.total * 100) : 75
  }

  // Planned absences next 10 days
  const plannedCount = ((plannedAbsences ?? []) as any[]).length
  const upcomingEvents = ((events ?? []) as any[]).map(e => e.title).join(', ')

  const currentMonth = format(today, 'MMMM', { locale: de })
  const seasonAbsenceNote = ['Dezember', 'Januar', 'Februar', 'März'].includes(currentMonth)
    ? 'Erhöhtes Krankheitsrisiko (Erkältungszeit)'
    : ['Juli', 'August'].includes(currentMonth)
    ? 'Haupturlaubszeit, viele Ferien-Abwesenheiten erwartet'
    : 'Normale Saison'

  const prompt = `Du bist Experte für Kita-Planung. Erstelle eine Abwesenheitsprognose für die nächsten 2 Wochen.

AKTUELLE SITUATION:
Kita: ${totalChildren} aktive Kinder
Heutige Anwesenheitsraten nach Wochentag (historisch):
${Object.entries(weekdayRates).map(([tag, rate]) => `- ${tag}: ${rate}%`).join('\n')}
Bereits geplante Abwesenheiten: ${plannedCount}
Saison: ${seasonAbsenceNote}
Bevorstehende Events: ${upcomingEvents || 'keine'}

Erstelle EXAKT dieses JSON:
{
  "prognose_gesamt": "...",
  "erwartete_anwesenheit": [0-100],
  "risiko": "niedrig"|"mittel"|"hoch",
  "wochentage": [
    { "tag": "Montag", "erwartung": [0-100], "hinweis": "..." },
    { "tag": "Dienstag", "erwartung": [0-100], "hinweis": "..." },
    { "tag": "Mittwoch", "erwartung": [0-100], "hinweis": "..." },
    { "tag": "Donnerstag", "erwartung": [0-100], "hinweis": "..." },
    { "tag": "Freitag", "erwartung": [0-100], "hinweis": "..." }
  ],
  "empfehlungen": ["...", "...", "..."],
  "personalplanung": "..."
}

- Prognose_gesamt: kurze Einschätzung der nächsten 2 Wochen (1–2 Sätze)
- Erwartete_anwesenheit: Durchschnittswert in Prozent
- Wochentage: Erwartete Anwesenheit basierend auf historischen Werten und Saisonkorrekturen
- 3 konkrete Empfehlungen für die Personalplanung
- Personalplanung: kurze Staffing-Empfehlung (1 Satz)`

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const result = JSON.parse(raw)
  return NextResponse.json({ ...result, meta: { totalChildren, plannedCount, weekdayRates } })
}
