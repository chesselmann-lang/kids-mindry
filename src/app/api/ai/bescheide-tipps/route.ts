import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const month = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist Kita-Verwaltungsfachkraft. Aktuell: ${month}.
Gib 5 präzise Hinweise zur Erstellung von Elternbescheiden (monatliche Gebührenbescheide) in einer Kita.
Antworte NUR als JSON: {"hinweise":[{"typ":"zeitpunkt"|"inhalt"|"recht"|"tipp","text":"..."}]}
- zeitpunkt: Wann Bescheide erstellt und verschickt werden sollten
- inhalt: Was ein Bescheid enthalten muss
- recht: Rechtliche Anforderungen (Widerspruchsfrist, etc.)
- tipp: Praktische Tipps für reibungslose Abläufe
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
