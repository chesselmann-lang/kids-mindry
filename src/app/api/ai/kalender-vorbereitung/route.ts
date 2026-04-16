export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns'
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
  const today = new Date()
  const in14 = addDays(today, 14)
  const todayStr = format(today, 'yyyy-MM-dd')
  const in14Str = format(in14, 'yyyy-MM-dd')

  // Fetch upcoming events (14 days)
  const { data: events } = await supabase
    .from('events')
    .select('id, title, starts_at, ends_at, all_day, description, color')
    .eq('site_id', siteId)
    .gte('starts_at', todayStr + 'T00:00:00')
    .lte('starts_at', in14Str + 'T23:59:59')
    .order('starts_at')
    .limit(20)

  // Fetch upcoming annual events
  const { data: annualEvents } = await supabase
    .from('annual_events')
    .select('title, event_date, event_type, description')
    .eq('site_id', siteId)
    .gte('event_date', todayStr)
    .lte('event_date', in14Str)
    .order('event_date')

  const allEvents = [
    ...(events ?? []).map((e: any) => ({
      datum: format(new Date(e.starts_at), "EEEE, d. MMMM", { locale: de }),
      titel: e.title,
      beschreibung: e.description ?? '',
    })),
    ...(annualEvents ?? []).map((e: any) => ({
      datum: format(new Date(e.event_date + 'T12:00:00'), "EEEE, d. MMMM", { locale: de }),
      titel: e.title,
      beschreibung: e.description ?? '',
    })),
  ]

  if (allEvents.length === 0) {
    return NextResponse.json({
      hinweise: [],
      message: 'Keine Termine in den nächsten 14 Tagen geplant.',
    })
  }

  const eventLines = allEvents
    .slice(0, 15)
    .map(e => `• ${e.datum}: ${e.titel}${e.beschreibung ? ` – ${e.beschreibung.slice(0, 60)}` : ''}`)
    .join('\n')

  const prompt = `Du bist Kita-Leiterin und bereitest dein Team auf die nächsten Termine vor.

Heute: ${format(today, "EEEE, d. MMMM yyyy", { locale: de })}
Anstehende Termine (nächste 14 Tage):
${eventLines}

Gib für die wichtigsten Termine konkrete Vorbereitungshinweise. Antworte NUR mit JSON-Array:
[
  {
    "termin": "Terminname",
    "datum": "Kurzangabe",
    "typ": "vorbereitung"|"hinweis"|"erinnerung",
    "text": "1-2 Sätze was zu tun oder zu beachten ist"
  },
  ...
]
Maximal 5 Einträge, nur die wichtigsten.`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const hinweise = JSON.parse(clean)
    return NextResponse.json({
      hinweise: Array.isArray(hinweise) ? hinweise.slice(0, 5) : [],
      eventCount: allEvents.length,
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
