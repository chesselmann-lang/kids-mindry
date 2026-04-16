export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInDays, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PHASES = ['', 'Grundphase', 'Erweiterungsphase', 'Stabilisierungsphase', 'Schlussphase']
const PHASE_DAYS = [0, 3, 6, 17, 24] // cumulative days per phase end

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: processes } = await supabase
    .from('eingewoehnung_processes')
    .select('id, child_id, start_date, phase, status, notes, children:child_id(first_name, last_name)')
    .eq('site_id', siteId)
    .order('start_date', { ascending: false })

  if (!processes || processes.length === 0) {
    return NextResponse.json({
      message: 'Keine Eingewöhnungsprozesse vorhanden.',
      hinweise: [],
      zusammenfassung: '',
    })
  }

  const active = (processes as any[]).filter(p => p.status === 'active')
  const completed = (processes as any[]).filter(p => p.status === 'completed')

  const activeLines = active.map(p => {
    const childName = `${p.children?.first_name ?? ''} ${p.children?.last_name ?? ''}`.trim()
    const days = differenceInDays(new Date(), new Date(p.start_date))
    const phaseName = PHASES[p.phase] ?? `Phase ${p.phase}`
    const expectedDays = PHASE_DAYS[p.phase] ?? 24
    const behind = days > expectedDays + 5 ? ` (${days - expectedDays} Tage verzögert)` : ''
    return `${childName}: ${phaseName}${behind} | ${days} Tage seit Start`
  }).join('\n')

  const prompt = `Du bist pädagogische Fachkraft. Analysiere laufende Eingewöhnungsprozesse.

Aktive Eingewöhnungen: ${active.length}
Abgeschlossene: ${completed.length}

Aktuelle Prozesse:
${activeLines || 'Keine aktiven Prozesse.'}

Erstelle 2-3 pädagogische Hinweise und Unterstützungsempfehlungen. Antworte NUR mit JSON:
{
  "zusammenfassung": "1 Satz zum aktuellen Eingewöhnungsstand",
  "hinweise": [
    {"typ": "gut"|"aufmerksamkeit"|"empfehlung", "text": "Konkreter Hinweis"}
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
      hinweise: result.hinweise ?? [],
      stats: { active: active.length, completed: completed.length, total: processes.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
