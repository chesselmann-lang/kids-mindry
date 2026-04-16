export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { weekStart: weekStartParam, groupId } = await req.json()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const today = new Date()
  const weekStart = weekStartParam
    ? new Date(weekStartParam + 'T12:00:00')
    : startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd')
  const weekLabel = `KW ${format(weekStart, 'w', { locale: de })} (${format(weekStart, 'd. MMM', { locale: de })} – ${format(weekEnd, 'd. MMM yyyy', { locale: de })})`

  // Fetch attendance stats
  const { data: attendance } = await supabase
    .from('attendance')
    .select('date, child_id, status')
    .eq('site_id', siteId)
    .gte('date', weekStartStr)
    .lte('date', weekEndStr)

  // Fetch daily reports (activities, mood, notes)
  let childIds: string[] = []
  if (groupId) {
    const { data: gc } = await supabase
      .from('children').select('id').eq('group_id', groupId).eq('status', 'active')
    childIds = (gc ?? []).map((c: any) => c.id)
  } else {
    const { data: ac } = await supabase
      .from('children').select('id').eq('site_id', siteId).eq('status', 'active')
    childIds = (ac ?? []).map((c: any) => c.id)
  }

  const { data: reports } = await supabase
    .from('daily_reports')
    .select('report_date, mood, activities, notes')
    .in('child_id', childIds.slice(0, 80))
    .gte('report_date', weekStartStr)
    .lte('report_date', weekEndStr)
    .limit(60)

  // Fetch observations
  const { data: observations } = await supabase
    .from('observations')
    .select('title, description, category')
    .in('child_id', childIds.slice(0, 80))
    .gte('created_at', weekStartStr + 'T00:00:00')
    .lte('created_at', weekEndStr + 'T23:59:59')
    .limit(20)

  // Fetch events this week
  const { data: events } = await supabase
    .from('events')
    .select('title, starts_at')
    .eq('site_id', siteId)
    .gte('starts_at', weekStartStr + 'T00:00:00')
    .lte('starts_at', weekEndStr + 'T23:59:59')
    .order('starts_at')
    .limit(10)

  // Build context
  const presentDays = (attendance ?? []).filter((a: any) => a.status === 'present').length
  const absentDays = (attendance ?? []).filter((a: any) => a.status === 'absent').length

  const activitiesRaw = (reports ?? [])
    .flatMap((r: any) => r.activities ?? [])
    .filter(Boolean)
  const activityCounts: Record<string, number> = {}
  activitiesRaw.forEach((a: string) => { activityCounts[a] = (activityCounts[a] ?? 0) + 1 })
  const topActivities = Object.entries(activityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([a]) => a)

  const moods = (reports ?? []).map((r: any) => r.mood).filter(Boolean)
  const avgMood = moods.length
    ? Math.round(moods.reduce((s: number, m: number) => s + m, 0) / moods.length * 10) / 10
    : null

  const notesSnippets = (reports ?? [])
    .map((r: any) => r.notes)
    .filter(Boolean)
    .slice(0, 10)
    .join(' | ')

  const observationSnippets = (observations ?? [])
    .map((o: any) => `[${o.category ?? 'Allgemein'}] ${o.title}: ${o.description ?? ''}`)
    .slice(0, 10)
    .join('\n')

  const eventList = (events ?? [])
    .map((e: any) => `• ${format(new Date(e.starts_at), 'EEEE', { locale: de })}: ${e.title}`)
    .join('\n') || '– keine besonderen Termine'

  const prompt = `Du bist eine erfahrene Kita-Erzieherin und schreibst einen Wochenbericht für Eltern.

Woche: ${weekLabel}
Anwesenheit: ${presentDays} Tage anwesend, ${absentDays} Tage abwesend
Durchschnittliche Stimmung: ${avgMood !== null ? `${avgMood}/5` : 'keine Daten'}
Häufige Aktivitäten: ${topActivities.join(', ') || 'keine erfasst'}
Besondere Termine:
${eventList}
Beobachtungen (anonymisiert):
${observationSnippets || '– keine'}
Notizen aus Tagesberichten:
${notesSnippets || '– keine'}

Schreibe einen herzlichen, informativen Wochenbericht für Eltern. Antworte NUR mit JSON:
{
  "titel": "Wochenbericht ${weekLabel}",
  "zusammenfassung": "2-3 Sätze Überblick über die Woche",
  "hauptthemen": ["Thema 1", "Thema 2", "Thema 3"],
  "inhalt": "3-4 Absätze als fließender Text, warmherzig und informativ, ohne Kindesnamen",
  "ausblick": "1 Satz was nächste Woche ansteht (optional, sonst leer)"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const entwurf = JSON.parse(clean)
    return NextResponse.json({ entwurf, weekLabel })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
