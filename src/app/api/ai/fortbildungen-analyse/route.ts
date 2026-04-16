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

  const [{ data: trainings }, { data: staff }] = await Promise.all([
    supabase.from('trainings')
      .select('id, staff_id, training_date, title, provider, hours, profiles:staff_id(full_name)')
      .eq('site_id', siteId)
      .order('training_date', { ascending: false })
      .limit(50),
    supabase.from('profiles')
      .select('id, full_name')
      .eq('site_id', siteId)
      .in('role', ['educator', 'group_lead', 'admin', 'caretaker']),
  ])

  if (!trainings || trainings.length === 0) {
    return NextResponse.json({
      message: 'Keine Fortbildungen erfasst.',
      hinweise: [],
      zusammenfassung: '',
    })
  }

  const staffCount = (staff ?? []).length
  const staffWithTraining = new Set((trainings as any[]).map(t => t.staff_id)).size
  const staffWithout = staffCount - staffWithTraining

  // Hours per person
  const hoursByStaff: Record<string, number> = {}
  for (const t of trainings as any[]) {
    if (t.staff_id && t.hours) {
      hoursByStaff[t.staff_id] = (hoursByStaff[t.staff_id] ?? 0) + (t.hours ?? 0)
    }
  }
  const avgHours = staffWithTraining > 0
    ? Math.round(Object.values(hoursByStaff).reduce((a, b) => a + b, 0) / staffWithTraining)
    : 0

  // Last 12 months
  const since = subDays(new Date(), 365).toISOString().split('T')[0]
  const recent = (trainings as any[]).filter(t => t.training_date >= since)

  // Top categories from titles (keywords)
  const recentLines = (trainings as any[]).slice(0, 6).map(t => {
    const date = format(new Date(t.training_date), 'd. MMM yyyy', { locale: de })
    return `${(t.profiles as any)?.full_name ?? 'k.A.'}: "${t.title}"${t.hours ? ` (${t.hours}h)` : ''} – ${date}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere den Fortbildungsstand des Teams.

Team: ${staffCount} Mitarbeitende, davon ${staffWithTraining} mit erfassten Fortbildungen, ${staffWithout} ohne
Fortbildungen gesamt: ${trainings.length} (letzte 12 Monate: ${recent.length})
Ø Fortbildungsstunden pro Person: ${avgHours}h

Aktuelle Einträge:
${recentLines}

Erstelle 2-3 Erkenntnisse und Empfehlungen zur Personalentwicklung. Antworte NUR mit JSON:
{
  "zusammenfassung": "1-2 Sätze zum Fortbildungsstand",
  "hinweise": [
    {"typ": "positiv"|"empfehlung"|"achtung", "text": "Konkreter Hinweis oder Empfehlung"}
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
      hinweise: result.hinweise ?? [],
      stats: { total: trainings.length, recent: recent.length, staffWithout, avgHours },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
