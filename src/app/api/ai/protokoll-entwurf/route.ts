export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { titel, meetingDate, typ, agendapunkte } = await req.json()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Fetch site info
  const { data: site } = await supabase
    .from('sites').select('name').eq('id', siteId).single()

  const datumFormatted = meetingDate
    ? format(new Date(meetingDate + 'T12:00:00'), "EEEE, d. MMMM yyyy", { locale: de })
    : format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })

  const sitzungstyp = typ ?? 'Elternabend'
  const agenda = agendapunkte?.length
    ? agendapunkte.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')
    : '– keine Agendapunkte angegeben'

  const prompt = `Du bist die Kita-Leitung von "${(site as any)?.name ?? 'der Kita'}" und erstellst ein Protokoll.

Sitzungsart: ${sitzungstyp}
Datum: ${datumFormatted}
Thema: ${titel || 'Allgemeiner ' + sitzungstyp}
Agendapunkte:
${agenda}

Schreibe ein strukturiertes Protokoll in deutscher Sprache. Antworte NUR mit JSON:
{
  "inhalt": "Vollständiger Protokolltext als formatierter Markdown-Text mit:\n- Begrüßung und Teilnehmerhinweis\n- Abschnitte für jeden Agendapunkt\n- Beschlüsse und Maßnahmen\n- Abschluss"
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({ inhalt: result.inhalt ?? '', datumFormatted })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
