export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval, getDay } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Last week
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const lastWeekEnd   = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const lwFrom = lastWeekStart.toISOString().split('T')[0]
  const lwTo   = lastWeekEnd.toISOString().split('T')[0]
  const weekLabel = `${format(lastWeekStart, 'd. MMM', { locale: de })} – ${format(lastWeekEnd, 'd. MMM', { locale: de })}`

  // Work days last week
  const workdays = eachDayOfInterval({ start: lastWeekStart, end: lastWeekEnd })
    .filter(d => { const wd = getDay(d); return wd >= 1 && wd <= 5 }).length

  const [
    { data: children },
    { data: attendance },
    { data: observations },
    { data: reports },
    { data: incidents },
    { data: milestones },
    { data: events },
  ] = await Promise.all([
    supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('attendance').select('status')
      .eq('site_id', siteId).gte('date', lwFrom).lte('date', lwTo),
    supabase.from('observations').select('content, category')
      .eq('site_id', siteId)
      .gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
    supabase.from('daily_reports').select('mood, activities, notes')
      .in('child_id', []) // filled below
      .gte('report_date', lwFrom).lte('report_date', lwTo),
    supabase.from('incidents').select('title, severity')
      .eq('site_id', siteId)
      .gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
    (supabase as any).from('milestones').select('title')
      .gte('achieved_at', lwFrom).lte('achieved_at', lwTo).limit(10),
    supabase.from('events').select('title')
      .eq('site_id', siteId)
      .gte('starts_at', lastWeekStart.toISOString()).lte('starts_at', lastWeekEnd.toISOString()),
  ])

  const totalChildren = (children ?? []).length
  const childIds = (children ?? []).map((c: any) => c.id)

  // Fetch reports for real children
  let weekReports: any[] = []
  if (childIds.length > 0) {
    const { data: r } = await supabase.from('daily_reports')
      .select('mood, activities, notes')
      .in('child_id', childIds).gte('report_date', lwFrom).lte('report_date', lwTo)
    weekReports = r ?? []
  }

  const att = attendance ?? []
  const presentDays = att.filter((a: any) => a.status === 'present').length
  const sickDays = att.filter((a: any) => a.status === 'absent_sick').length
  const theoreticalDays = totalChildren * workdays
  const attRate = theoreticalDays > 0 ? Math.round((presentDays / theoreticalDays) * 100) : 0

  const moodCounts: Record<string, number> = {}
  weekReports.forEach((r: any) => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1 })
  const moodSummary = Object.entries(moodCounts).map(([m, c]) => `${m}: ${c}×`).join(', ')

  const activitiesList = [...new Set(weekReports.filter((r: any) => r.activities).map((r: any) => r.activities?.slice(0, 50)))].slice(0, 4).join(', ')

  const obsList = (observations as any[] ?? []).slice(0, 5).map((o: any) => `• ${o.content?.slice(0, 80)}`).join('\n')
  const incidentList = (incidents as any[] ?? []).map((i: any) => `• ${i.title}${i.severity === 'high' ? ' [ERNST]' : ''}`).join('\n')
  const mileList = (milestones as any[] ?? []).map((m: any) => `• ${m.title}`).join('\n')
  const eventList = (events as any[] ?? []).map((e: any) => e.title).join(', ')

  const prompt = `Erstelle eine kurze Wochenanalyse für das Kita-Leitungsteam.

Woche: ${weekLabel}
Kinder aktiv: ${totalChildren}, Werktage: ${workdays}
Anwesenheitsquote: ${attRate}% (${presentDays}/${theoreticalDays} Tage)
Kranktage gesamt: ${sickDays}
Stimmungsverteilung (Tagesberichte): ${moodSummary || '– keine'}
Aktivitäten: ${activitiesList || '– keine'}
Veranstaltungen: ${eventList || '– keine'}
Neue Meilensteine:
${mileList || '– keine'}
Beobachtungen:
${obsList || '– keine'}
Vorfälle:
${incidentList || '– keine'}

Analysiere die Woche und gib 3-4 prägnante Punkte. Antworte NUR mit einem JSON-Array:
[
  {"typ": "positiv"|"hinweis"|"warnung", "titel": "Kurztitel", "text": "1-2 Sätze"},
  ...
]`

  let insights: any[] = []
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    insights = JSON.parse(clean)
  } catch {
    insights = []
  }

  return NextResponse.json({ insights, weekLabel })
}
