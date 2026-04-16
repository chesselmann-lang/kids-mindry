export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInMinutes } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const since = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()

  const { data: entries } = await supabase
    .from('time_entries')
    .select('id, staff_id, clock_in, clock_out, break_minutes, profiles:staff_id(full_name)')
    .eq('site_id', siteId)
    .gte('clock_in', since)
    .order('clock_in', { ascending: false })

  const list = (entries ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Keine Zeiterfassungsdaten der letzten 4 Wochen.', hinweise: [], stats: { totalHours: 0, staffCount: 0, unclosed: 0 } })
  }

  const byStaff: Record<string, { name: string; minutes: number; entries: number }> = {}
  let unclosed = 0

  for (const e of list) {
    const id = e.staff_id
    const name = e.profiles?.full_name ?? 'Unbekannt'
    if (!byStaff[id]) byStaff[id] = { name, minutes: 0, entries: 0 }
    byStaff[id].entries++
    if (!e.clock_out) {
      unclosed++
    } else {
      const mins = differenceInMinutes(new Date(e.clock_out), new Date(e.clock_in)) - (e.break_minutes ?? 0)
      byStaff[id].minutes += Math.max(mins, 0)
    }
  }

  const staffCount = Object.keys(byStaff).length
  const totalHours = Math.round(Object.values(byStaff).reduce((s, v) => s + v.minutes, 0) / 60)

  const staffLines = Object.values(byStaff)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 6)
    .map(s => `${s.name}: ${Math.round(s.minutes / 60)}h gesamt, ${s.entries} Einträge`)
    .join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die Zeiterfassung der letzten 4 Wochen.

Statistiken:
- Mitarbeiter erfasst: ${staffCount}
- Gesamtstunden Team: ${totalHours}h
- Offene Einträge (kein Ausstempeln): ${unclosed}

Stunden je Mitarbeiter:
${staffLines}

Gib kurze Hinweise zu Auffälligkeiten (Überstunden, fehlende Stempelungen, Ausreißer).
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "achtung"|"info"|"positiv", "text": "Konkreter Hinweis"}
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
      stats: { totalHours, staffCount, unclosed },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
