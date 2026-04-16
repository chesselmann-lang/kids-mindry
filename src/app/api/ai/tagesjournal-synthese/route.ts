export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MOOD_LABELS: Record<string, string> = {
  great: '😄 Super', good: '🙂 Gut', okay: '😐 Okay', sad: '😢 Traurig', sick: '🤒 Krank',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]
  const todayLabel = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })

  // Fetch all data for today
  const { data: children } = await supabase
    .from('children')
    .select('id, first_name')
    .eq('site_id', siteId)
    .eq('status', 'active')

  const childIds = (children ?? []).map((c: any) => c.id)
  const totalChildren = childIds.length

  const [
    { data: attendance },
    { data: reports },
    { data: events },
    { data: sleep },
    { data: incidents },
  ] = await Promise.all([
    supabase.from('attendance')
      .select('child_id, status')
      .eq('site_id', siteId)
      .eq('date', today),
    supabase.from('daily_reports')
      .select('mood, activities, notes')
      .in('child_id', childIds.slice(0, 80))
      .eq('report_date', today),
    supabase.from('events')
      .select('title, starts_at')
      .eq('site_id', siteId)
      .gte('starts_at', today + 'T00:00:00')
      .lte('starts_at', today + 'T23:59:59'),
    supabase.from('sleep_records')
      .select('duration_minutes, quality')
      .in('child_id', childIds.slice(0, 80))
      .eq('sleep_date', today),
    supabase.from('incidents')
      .select('severity, description')
      .eq('site_id', siteId)
      .gte('occurred_at', today + 'T00:00:00')
      .lte('occurred_at', today + 'T23:59:59')
      .limit(5),
  ])

  const presentCount = (attendance ?? []).filter((a: any) => a.status === 'present').length

  const moodCounts: Record<string, number> = {}
  const allActivities: string[] = []
  const notes: string[] = []
  for (const r of (reports ?? [])) {
    if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1
    if (Array.isArray(r.activities)) allActivities.push(...r.activities)
    if (r.notes) notes.push(r.notes.slice(0, 80))
  }

  const moodLine = Object.entries(moodCounts)
    .map(([k, v]) => `${MOOD_LABELS[k] ?? k}: ${v}`)
    .join(', ')

  const actCounts: Record<string, number> = {}
  allActivities.forEach(a => { actCounts[a] = (actCounts[a] ?? 0) + 1 })
  const topActs = Object.entries(actCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([a]) => a)
    .join(', ')

  const avgSleepMin = (sleep ?? []).length > 0
    ? Math.round((sleep ?? []).reduce((s: number, r: any) => s + (r.duration_minutes ?? 0), 0) / (sleep ?? []).length)
    : null

  const eventList = (events ?? []).map((e: any) => e.title).join(', ') || '– keine'
  const incidentCount = (incidents ?? []).length
  const highSeverity = (incidents ?? []).filter((i: any) => i.severity === 'high').length

  const prompt = `Du bist Kita-Erzieherin und schreibst eine Tages-Synthese für das Team.

Datum: ${todayLabel}
Kinder: ${presentCount} anwesend von ${totalChildren} gesamt
Tagesberichte erfasst: ${(reports ?? []).length}
Stimmungen: ${moodLine || 'keine Daten'}
Top-Aktivitäten: ${topActs || 'keine'}
Mittagsschlaf: ${avgSleepMin ? `Ø ${avgSleepMin} Min` : 'keine Daten'}
Termine heute: ${eventList}
Vorkommnisse: ${incidentCount}${highSeverity > 0 ? ` (davon ${highSeverity} schwerwiegend)` : ''}
Ausgewählte Notizen: ${notes.slice(0, 5).join(' | ') || 'keine'}

Schreibe eine warme, informative Tages-Synthese für das Kita-Team (wird nicht an Eltern gesendet). Antworte NUR mit JSON:
{
  "titel": "Kurzüberschrift für den Tag",
  "synthese": "2-3 Sätze die den Tag zusammenfassen",
  "stimmung": "positiv"|"neutral"|"gemischt",
  "empfehlung": "1 konkreter Tipp für morgen oder den Feierabend (z.B. Dokumentation, Rücksprache)"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      titel: result.titel ?? '',
      synthese: result.synthese ?? '',
      stimmung: result.stimmung ?? 'neutral',
      empfehlung: result.empfehlung ?? '',
      stats: { present: presentCount, total: totalChildren, reports: (reports ?? []).length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
