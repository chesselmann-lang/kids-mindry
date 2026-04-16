export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: reports } = await supabase
    .from('weekly_reports')
    .select('id, title, week_start, summary, group_id, groups:group_id(name)')
    .eq('site_id', siteId)
    .order('week_start', { ascending: false })
    .limit(10)

  const list = (reports ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Noch keine Wochenberichte vorhanden.', hinweise: [], stats: { total: 0 } })
  }

  const lines = list.slice(0, 6).map((r: any) => {
    const kw = format(parseISO(r.week_start), "'KW' w, d. MMM yyyy", { locale: de })
    const group = r.groups?.name ? ` [${r.groups.name}]` : ''
    const snippet = (r.summary ?? r.title ?? '').slice(0, 100)
    return `${kw}${group}: ${snippet}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die letzten Wochenberichte.

Berichte (${list.length} gesamt):
${lines}

Erkenne wiederkehrende Themen, Highlights und ggf. fehlende Berichte.
Antworte NUR mit JSON:
{
  "zusammenfassung": "1-2 Sätze zum Gesamtbild",
  "hinweise": [
    {"typ": "positiv"|"hinweis"|"info", "text": "Konkreter Hinweis"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      zusammenfassung: result.zusammenfassung ?? '',
      hinweise: result.hinweise ?? [],
      stats: { total: list.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
