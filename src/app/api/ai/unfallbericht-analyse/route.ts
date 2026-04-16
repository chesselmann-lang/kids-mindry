export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, subDays, differenceInDays } from 'date-fns'
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
  const since = subDays(new Date(), 90).toISOString()

  const { data: reports } = await supabase
    .from('incident_reports')
    .select('id, occurred_at, severity, location, description, first_aid, parent_notified')
    .eq('site_id', siteId)
    .gte('occurred_at', since)
    .order('occurred_at', { ascending: false })

  if (!reports || reports.length === 0) {
    return NextResponse.json({
      message: 'Keine Unfallberichte in den letzten 90 Tagen.',
      hinweise: [],
      stats: { total: 0, serious: 0, moderate: 0, minor: 0 },
    })
  }

  const serious = reports.filter(r => (r as any).severity === 'serious').length
  const moderate = reports.filter(r => (r as any).severity === 'moderate').length
  const minor = reports.filter(r => (r as any).severity === 'minor').length

  // Location frequency
  const locationCounts: Record<string, number> = {}
  for (const r of reports as any[]) {
    if (r.location) locationCounts[r.location] = (locationCounts[r.location] ?? 0) + 1
  }
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([loc, n]) => `${loc} (${n}x)`)
    .join(', ')

  // Time pattern (morning vs afternoon)
  let morningCount = 0, afternoonCount = 0
  for (const r of reports as any[]) {
    const hour = new Date(r.occurred_at).getHours()
    if (hour < 12) morningCount++
    else afternoonCount++
  }

  // Recent trend
  const last30 = reports.filter(r => differenceInDays(new Date(), new Date((r as any).occurred_at)) <= 30).length
  const prev30 = reports.length - last30

  const recentSnippets = (reports as any[]).slice(0, 5).map(r =>
    `${format(new Date(r.occurred_at), 'd. MMM', { locale: de })} | ${r.severity} | ${r.location ?? 'k.A.'} | ${r.description?.slice(0, 60) ?? ''}`
  ).join('\n')

  const prompt = `Du bist Sicherheitsbeauftragte einer Kita. Analysiere die Unfallberichte der letzten 90 Tage.

Statistik:
- Gesamt: ${reports.length} Unfälle (davon leicht: ${minor}, mittel: ${moderate}, schwer: ${serious})
- Letzte 30 Tage: ${last30}, davor: ${prev30}
- Häufige Orte: ${topLocations || 'keine Daten'}
- Uhrzeit: ${morningCount}x vormittags, ${afternoonCount}x nachmittags

Aktuelle Berichte (Auszug):
${recentSnippets}

Erstelle 2-3 präzise Sicherheitshinweise. Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "info"|"warnung"|"massnahme", "titel": "Kurzer Titel", "text": "Konkreter Hinweis oder Handlungsempfehlung"}
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
      hinweise: result.hinweise ?? [],
      stats: { total: reports.length, serious, moderate, minor },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
