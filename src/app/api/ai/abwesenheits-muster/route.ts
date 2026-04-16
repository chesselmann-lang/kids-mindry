export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { subDays, format, getDay } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const since = subDays(new Date(), 30).toISOString().split('T')[0]

  // Get active children for this site
  const { data: activeChildren } = await supabase
    .from('children').select('id').eq('site_id', siteId).eq('status', 'active')
  const siteChildIds = new Set((activeChildren ?? []).map((c: any) => c.id))

  const { data: absences } = await supabase
    .from('attendance')
    .select('child_id, date, status, children(first_name, last_name)')
    .neq('status', 'present')
    .gte('date', since)
    .order('date', { ascending: false })

  const filtered = (absences ?? []).filter((a: any) => siteChildIds.has(a.child_id))

  if (filtered.length === 0) {
    return NextResponse.json({
      message: 'Keine Abwesenheiten in den letzten 30 Tagen.',
      hinweise: [],
      stats: { total: 0, sick: 0, vacation: 0 },
    })
  }

  const sick = filtered.filter((a: any) => a.status === 'absent_sick').length
  const vacation = filtered.filter((a: any) => a.status === 'absent_vacation').length
  const other = filtered.filter((a: any) => a.status === 'absent_other').length

  // Day-of-week distribution
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  const dayDist: Record<number, number> = {}
  for (const a of filtered as any[]) {
    const d = getDay(new Date(a.date + 'T12:00:00'))
    dayDist[d] = (dayDist[d] ?? 0) + 1
  }
  const topDay = Object.entries(dayDist).sort((a, b) => Number(b[1]) - Number(a[1]))[0]
  const topDayStr = topDay ? `${dayNames[Number(topDay[0])]} (${topDay[1]}x)` : 'k.A.'

  // Child frequency
  const childCounts: Record<string, number> = {}
  for (const a of filtered as any[]) {
    const name = `${(a.children as any)?.first_name ?? ''} ${(a.children as any)?.last_name ?? ''}`.trim()
    if (name) childCounts[name] = (childCounts[name] ?? 0) + 1
  }
  const frequentAbsent = Object.entries(childCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n, c]) => `${n}: ${c}x`)
    .join(', ')

  const prompt = `Du bist Kita-Leiterin. Analysiere die Abwesenheitsmuster der letzten 30 Tage.

Statistik:
- Gesamt: ${filtered.length} Abwesenheiten (krank: ${sick}, urlaub: ${vacation}, sonstig: ${other})
- Häufigster Abwesenheitstag: ${topDayStr}
- Am häufigsten abwesende Kinder: ${frequentAbsent || 'keine Auffälligkeiten'}

Erstelle 2-3 prägnante Erkenntnisse und Handlungsempfehlungen. Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "muster"|"empfehlung"|"hinweis", "text": "Konkrete Erkenntnis oder Empfehlung"}
  ]
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
      hinweise: result.hinweise ?? [],
      stats: { total: filtered.length, sick, vacation, other },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
