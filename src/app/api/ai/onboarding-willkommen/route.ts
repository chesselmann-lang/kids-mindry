import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const childName = searchParams.get('name')

  const greeting = childName ? `für die Eltern von ${childName}` : 'für neue Kita-Eltern'

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Du bist freundliche Kita-App-Betreuerin. Erstelle 4 herzliche Willkommens-Tipps ${greeting}, die gerade die App zum ersten Mal einrichten.
Antworte NUR als JSON: {"hinweise":[{"typ":"willkommen"|"tipp"|"funktion","text":"..."}]}
- willkommen: Herzlicher Willkommenstext (1 Eintrag)
- tipp: Wichtiger erster Schritt in der App
- funktion: Nützliche Funktion, die Eltern kennen sollten
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
