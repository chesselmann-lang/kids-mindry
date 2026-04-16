export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInDays, differenceInMonths, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: applications } = await supabase
    .from('online_anmeldungen')
    .select('id, status, created_at, child_name, child_birth_date, desired_start_date, notes')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  if (!applications || applications.length === 0) {
    return NextResponse.json({
      message: 'Keine Anmeldungen vorhanden.',
      empfehlungen: [],
      zusammenfassung: '',
    })
  }

  const list = applications as any[]
  const neu = list.filter(a => a.status === 'neu')
  const inBearbeitung = list.filter(a => a.status === 'in_bearbeitung')
  const aufgenommen = list.filter(a => a.status === 'aufgenommen')
  const abgelehnt = list.filter(a => a.status === 'abgelehnt')

  // Age distribution of 'neu' applications
  const ages = neu
    .filter(a => a.child_birth_date)
    .map(a => differenceInMonths(new Date(), new Date(a.child_birth_date)))

  // Oldest pending
  const oldestPending = neu.length > 0
    ? Math.max(...neu.map(a => differenceInDays(new Date(), new Date(a.created_at))))
    : 0

  const pendingLines = neu.slice(0, 5).map((a: any) => {
    const days = differenceInDays(new Date(), new Date(a.created_at))
    const ageMonths = a.child_birth_date
      ? differenceInMonths(new Date(), new Date(a.child_birth_date))
      : null
    const desired = a.desired_start_date
      ? format(new Date(a.desired_start_date), 'd. MMM yyyy', { locale: de })
      : 'k.A.'
    return `${a.child_name ?? 'k.A.'} (${ageMonths !== null ? `${ageMonths} Mo.` : 'k.A.'}) | seit ${days} Tagen offen | Wunschstart: ${desired}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die Online-Anmeldungen.

Anmeldungen:
- Neu (unbearbeitet): ${neu.length}
- In Bearbeitung: ${inBearbeitung.length}
- Aufgenommen: ${aufgenommen.length}
- Abgelehnt: ${abgelehnt.length}
- Älteste offene Anmeldung: ${oldestPending} Tage

Neue Anmeldungen (Auszug):
${pendingLines || 'Keine neuen Anmeldungen.'}

Erstelle eine kurze Aufnahme-Empfehlung. Antworte NUR mit JSON:
{
  "zusammenfassung": "1-2 Sätze zur aktuellen Anmeldungssituation",
  "empfehlungen": [
    {"prioritaet": "dringend"|"bald"|"info", "text": "Konkrete Handlungsempfehlung"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      zusammenfassung: result.zusammenfassung ?? '',
      empfehlungen: result.empfehlungen ?? [],
      stats: { total: list.length, neu: neu.length, inBearbeitung: inBearbeitung.length, oldestPending },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
