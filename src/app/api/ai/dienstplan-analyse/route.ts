export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { startOfWeek, endOfWeek, format } from 'date-fns'
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

  const { weekStart: weekStartParam } = await req.json()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const today = new Date()
  const weekStart = weekStartParam
    ? new Date(weekStartParam + 'T12:00:00')
    : startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd')
  const weekLabel = format(weekStart, "'KW' w '·' d. MMM yyyy", { locale: de })

  // Fetch shifts for the week
  const { data: shifts } = await supabase
    .from('shifts')
    .select('shift_date, start_time, end_time, staff_id, profiles:staff_id(full_name, role)')
    .eq('site_id', siteId)
    .gte('shift_date', weekStartStr)
    .lte('shift_date', weekEndStr)
    .order('shift_date')
    .order('start_time')

  // Fetch active children count
  const { count: childrenCount } = await supabase
    .from('children')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .eq('status', 'active')

  // Fetch staff count
  const { count: staffCount } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('site_id', siteId)
    .in('role', ['educator', 'group_lead', 'admin', 'caretaker'])

  if (!shifts || shifts.length === 0) {
    return NextResponse.json({
      hinweise: [],
      message: 'Kein Dienstplan für diese Woche erfasst.',
    })
  }

  // Build daily coverage summary
  const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr']
  const dailyCoverage: Record<string, { date: string; count: number; hours: number; staff: string[] }> = {}

  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    const ds = format(d, 'yyyy-MM-dd')
    dailyCoverage[ds] = { date: DAY_NAMES[i], count: 0, hours: 0, staff: [] }
  }

  for (const s of (shifts ?? [])) {
    const key = s.shift_date
    if (!dailyCoverage[key]) continue
    dailyCoverage[key].count++
    const name = (s.profiles as any)?.full_name ?? 'Unbekannt'
    if (!dailyCoverage[key].staff.includes(name)) dailyCoverage[key].staff.push(name)
    // compute hours
    if (s.start_time && s.end_time) {
      const [sh, sm] = s.start_time.split(':').map(Number)
      const [eh, em] = s.end_time.split(':').map(Number)
      dailyCoverage[key].hours += (eh * 60 + em - sh * 60 - sm) / 60
    }
  }

  const coverageLines = Object.values(dailyCoverage)
    .map(d => `${d.date}: ${d.count} Mitarbeiter (${Math.round(d.hours)}h gesamt) — ${d.staff.join(', ') || 'niemand'}`)
    .join('\n')

  const staffNames = [...new Set((shifts ?? []).map((s: any) => (s.profiles as any)?.full_name).filter(Boolean))]

  const prompt = `Du bist Kita-Leiterin und analysierst den Dienstplan für ${weekLabel}.

Kinder (aktiv): ${childrenCount ?? '?'}
Gesamtpersonal: ${staffCount ?? '?'}
Eingesetztes Personal diese Woche: ${staffNames.join(', ')}

Abdeckung pro Tag:
${coverageLines}

Gesetzliche Mindestanforderung: 1 Fachkraft auf max. 5 Kinder (Richtwert).

Analysiere den Dienstplan und gib 3-5 konkrete Hinweise. Antworte NUR mit JSON-Array:
[
  {"typ": "positiv"|"hinweis"|"warnung", "titel": "Kurztitel", "text": "1-2 Sätze konkrete Beobachtung oder Empfehlung"},
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
    return NextResponse.json({ hinweise: Array.isArray(hinweise) ? hinweise : [], weekLabel })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
