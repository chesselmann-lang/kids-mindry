import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'allgemein'

  const categoryLabels: Record<string, string> = {
    allgemein:  'Allgemeine Entwicklung',
    sozial:     'Soziale Kompetenzen',
    motorik:    'Motorik & Bewegung',
    sprache:    'Sprache & Kommunikation',
    kreativ:    'Kreativität & Kunst',
    kognitiv:   'Kognitive Entwicklung',
    emotional:  'Emotionale Entwicklung',
    natur:      'Natur & Umwelt',
  }
  const categoryLabel = categoryLabels[category] ?? 'Allgemeine Entwicklung'

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist Pädagogik-Fachkraft in einer Kita. Erstelle Portfolio-Eintragsvorschläge für die Kategorie: ${categoryLabel}.
Gib 5 kurze, konkrete Ideen für Portfolio-Einträge zu dieser Entwicklungsdomäne.
Antworte NUR als JSON: {"vorschlaege":[{"typ":"beobachtung"|"aktivitaet"|"meilenstein","text":"..."}]}
- beobachtung: Was man beobachten und dokumentieren kann
- aktivitaet: Welche Aktivitäten gut dokumentiert werden können
- meilenstein: Typische Entwicklungsschritte in diesem Bereich
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json({ ...data, category })
}
