import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const childName = searchParams.get('name') ?? 'das Kind'
  const hour = new Date().getHours()

  const tageszeit = hour < 10 ? 'Morgen' : hour < 12 ? 'Vormittag' : hour < 14 ? 'Mittag' : 'Nachmittag'

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Du bist freundliche Kita-Assistentin. Ein Elternteil checkt ${childName} ${tageszeit === 'Morgen' ? 'morgens ein' : 'am ' + tageszeit + ' ein oder aus'}.
Gib 2 kurze, warme und positive Hinweise: einen Begrüßungsspruch und einen kurzen pädagogischen Tagesimpuls.
Antworte NUR als JSON: {"hinweise":[{"typ":"begruessung"|"impuls","text":"..."}]}
- begruessung: herzliche Begrüßung passend zur Tageszeit "${tageszeit}", ohne den Kindernamen zu verwenden
- impuls: kurzer pädagogischer Tipp oder Aktivitätsvorschlag für Eltern heute
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
