export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInMonths, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { childId } = await req.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const ninetyStr = ninetyDaysAgo.toISOString().split('T')[0]

  const [
    { data: child },
    { data: observations },
    { data: milestones },
    { data: reports },
    { data: attendance },
  ] = await Promise.all([
    supabase.from('children')
      .select('first_name, last_name, date_of_birth, groups(name), care_start_time, care_end_time, care_days')
      .eq('id', childId).single(),
    (supabase as any).from('observations')
      .select('content, category, domain, observed_at')
      .eq('child_id', childId)
      .order('observed_at', { ascending: false }).limit(15),
    (supabase as any).from('milestones')
      .select('title, category, achieved_date')
      .eq('child_id', childId)
      .order('achieved_date', { ascending: false }).limit(12),
    (supabase as any).from('daily_reports')
      .select('mood, notes, activities')
      .eq('child_id', childId)
      .gte('report_date', ninetyStr)
      .order('report_date', { ascending: false }).limit(20),
    supabase.from('attendance')
      .select('status')
      .eq('child_id', childId)
      .gte('date', ninetyStr),
  ])

  if (!child) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const c = child as any
  const ageMonths = c.date_of_birth
    ? differenceInMonths(new Date(), new Date(c.date_of_birth))
    : null
  const ageLabel = ageMonths != null
    ? `${Math.floor(ageMonths / 12)} Jahre ${ageMonths % 12} Monate`
    : 'Alter unbekannt'

  const attArr = (attendance ?? []) as any[]
  const present = attArr.filter((a: any) => a.status === 'present').length
  const sick = attArr.filter((a: any) => a.status === 'absent_sick').length
  const total = attArr.length

  const moodCounts: Record<string, number> = {}
  const repArr = (reports ?? []) as any[]
  repArr.forEach((r: any) => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1 })
  const moodMap: Record<string, string> = { great: 'Super', good: 'Gut', okay: 'Ok', sad: 'Traurig', sick: 'Krank' }
  const moodLine = Object.entries(moodCounts).map(([k, v]) => `${moodMap[k] ?? k} (${v}×)`).join(', ')

  const obsDomains: Record<string, string[]> = {}
  for (const o of (observations ?? []) as any[]) {
    const dom = o.domain ?? o.category ?? 'general'
    if (!obsDomains[dom]) obsDomains[dom] = []
    if (o.content) obsDomains[dom].push(o.content.slice(0, 100))
  }
  const obsLines = Object.entries(obsDomains).map(([dom, items]) =>
    `${dom}: ${items.slice(0, 2).join(' | ')}`
  ).join('\n')

  const mileCats: Record<string, string[]> = {}
  for (const m of (milestones ?? []) as any[]) {
    const cat = m.category ?? 'other'
    if (!mileCats[cat]) mileCats[cat] = []
    mileCats[cat].push(m.title)
  }
  const mileLines = Object.entries(mileCats).map(([c, ts]) => `${c}: ${ts.join(', ')}`).join('\n')

  const prompt = `Du bist eine pädagogische Fachkraft und erstellst einen professionellen Entwicklungsbericht.

Kind: ${c.first_name} ${c.last_name}, ${ageLabel}
Gruppe: ${c.groups?.name ?? '–'}
Berichtszeitraum: letzte 3 Monate

Anwesenheit (${total} erfasste Tage):
- Anwesend: ${present}, Krank: ${sick}

Stimmungsbild: ${moodLine || 'keine Daten'}

Beobachtungen nach Bereich:
${obsLines || '– keine'}

Meilensteine nach Bereich:
${mileLines || '– keine'}

Erstelle einen strukturierten Entwicklungsbericht mit 4-5 Abschnitten (Bereiche wie Soziales, Sprache, Motorik, Kognition, Emotionales). Jeder Abschnitt enthält:
- Beobachtungen und Fortschritte
- Ressourcen des Kindes
- Empfehlungen für zuhause

Sprache: professionell-pädagogisch, positiv, konkret.
Gesamtlänge: ca. 200-300 Wörter.

Antworte NUR mit JSON:
{
  "titel": "Entwicklungsbericht ${c.first_name}",
  "abschnitte": [
    {"bereich": "Bereichsname", "inhalt": "Fließtext 2-4 Sätze"},
    ...
  ],
  "gesamteinschaetzung": "1-2 Sätze Gesamteinschätzung"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 900,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({ ...result, ageLabel, generatedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
