export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, differenceInMonths } from 'date-fns'
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

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]
  const todayLabel = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })

  const [{ data: children }, { data: groups }, { data: attendance }] = await Promise.all([
    supabase.from('children')
      .select('id, first_name, last_name, birth_date, group_id')
      .eq('site_id', siteId)
      .eq('status', 'active'),
    supabase.from('groups').select('id, name, color').eq('site_id', siteId),
    supabase.from('attendance').select('child_id, status').eq('site_id', siteId).eq('date', today),
  ])

  if (!children || children.length === 0) {
    return NextResponse.json({
      hinweise: [],
      message: 'Keine aktiven Kinder erfasst.',
    })
  }

  const attMap: Record<string, string> = {}
  for (const a of (attendance ?? [])) attMap[(a as any).child_id] = (a as any).status

  const groupMap: Record<string, string> = {}
  for (const g of (groups ?? [])) groupMap[(g as any).id] = (g as any).name

  const presentCount = Object.values(attMap).filter(s => s === 'present').length
  const absentSick = Object.values(attMap).filter(s => s === 'absent_sick').length
  const unchecked = children.length - Object.keys(attMap).length

  // Age distribution
  const ageGroups = { u3: 0, u6: 0, other: 0 }
  for (const c of (children as any[])) {
    if (!c.birth_date) { ageGroups.other++; continue }
    const months = differenceInMonths(new Date(), new Date(c.birth_date))
    if (months < 36) ageGroups.u3++
    else if (months < 72) ageGroups.u6++
    else ageGroups.other++
  }

  // Group distribution
  const groupCounts: Record<string, number> = {}
  for (const c of (children as any[])) {
    const gname = groupMap[c.group_id] ?? 'Keine Gruppe'
    groupCounts[gname] = (groupCounts[gname] ?? 0) + 1
  }
  const groupLines = Object.entries(groupCounts)
    .map(([g, n]) => `${g}: ${n} Kinder`)
    .join(', ')

  const prompt = `Du bist Kita-Leiterin und erstellst einen Tages-Überblick.

Datum: ${todayLabel}
Kinder gesamt (aktiv): ${children.length}
Anwesend: ${presentCount}
Krank: ${absentSick}
Nicht erfasst: ${unchecked}
Altersgruppen: unter 3 Jahre: ${ageGroups.u3}, 3-6 Jahre: ${ageGroups.u6}
Gruppen: ${groupLines}

Gib 2-3 kurze, hilfreiche Hinweise für heute. Antworte NUR mit JSON:
{
  "zusammenfassung": "1 Satz mit dem Kernbefund des Tages",
  "hinweise": [
    {"typ": "info"|"positiv"|"achtung", "text": "Kurzer konkreter Hinweis"},
    ...
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      zusammenfassung: result.zusammenfassung ?? '',
      hinweise: result.hinweise ?? [],
      stats: { total: children.length, present: presentCount, sick: absentSick, unchecked },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
