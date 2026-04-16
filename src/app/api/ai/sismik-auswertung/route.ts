import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { bereiche } = await req.json()
  // bereiche: [{id, titel, avg, count, items: [{item, wert}]}]

  const bereiche_text = bereiche.map((b: any) =>
    `${b.titel} (Ø ${b.avg}/4.0, ${b.count} Beobachtungen):\n` +
    b.items.map((i: any) => `  - ${i.item}: ${i.wert}/4`).join('\n')
  ).join('\n\n')

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 700,
    messages: [{
      role: 'user',
      content: `Du bist Sprachförderfachkraft. Analysiere diese SISMIK-Beobachtungsdaten und gib gezielte pädagogische Empfehlungen.

SISMIK-Ergebnisse:
${bereiche_text}

Antworte NUR als JSON:
{"auswertung":[{"bereich":"...","bewertung":"stark"|"mittel"|"foerderbereich","text":"...","aktivitaet":"..."}]}

- bewertung "stark": Ø ≥ 3.0
- bewertung "mittel": Ø 2.0–2.9
- bewertung "foerderbereich": Ø < 2.0
- text: 1 kurzer Satz zur Einschätzung
- aktivitaet: 1 konkrete Förderaktivität für den Alltag

Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
