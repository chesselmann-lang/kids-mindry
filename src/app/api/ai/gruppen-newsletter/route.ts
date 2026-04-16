export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead', 'educator'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { groupId, weekOffset = 0 } = await req.json()
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const targetWeek = subWeeks(new Date(), Math.max(0, weekOffset))
  const weekStart = startOfWeek(targetWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(targetWeek, { weekStartsOn: 1 })
  const fromStr = weekStart.toISOString().split('T')[0]
  const toStr = weekEnd.toISOString().split('T')[0]
  const weekLabel = `${format(weekStart, 'd.', { locale: de })}–${format(weekEnd, 'd. MMMM yyyy', { locale: de })}`

  const [
    { data: group },
    { data: children },
    { data: attendance },
    { data: reports },
    { data: observations },
    { data: events },
    { data: activities },
  ] = await Promise.all([
    supabase.from('groups').select('name, color').eq('id', groupId).single(),
    supabase.from('children').select('id, first_name').eq('group_id', groupId)
      .eq('site_id', siteId).eq('status', 'active'),
    supabase.from('attendance').select('child_id, date, status').eq('site_id', siteId)
      .gte('date', fromStr).lte('date', toStr),
    supabase.from('daily_reports').select('report_date, activities, mood, notes').eq('site_id', siteId)
      .gte('report_date', fromStr).lte('report_date', toStr).limit(20),
    (supabase as any).from('observations').select('content, domain, created_at').eq('site_id', siteId)
      .gte('created_at', `${fromStr}T00:00:00`).lte('created_at', `${toStr}T23:59:59`).limit(10),
    supabase.from('events').select('title, starts_at, description').eq('site_id', siteId)
      .gte('starts_at', `${fromStr}T00:00:00`).lte('starts_at', `${toStr}T23:59:59`),
    (supabase as any).from('group_activities').select('title, activity_date').eq('group_id', groupId)
      .gte('activity_date', fromStr).lte('activity_date', toStr).limit(10),
  ])

  const groupName = (group as any)?.name ?? 'Gruppe'
  const childCount = (children ?? []).length
  const allReports = (reports ?? []) as any[]
  const presentDays = (attendance ?? []).filter((a: any) => a.status === 'present').length
  const activityList = [...new Set(allReports.flatMap((r: any) => r.activities ? [r.activities] : []))].slice(0, 5)
  const moods = allReports.map((r: any) => r.mood).filter(Boolean)
  const dominantMood = moods.length > 0
    ? Object.entries(moods.reduce((acc: Record<string, number>, m: string) => { acc[m] = (acc[m] || 0) + 1; return acc }, {})).sort(([, a], [, b]) => b - a)[0]?.[0]
    : null
  const obsContent = ((observations ?? []) as any[]).map((o: any) => o.content).slice(0, 3).join(' | ')
  const eventTitles = ((events ?? []) as any[]).map((e: any) => e.title).join(', ')
  const activityTitles = ((activities ?? []) as any[]).map((a: any) => a.title).join(', ')

  const moodMap: Record<string, string> = { great: 'ausgezeichnet', good: 'gut', okay: 'durchschnittlich', sad: 'ruhig', sick: 'viele Krankmeldungen' }

  const prompt = `Du bist eine erfahrene Kita-Erzieherin, die einen wöchentlichen Elternbrief für die Gruppe "${groupName}" schreibt.

WOCHE: ${weekLabel}
GRUPPE: ${groupName} (${childCount} Kinder)
Anwesenheitstage gesamt: ${presentDays}
Aktivitäten der Woche: ${activityList.join(', ') || 'diverse Aktivitäten'}
Allgemeine Stimmung: ${dominantMood ? moodMap[dominantMood] || dominantMood : 'positiv'}
Beobachtungen: ${obsContent || 'schöne Gruppenmomente'}
Gruppenaktivitäten: ${activityTitles || ''}
Besondere Ereignisse: ${eventTitles || 'keine besonderen Ereignisse'}

Schreibe einen warmherzigen, professionellen Wochenbrief für Eltern. Format:
- 3–4 Absätze
- Beginne mit: "Liebe Eltern,"
- Rückblick auf die Woche: was war schön, was haben die Kinder erlebt
- 1 pädagogischer Gedanke oder Impuls für Zuhause
- Ausblick auf nächste Woche (falls relevant, sonst weglassen)
- Schluss: "Herzliche Grüße, das Team der ${groupName}"
- Ton: warm, professionell, elternnah
- Länge: ca. 120–180 Wörter`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{ role: 'user', content: prompt }]
  })

  const text = (message.content[0] as { type: string; text: string }).text.trim()
  return NextResponse.json({ text, weekLabel, groupName })
}
