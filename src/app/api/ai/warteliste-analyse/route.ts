export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInMonths, differenceInDays, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: waitlist }, { data: groups }] = await Promise.all([
    supabase.from('children')
      .select('id, first_name, last_name, date_of_birth, group_id, created_at, notes')
      .eq('site_id', siteId)
      .eq('status', 'waitlist')
      .order('created_at', { ascending: true }),
    supabase.from('groups').select('id, name, capacity').eq('site_id', siteId),
  ])

  if (!waitlist || waitlist.length === 0) {
    return NextResponse.json({
      message: 'Keine Kinder auf der Warteliste.',
      empfehlungen: [],
      zusammenfassung: '',
    })
  }

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))

  // Age analysis
  const ageGroups = { u1: 0, u3: 0, u6: 0, older: 0 }
  for (const c of waitlist as any[]) {
    if (!c.date_of_birth) { ageGroups.older++; continue }
    const months = differenceInMonths(new Date(), new Date(c.date_of_birth))
    if (months < 12) ageGroups.u1++
    else if (months < 36) ageGroups.u3++
    else if (months < 72) ageGroups.u6++
    else ageGroups.older++
  }

  // Wait duration
  const waitDays = (waitlist as any[]).map(c => differenceInDays(new Date(), new Date(c.created_at)))
  const avgWait = Math.round(waitDays.reduce((a, b) => a + b, 0) / waitDays.length)
  const longestWait = Math.max(...waitDays)

  // Group demand
  const groupDemand: Record<string, number> = {}
  for (const c of waitlist as any[]) {
    const gname = c.group_id ? (groupMap[c.group_id]?.name ?? 'Unbekannt') : 'Ohne Gruppe'
    groupDemand[gname] = (groupDemand[gname] ?? 0) + 1
  }
  const demandStr = Object.entries(groupDemand).map(([g, n]) => `${g}: ${n}`).join(', ')

  const childLines = (waitlist as any[]).slice(0, 5).map((c, i) => {
    const months = c.date_of_birth ? differenceInMonths(new Date(), new Date(c.date_of_birth)) : null
    const ageStr = months !== null ? `${months} Monate` : 'k.A.'
    const days = differenceInDays(new Date(), new Date(c.created_at))
    return `${i + 1}. ${c.first_name} ${c.last_name} – ${ageStr} alt, wartet ${days} Tage`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die aktuelle Warteliste für eine Aufnahme-Empfehlung.

Warteliste: ${waitlist.length} Kinder
Altersgruppen: unter 1 Jahr: ${ageGroups.u1}, 1-3 Jahre: ${ageGroups.u3}, 3-6 Jahre: ${ageGroups.u6}
Durchschnittliche Wartezeit: ${avgWait} Tage, Längste: ${longestWait} Tage
Gruppeninteresse: ${demandStr || 'k.A.'}

Erste Kinder (nach Wartezeit):
${childLines}

Erstelle eine kurze Aufnahme-Empfehlung. Antworte NUR mit JSON:
{
  "zusammenfassung": "1-2 Sätze zur aktuellen Wartelisten-Situation",
  "empfehlungen": [
    {"prioritaet": "hoch"|"mittel"|"info", "text": "Konkrete Empfehlung oder Hinweis"}
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
      zusammenfassung: result.zusammenfassung ?? '',
      empfehlungen: result.empfehlungen ?? [],
      stats: { total: waitlist.length, avgWait, longestWait },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
