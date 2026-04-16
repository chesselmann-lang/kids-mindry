import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const prompt = `Du bist ein pädagogischer KI-Assistent für eine Kita. Erkläre kurz, wie das SISMIK-Instrument korrekt angewendet wird.

SISMIK steht für: Sprachverhalten und Interesse an Sprache bei Migrantenkindern in Kindertageseinrichtungen.
Es umfasst Bereiche: Sprechfreude, Sprachverstehen, Aussprache/Grammatik, Schriftinteresse.
Skala: 0=nicht beobachtet, 1=selten, 2=manchmal, 3=häufig, 4=immer/sehr häufig.

Gib 3 kurze, praxisorientierte Tipps zur korrekten Anwendung und Bewertung.
Antworte im JSON-Format: {"hinweise": [{"typ": "methodik|tipp|info", "text": "..."}]}
Typ "methodik" = wichtige methodische Hinweise, "tipp" = praktischer Tipp, "info" = nützliche Info.
Nur JSON, kein Markdown.`

    const client = new Anthropic()
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
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
