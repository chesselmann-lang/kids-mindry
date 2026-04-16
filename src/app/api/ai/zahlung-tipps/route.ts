import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Du bist Kita-Verwaltungsfachkraft. Gib 5 kurze Tipps für das Anlegen von Zahlungsposten (z.B. Monatsbeiträge, Ausflüge, Materialien) in einer Kita-Software.
Antworte NUR als JSON: {"hinweise":[{"typ":"benennung"|"betrag"|"faelligkeit"|"tipp","text":"..."}]}
- benennung: Wie man Zahlungsposten eindeutig benennt
- betrag: Tipps zur Betragserfassung
- faelligkeit: Wann Fälligkeitsdaten gesetzt werden
- tipp: Allgemeine Best Practices
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
