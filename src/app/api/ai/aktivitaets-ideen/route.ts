export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, getMonth } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SEASONS: Record<number, string> = {
  0: 'Winter', 1: 'Winter', 2: 'Frühling', 3: 'Frühling', 4: 'Frühling',
  5: 'Sommer', 6: 'Sommer', 7: 'Sommer', 8: 'Herbst', 9: 'Herbst',
  10: 'Herbst', 11: 'Winter',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { bereich } = await req.json() // optional: 'drinnen' | 'draussen' | 'kreativ' | 'bewegung'

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const season = SEASONS[getMonth(today)]
  const monthName = format(today, 'MMMM', { locale: de })

  // Get age distribution from active children
  const { data: children } = await supabase
    .from('children').select('date_of_birth').eq('site_id', siteId).eq('status', 'active')

  const ages = (children ?? []).map((c: any) => {
    if (!c.date_of_birth) return null
    const months = Math.floor((Date.now() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    return Math.floor(months / 12)
  }).filter(Boolean) as number[]

  const minAge = ages.length ? Math.min(...ages) : 2
  const maxAge = ages.length ? Math.max(...ages) : 6
  const avgAge = ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : 4

  // Recent activities to avoid repetition
  const { data: recentReports } = await (supabase as any)
    .from('daily_reports')
    .select('activities')
    .eq('site_id', siteId)
    .not('activities', 'is', null)
    .order('report_date', { ascending: false }).limit(15)

  const recentActs = [...new Set((recentReports ?? []).map((r: any) => r.activities?.slice(0, 50)).filter(Boolean))].slice(0, 6)

  const bereichHint = bereich ? `\nSchwerpunkt: ${bereich}` : ''

  const prompt = `Schlage kreative Kita-Aktivitäten vor.

Kontext:
- Saison: ${season} (${monthName})
- Altersgruppe: ${minAge}–${maxAge} Jahre, Durchschnitt: ${avgAge} Jahre
- Anzahl Kinder: ${ages.length}${bereichHint}

Zuletzt gemachte Aktivitäten (nicht wiederholen):
${recentActs.length ? recentActs.map(a => `• ${a}`).join('\n') : '– keine bekannt'}

Schlage 6 abwechslungsreiche, altersgerechte Aktivitäten vor. Jede soll:
- Konkret und direkt umsetzbar sein
- Zum aktuellen Monat/Jahreszeit passen
- Verschiedene Bereiche abdecken (Motorik, Kreativität, Sprache, Natur, Soziales)
- Material angeben wenn nötig

Antworte NUR mit JSON-Array:
[
  {
    "titel": "Aktivitätstitel",
    "bereich": "Motorik|Kreativität|Sprache|Natur|Soziales|Kognition",
    "dauer": "15 Min"|"30 Min"|"45 Min",
    "material": "Liste oder –",
    "beschreibung": "2-3 Sätze wie es geht"
  }
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const ideen = JSON.parse(clean)
    return NextResponse.json({ ideen: Array.isArray(ideen) ? ideen : [], season, monthName })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
