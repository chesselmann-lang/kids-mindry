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
      content: `Du bist Support-Assistent für eine Kita-Software. Gib 4 kurze Tipps, wie man eine gute Support-Anfrage formuliert, damit das Problem schnell gelöst werden kann.
Antworte NUR als JSON: {"hinweise":[{"typ":"beschreibung"|"screenshot"|"schritte"|"tipp","text":"..."}]}
- beschreibung: Wie man das Problem klar beschreibt
- screenshot: Wann Screenshots helfen
- schritte: Reproduktionsschritte beschreiben
- tipp: Allgemeine Tipps für schnelle Hilfe
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
