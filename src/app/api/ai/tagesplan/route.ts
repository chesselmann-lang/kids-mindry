export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { applyAiRateLimit, validateBody, AiSchemas } from '@/lib/ai-utils'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const ALTERSGRUPPEN: Record<string, string> = {
  krippe: 'Krippe (0–3 Jahre)',
  kiga: 'Kindergartengruppe (3–6 Jahre)',
  gemischt: 'Altersgemischte Gruppe (1–6 Jahre)',
  hort: 'Hort (6–10 Jahre)',
}

const SCHWERPUNKTE: Record<string, string> = {
  bewegung: 'Bewegung & Motorik',
  kreativ: 'Kreativität & Kunst',
  sprache: 'Sprache & Kommunikation',
  natur: 'Natur & Umwelt',
  sozial: 'Soziales Lernen',
  kognitiv: 'Kognitive Förderung',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = applyAiRateLimit(user.id)
  if (rl) return rl

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: body, error: bodyErr } = await validateBody(req, AiSchemas.Tagesplan)
  if (bodyErr) return bodyErr
  const { altersgruppe, schwerpunkt, notizen } = body

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const dayLabel = format(today, 'EEEE, d. MMMM yyyy', { locale: de })
  const wochentag = format(today, 'EEEE', { locale: de })

  // Get today's events
  const { data: events } = await supabase.from('events').select('title, starts_at, description')
    .eq('site_id', siteId)
    .gte('starts_at', today.toISOString().split('T')[0] + 'T00:00:00')
    .lte('starts_at', today.toISOString().split('T')[0] + 'T23:59:59')

  const saison = jahreszeit ?? (['März', 'April', 'Mai'].includes(format(today, 'MMMM', { locale: de })) ? 'Frühling'
    : ['Juni', 'Juli', 'August'].includes(format(today, 'MMMM', { locale: de })) ? 'Sommer'
    : ['September', 'Oktober', 'November'].includes(format(today, 'MMMM', { locale: de })) ? 'Herbst' : 'Winter')

  const todayEvents = ((events ?? []) as any[]).map(e => e.title).join(', ')

  const prompt = `Du bist erfahrene Kita-Pädagogin. Erstelle einen vollständigen Tagesplan für heute.

TAG: ${dayLabel}
GRUPPE: ${ALTERSGRUPPEN[altersgruppe] || altersgruppe}
SCHWERPUNKT: ${SCHWERPUNKTE[schwerpunkt] || schwerpunkt}
JAHRESZEIT: ${saison}
HEUTIGE EVENTS: ${todayEvents || 'keine besonderen Events'}
SONSTIGE HINWEISE: ${notizen || 'keine'}

Erstelle EXAKT dieses JSON:
{
  "motto": "...",
  "einleitung": "...",
  "phasen": [
    {
      "zeit": "07:30–08:30",
      "titel": "Ankommen & Freispiel",
      "beschreibung": "...",
      "material": "...",
      "tipp": "..."
    }
  ],
  "materialien_gesamt": ["...", "...", "..."],
  "paedagogisches_ziel": "...",
  "wetter_alternative": "..."
}

PHASEN (exakt diese Zeiten für ${wochentag}):
1. 07:30–08:30 Ankommen & Freispiel
2. 08:30–09:00 Frühstück
3. 09:00–09:30 Morgenkreis & Begrüßung
4. 09:30–11:00 Hauptaktivität (Schwerpunkt: ${SCHWERPUNKTE[schwerpunkt]})
5. 11:00–11:30 Aufräumen & Übergang
6. 11:30–12:00 Mittagessen
7. 12:00–14:00 Mittagsruhe / ruhige Beschäftigung
8. 14:00–15:00 Nachmittagsaktivität (leicht, entspannt)
9. 15:00–16:00 Snack & Freispiel / Abholzeit

Regeln:
- Hauptaktivität: konkret und kreativ, passend zum Schwerpunkt und zur Jahreszeit
- Materialien: spezifisch und realistisch für eine Kita
- Pädagogisches Ziel: 1 Satz, konkret
- Wetter-Alternative: falls Außenaktivitäten geplant, kurze Alternative für schlechtes Wetter`

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const result = JSON.parse(raw)
  return NextResponse.json({ ...result, dayLabel, altersgruppe, schwerpunkt, saison })
}
