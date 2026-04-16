export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MOOD_LABELS: Record<string, string> = {
  great: 'Super',
  good: 'Gut',
  okay: 'Okay',
  sad: 'Traurig',
  sick: 'Krank',
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

  // Fetch today's reports
  const { data: children } = await supabase
    .from('children')
    .select('id, first_name')
    .eq('site_id', siteId)
    .eq('status', 'active')

  const childIds = (children ?? []).map((c: any) => c.id)

  const { data: reports } = await supabase
    .from('daily_reports')
    .select('child_id, mood, activities, notes, sleep_minutes')
    .in('child_id', childIds.slice(0, 80))
    .eq('report_date', today)

  if (!reports || reports.length === 0) {
    return NextResponse.json({
      hinweise: [],
      message: 'Noch keine Tagesberichte für heute erfasst.',
    })
  }

  // Build stats
  const moodCounts: Record<string, number> = {}
  const allActivities: string[] = []
  const noteSnippets: string[] = []
  let totalSleepMin = 0
  let sleepCount = 0

  for (const r of reports) {
    if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1
    if (Array.isArray(r.activities)) allActivities.push(...r.activities)
    if (r.notes) noteSnippets.push(r.notes.slice(0, 80))
    if (r.sleep_minutes) { totalSleepMin += r.sleep_minutes; sleepCount++ }
  }

  const moodSummary = Object.entries(moodCounts)
    .map(([k, v]) => `${MOOD_LABELS[k] ?? k}: ${v}`)
    .join(', ')

  const actCounts: Record<string, number> = {}
  allActivities.forEach(a => { actCounts[a] = (actCounts[a] ?? 0) + 1 })
  const topActivities = Object.entries(actCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([a, c]) => `${a} (${c}x)`)
    .join(', ')

  const avgSleep = sleepCount > 0
    ? `Ø ${Math.round(totalSleepMin / sleepCount)} Min`
    : 'keine Daten'

  const prompt = `Du bist Kita-Leiterin und analysierst die heutigen Tagesberichte.

Datum: ${todayLabel}
Berichte: ${reports.length} von ${childIds.length} Kindern ausgefüllt
Stimmungen: ${moodSummary || 'keine Daten'}
Top-Aktivitäten: ${topActivities || 'keine erfasst'}
Schlaf (Mittagsschlaf): ${avgSleep}
Ausgewählte Notizen: ${noteSnippets.slice(0, 5).join(' | ') || 'keine'}

Gib einen kurzen, positiven Gruppenüberblick für das Kita-Team. Antworte NUR mit JSON:
{
  "zusammenfassung": "1-2 Sätze über den Stimmungsbild und die Aktivitäten des Tages",
  "highlights": ["Highlight 1", "Highlight 2"],
  "hinweis": "1 Satz konkreter Hinweis oder Empfehlung für morgen (oder leer wenn nichts)"
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
      zusammenfassung: result.zusammenfassung ?? '',
      highlights: result.highlights ?? [],
      hinweis: result.hinweis ?? '',
      stats: {
        total: childIds.length,
        done: reports.length,
        moodCounts,
      },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
