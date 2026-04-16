export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, subDays } from 'date-fns'
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

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const fourteenDaysAgo = subDays(today, 14)

  const [
    { data: records },
    { data: children },
  ] = await Promise.all([
    supabase.from('sleep_records')
      .select('child_id, sleep_date, sleep_start, sleep_end, duration_minutes, quality')
      .gte('sleep_date', fourteenDaysAgo.toISOString().split('T')[0])
      .order('sleep_date', { ascending: false }),
    supabase.from('children')
      .select('id, first_name, date_of_birth')
      .eq('site_id', siteId).eq('status', 'active'),
  ])

  const childMap: Record<string, { name: string; ageMonths: number }> = {}
  for (const c of (children ?? []) as any[]) {
    const ageMonths = c.date_of_birth
      ? Math.floor((today.getTime() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      : 36
    childMap[c.id] = { name: c.first_name, ageMonths }
  }

  // Build per-child sleep summary
  const childSleep: Record<string, { name: string; ageMonths: number; durations: number[]; qualities: string[] }> = {}
  for (const r of (records ?? []) as any[]) {
    const info = childMap[r.child_id]
    if (!info) continue
    if (!childSleep[r.child_id]) childSleep[r.child_id] = { ...info, durations: [], qualities: [] }
    if (r.duration_minutes) childSleep[r.child_id].durations.push(r.duration_minutes)
    if (r.quality) childSleep[r.child_id].qualities.push(r.quality)
  }

  const totalRecords = (records ?? []).length
  if (totalRecords === 0) return NextResponse.json({ hinweise: [], message: 'Keine Schlafdaten der letzten 14 Tage' })

  const childLines = Object.values(childSleep).map(c => {
    const avgDur = c.durations.length
      ? Math.round(c.durations.reduce((a, b) => a + b, 0) / c.durations.length)
      : 0
    const ageLabel = c.ageMonths >= 12 ? `${Math.floor(c.ageMonths / 12)}J ${c.ageMonths % 12}M` : `${c.ageMonths}M`
    const qualCount: Record<string, number> = {}
    c.qualities.forEach(q => { qualCount[q] = (qualCount[q] ?? 0) + 1 })
    const mainQual = Object.entries(qualCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '–'
    return `${c.name} (${ageLabel}): Ø ${avgDur} Min, ${c.durations.length} Einträge, Qualität meist: ${mainQual}`
  }).join('\n')

  const prompt = `Analysiere das Schlafverhalten einer Kita-Gruppe der letzten 14 Tage.

Schlafdaten:
${childLines || '– keine'}

Bewerte:
- Altersgerechte Schlafdauer (unter 1,5J: 45-90 Min, 1,5-3J: 60-120 Min, über 3J: 45-75 Min)
- Kinder mit auffällig wenig oder viel Schlaf
- Qualitätsprobleme (unruhiger Schlaf)
- Allgemeine Empfehlungen für das Team

Antworte NUR mit JSON-Array:
[
  {"typ": "positiv"|"hinweis"|"warnung", "titel": "Kurztitel", "text": "1-2 Sätze", "kind": "Kindname oder null"},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const hinweise = JSON.parse(clean)
    return NextResponse.json({ hinweise: Array.isArray(hinweise) ? hinweise : [], totalRecords })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
