export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, differenceInMonths } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MOOD_LABELS: Record<string, string> = {
  great: 'Super', good: 'Gut', okay: 'Okay', sad: 'Traurig', sick: 'Krank',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { childId } = await req.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const { data: child } = await supabase
    .from('children')
    .select('id, first_name, last_name, birth_date, kita_entry_date')
    .eq('id', childId)
    .single()

  if (!child) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const ageMonths = (child as any).birth_date
    ? differenceInMonths(new Date(), new Date((child as any).birth_date))
    : null
  const ageStr = ageMonths !== null
    ? `${Math.floor(ageMonths / 12)} Jahre ${ageMonths % 12} Monate`
    : 'Alter unbekannt'

  const kitaMonths = (child as any).kita_entry_date
    ? differenceInMonths(new Date(), new Date((child as any).kita_entry_date))
    : null

  const [
    { data: reports },
    { data: observations },
    { data: milestones },
    { data: attendance },
    { data: foerderGoals },
  ] = await Promise.all([
    supabase.from('daily_reports').select('report_date, mood, activities, notes')
      .eq('child_id', childId).order('report_date', { ascending: false }).limit(30),
    supabase.from('observations').select('title, description, category, observation_date')
      .eq('child_id', childId).order('observation_date', { ascending: false }).limit(15),
    supabase.from('child_milestones').select('title, milestone_date, domain')
      .eq('child_id', childId).order('milestone_date', { ascending: false }).limit(12),
    supabase.from('attendance').select('date, status')
      .eq('child_id', childId).order('date', { ascending: false }).limit(30),
    supabase.from('foerder_goals').select('title, status, created_at')
      .eq('child_id', childId).order('created_at', { ascending: false }).limit(8),
  ])

  // Compute stats
  const presentDays = (attendance ?? []).filter((a: any) => a.status === 'present').length
  const absentDays = (attendance ?? []).filter((a: any) => a.status !== 'present').length
  const attendanceRate = (attendance ?? []).length > 0
    ? Math.round(presentDays / (attendance ?? []).length * 100)
    : null

  const moodCounts: Record<string, number> = {}
  const allActivities: string[] = []
  for (const r of (reports ?? [])) {
    if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1
    if (Array.isArray(r.activities)) allActivities.push(...r.activities)
  }
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const actCounts: Record<string, number> = {}
  allActivities.forEach(a => { actCounts[a] = (actCounts[a] ?? 0) + 1 })
  const topActivities = Object.entries(actCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a]) => a)

  const observationSummary = (observations ?? []).slice(0, 8)
    .map((o: any) => `[${o.category ?? 'Allgemein'}] ${o.title}`)
    .join(', ')

  const milestonesStr = (milestones ?? []).slice(0, 6)
    .map((m: any) => `${m.title} (${m.domain ?? 'Allgemein'})`)
    .join(', ')

  const foerderStr = (foerderGoals ?? [])
    .filter((g: any) => g.status !== 'done')
    .slice(0, 4)
    .map((g: any) => g.title)
    .join(', ')

  const prompt = `Du bist Kita-Erzieherin und analysierst den Entwicklungsverlauf von ${(child as any).first_name}.

Alter: ${ageStr}${kitaMonths ? ` · ${kitaMonths} Monate in der Kita` : ''}
Anwesenheitsrate: ${attendanceRate !== null ? `${attendanceRate}% (${presentDays} Tage anwesend)` : 'keine Daten'}
Häufigste Stimmung: ${topMood ? MOOD_LABELS[topMood] : 'keine Daten'}
Lieblingsaktivitäten: ${topActivities.join(', ') || 'keine erfasst'}
Aktuelle Beobachtungen: ${observationSummary || 'keine'}
Meilensteine: ${milestonesStr || 'keine erfasst'}
Laufende Förderziele: ${foerderStr || 'keine'}

Schreibe eine einfühlsame, professionelle Verlaufsanalyse für das Team (nicht für Eltern). Antworte NUR mit JSON:
{
  "kurzbild": "1-2 Sätze über ${(child as any).first_name}s aktuelle Situation und Stärken",
  "bereiche": [
    {"bereich": "Bereichsname", "einschaetzung": "positiv"|"neutral"|"aufmerksamkeit", "text": "1 Satz"},
    ...
  ],
  "empfehlung": "1 konkreter nächster Schritt oder Beobachtungsschwerpunkt"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      kurzbild: result.kurzbild ?? '',
      bereiche: result.bereiche ?? [],
      empfehlung: result.empfehlung ?? '',
      childName: (child as any).first_name,
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
