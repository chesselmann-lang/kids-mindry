export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, getYear, startOfYear, endOfYear } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const year = getYear(new Date())
  const yearStart = format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')
  const yearEnd = format(endOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')

  const { data: events } = await supabase
    .from('annual_events')
    .select('id, event_type, event_date, title')
    .eq('site_id', siteId)
    .gte('event_date', yearStart)
    .lte('event_date', yearEnd)
    .order('event_date')

  const list = (events ?? []) as any[]
  const typeFreq: Record<string, number> = {}
  for (const e of list) {
    typeFreq[e.event_type ?? 'other'] = (typeFreq[e.event_type ?? 'other'] ?? 0) + 1
  }

  const today = format(new Date(), 'yyyy-MM-dd')
  const upcoming = list.filter(e => e.event_date >= today).length
  const monthsWithEvents = new Set(list.map(e => e.event_date?.slice(0, 7))).size

  const prompt = `Du bist ein KiTa-Planer. Analysiere die Jahresplanung ${year}:

Einträge gesamt: ${list.length}
Monate mit Einträgen: ${monthsWithEvents}/12
Bevorstehende Termine: ${upcoming}
Typen: ${Object.entries(typeFreq).map(([k, v]) => `${k}: ${v}`).join(', ')}

Wichtige Typen: holiday, closing, special, trip, meeting.
Antworte NUR mit JSON:
{"hinweise":[{"typ":"tipp|info|vollständig","text":"..."}],"stats":{"total":${list.length},"upcoming":${upcoming},"months":${monthsWithEvents}}}
Maximal 2 hinweise.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
