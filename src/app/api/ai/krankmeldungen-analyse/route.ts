export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInDays, format, subDays } from 'date-fns'
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
  const today = new Date().toISOString().split('T')[0]
  const since = subDays(new Date(), 60).toISOString().split('T')[0]

  const [{ data: reports }, { data: staff }] = await Promise.all([
    supabase.from('sick_reports')
      .select('id, staff_id, start_date, end_date, status, profiles:staff_id(full_name, role)')
      .eq('site_id', siteId)
      .gte('start_date', since)
      .order('start_date', { ascending: false }),
    supabase.from('profiles')
      .select('id, full_name')
      .eq('site_id', siteId)
      .in('role', ['educator', 'group_lead', 'admin', 'caretaker']),
  ])

  if (!reports || reports.length === 0) {
    return NextResponse.json({
      message: 'Keine Krankmeldungen in den letzten 60 Tagen.',
      hinweise: [],
      stats: { active: 0, total: 0 },
    })
  }

  const active = (reports as any[]).filter(r => {
    const end = r.end_date ?? r.start_date
    return end >= today && r.start_date <= today
  })

  const staffCount = (staff ?? []).length
  const absentRatio = staffCount > 0 ? Math.round((active.length / staffCount) * 100) : 0

  // Duration analysis
  const durations = (reports as any[]).map(r => {
    const start = new Date(r.start_date)
    const end = r.end_date ? new Date(r.end_date) : new Date()
    return differenceInDays(end, start) + 1
  })
  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0

  // Frequent reporters
  const staffCounts: Record<string, number> = {}
  for (const r of reports as any[]) {
    const name = (r.profiles as any)?.full_name ?? 'Unbekannt'
    staffCounts[name] = (staffCounts[name] ?? 0) + 1
  }
  const frequentLines = Object.entries(staffCounts)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n, c]) => `${n}: ${c}x`)
    .join(', ')

  const activeLines = active.slice(0, 5).map((r: any) =>
    `${(r.profiles as any)?.full_name ?? 'Unbekannt'} (seit ${format(new Date(r.start_date), 'd. MMM', { locale: de })})`
  ).join(', ')

  const prompt = `Du bist Personalverantwortliche einer Kita. Analysiere die Team-Krankmeldungen der letzten 60 Tage.

Statistik:
- Gesamt: ${reports.length} Meldungen in 60 Tagen, Ø ${avgDuration} Tage Dauer
- Aktuell krank: ${active.length} von ${staffCount} Mitarbeitenden (${absentRatio}%)
- Aktuelle Abwesenheiten: ${activeLines || 'keine'}
- Häufige Meldungen: ${frequentLines || 'keine Auffälligkeiten'}

Erstelle 2-3 personalwirtschaftliche Hinweise. Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "akut"|"muster"|"empfehlung", "text": "Konkreter Hinweis zur Personalplanung"}
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
      stats: { active: active.length, total: reports.length, staffCount, absentRatio },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
