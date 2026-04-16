import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const prompt = `Du bist ein KI-Assistent für eine Kita-Verwaltung. Gib 3 kurze, praktische Hinweise, welche Daten beim Anlegen eines neuen Kindes besonders wichtig sind.

Fokus auf: Vollständigkeit der Aufnahmedaten, rechtliche Pflichtfelder, praktische Hinweise für den ersten Betreuungstag.

Antworte im JSON-Format: {"hinweise": [{"typ": "checkliste|tipp|info", "text": "..."}]}
Typ "checkliste" = Pflichtdaten, "tipp" = praktischer Hinweis, "info" = nützliche Information.
Nur JSON, kein Markdown.`

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as any).text
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
