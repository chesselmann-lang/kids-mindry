export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, getYear } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MONTHS_DE: Record<number, string> = {
  1: 'Januar', 2: 'Februar', 3: 'März', 4: 'April', 5: 'Mai', 6: 'Juni',
  7: 'Juli', 8: 'August', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { year: yearParam } = await req.json()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const year = yearParam ?? getYear(new Date())

  // Get existing events to avoid duplication
  const { data: existingEvents } = await supabase
    .from('annual_events')
    .select('title, event_date')
    .eq('site_id', siteId)
    .gte('event_date', `${year}-01-01`)
    .lte('event_date', `${year}-12-31`)
    .order('event_date')

  const existingLines = (existingEvents ?? []).map((e: any) => {
    const d = new Date(e.event_date)
    return `• ${MONTHS_DE[d.getMonth() + 1]}: ${e.title}`
  }).join('\n') || '– keine eingetragen'

  const prompt = `Du bist eine erfahrene Kita-Leiterin und hilfst bei der Jahresplanung für ${year}.

Bereits geplante Veranstaltungen:
${existingLines}

Schlage 8-10 Ideen für das Jahresprogramm vor, die noch nicht geplant sind. Berücksichtige:
- Saisonale Projekte und Aktivitäten (Winter, Frühling, Sommer, Herbst)
- Traditionelle Feste (Erntedank, St. Martin, Nikolaus, Karneval, Ostern, Sommerfest)
- Pädagogische Themenwochen
- Ausflüge und Exkursionen
- Elternabende und Informationsveranstaltungen
- Sportliche Aktivitäten

Antworte NUR mit JSON-Array:
[
  {"monat": 1-12, "titel": "Veranstaltungsname", "typ": "Fest"|"Projekt"|"Ausflug"|"Eltern"|"Sport"|"Thema", "beschreibung": "1 Satz was es ist"},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const ideen = JSON.parse(clean)
    return NextResponse.json({ ideen: Array.isArray(ideen) ? ideen : [], year })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
