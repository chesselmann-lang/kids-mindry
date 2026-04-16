import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const eventId = req.nextUrl.searchParams.get('eventId')
  if (!eventId) return NextResponse.json({ error: 'eventId required' }, { status: 400 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('site_id', siteId)
    .single()

  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { count: yesCount } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'yes')

  const ev = event as any
  const startDate = new Date(ev.starts_at)
  const daysUntil = Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isFuture = daysUntil > 0

  const typeLabels: Record<string, string> = {
    event: 'Veranstaltung', excursion: 'Ausflug',
    parent_evening: 'Elternabend', holiday: 'Feiertag',
    closed: 'Geschlossen', other: 'Sonstiges',
  }

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent. Gib 3 kurze, hilfreiche Hinweise zu diesem Termin auf Deutsch.

Titel: ${ev.title}
Typ: ${typeLabels[ev.type] ?? ev.type}
Datum: ${startDate.toLocaleDateString('de-DE')}
${isFuture ? `In ${daysUntil} Tagen` : daysUntil === 0 ? 'Heute' : 'Vergangen'}
Ort: ${ev.location ?? '(kein Ort angegeben)'}
Anmeldung erforderlich: ${ev.rsvp_required ? 'Ja' : 'Nein'}
${ev.rsvp_required ? `Anmeldungen: ${yesCount ?? 0}${ev.max_participants ? ` / ${ev.max_participants}` : ''}` : ''}
Beschreibung: ${(ev.description ?? '').substring(0, 300) || '(keine)'}

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "termin"|"hinweis"|"info", "text": "..."}
  ],
  "stats": {
    "daysUntil": ${daysUntil},
    "yesCount": ${yesCount ?? 0},
    "rsvpRequired": ${ev.rsvp_required ? true : false}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
