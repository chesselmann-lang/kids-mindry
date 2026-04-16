import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const dayOfWeek = new Date().toLocaleDateString('de-DE', { weekday: 'long' })
  const month = new Date().toLocaleDateString('de-DE', { month: 'long' })

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Du bist Pädagogik-Assistentin in einer Kita. Heute ist ${dayOfWeek} im ${month}.
Gib 6 präzise Schreibhilfen für einen Tagesbericht in einer Kita.
Antworte NUR als JSON: {"vorschlaege":[{"typ":"aktivitaet"|"entwicklung"|"mahlzeit"|"tipp","text":"..."}]}
Beispiele:
- aktivitaet: konkrete Aktivitäten, die man beschreiben kann (Basteln, Singen, Draußenspiel)
- entwicklung: Beobachtungen zur sozialen/motorischen/sprachlichen Entwicklung
- mahlzeit: wie Mahlzeiten protokolliert werden
- tipp: Schreibtipps für gute Tagesberichte
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
