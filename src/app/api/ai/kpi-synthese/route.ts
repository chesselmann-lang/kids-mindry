export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function workingDaysCount(start: Date, end: Date): number {
  return eachDayOfInterval({ start, end }).filter(d => {
    const wd = getDay(d)
    return wd >= 1 && wd <= 5
  }).length
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const monthStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd')
  const monthLabel = format(today, 'MMMM yyyy', { locale: de })
  const wDays = workingDaysCount(startOfMonth(today), endOfMonth(today))

  const [{ data: children }, { data: attendance }, { data: groups }, { data: staff }, { data: waitlist }] =
    await Promise.all([
      supabase.from('children').select('id, status').eq('site_id', siteId),
      supabase.from('attendance').select('child_id, status')
        .eq('site_id', siteId).gte('date', monthStart).lte('date', monthEnd),
      supabase.from('groups').select('id, name, capacity').eq('site_id', siteId),
      supabase.from('profiles').select('id').eq('site_id', siteId)
        .in('role', ['educator', 'group_lead', 'admin', 'caretaker']),
      supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'waitlist'),
    ])

  const active = (children ?? []).filter((c: any) => c.status === 'active')
  const totalActive = active.length
  const totalStaff = (staff ?? []).length
  const totalWaitlist = (waitlist ?? []).length

  const attList = attendance ?? []
  const present = attList.filter((a: any) => a.status === 'present').length
  const sick = attList.filter((a: any) => a.status === 'absent_sick').length
  const vacation = attList.filter((a: any) => a.status === 'absent_vacation').length
  const theoretical = totalActive * wDays
  const attendanceRate = theoretical > 0 ? Math.round((present / theoretical) * 100) : 0

  const totalCapacity = (groups ?? []).reduce((s, g) => s + ((g as any).capacity ?? 0), 0)
  const belegung = totalCapacity > 0 ? Math.round((totalActive / totalCapacity) * 100) : null
  const fkRatio = totalStaff > 0 ? (totalActive / totalStaff).toFixed(1) : null

  const prompt = `Du bist Kita-Leiterin und analysierst den Monat ${monthLabel}.

KPIs:
- Aktive Kinder: ${totalActive} / Kapazität: ${totalCapacity}${belegung ? ` (Belegung: ${belegung}%)` : ''}
- Warteliste: ${totalWaitlist}
- Anwesenheitsquote: ${attendanceRate}% (${present} Anwesenheitstage)
- Krankmeldungen Kinder: ${sick}, Urlaub: ${vacation}
- Team: ${totalStaff} Mitarbeitende | Fachkraft-Kind-Ratio 1:${fkRatio ?? 'k.A.'}

Erstelle eine kurze Management-Synthese. Antworte NUR mit JSON:
{
  "fazit": "1-2 Sätze: Wie läuft der Monat?",
  "erkenntnisse": [
    {"typ": "positiv"|"neutral"|"kritisch", "text": "Konkrete Erkenntnis mit Handlungsempfehlung"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      fazit: result.fazit ?? '',
      erkenntnisse: result.erkenntnisse ?? [],
      stats: { monthLabel, attendanceRate, belegung, totalActive, totalWaitlist },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
