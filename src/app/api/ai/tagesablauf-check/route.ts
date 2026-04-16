export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: items } = await supabase
    .from('daily_schedule_items')
    .select('id, title, time_start, time_end, description, group_id, groups:group_id(name)')
    .eq('site_id', siteId)
    .order('time_start', { ascending: true })

  const list = (items ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Noch kein Tagesablauf hinterlegt.', hinweise: [], stats: { total: 0 } })
  }

  // Detect gaps between items (>30 min) and overlaps
  let gapMinutes = 0
  for (let i = 1; i < list.length; i++) {
    const prev = list[i - 1]
    const curr = list[i]
    if (prev.time_end && curr.time_start) {
      const prevEnd = parseInt(prev.time_end.replace(':', ''), 10)
      const currStart = parseInt(curr.time_start.replace(':', ''), 10)
      // rough diff in minutes
      const prevMinutes = Math.floor(prevEnd / 100) * 60 + (prevEnd % 100)
      const currMinutes = Math.floor(currStart / 100) * 60 + (currStart % 100)
      if (currMinutes - prevMinutes > 30) gapMinutes = currMinutes - prevMinutes
    }
  }

  const lines = list.map((it: any) => {
    const time = it.time_start ? `${it.time_start}${it.time_end ? '–' + it.time_end : ''}` : 'k.A.'
    const group = it.groups?.name ? ` [${it.groups.name}]` : ''
    return `${time}${group}: ${it.title}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere den Tagesablauf.

Einträge gesamt: ${list.length}
Größte Zeitlücke: ${gapMinutes} Minuten

Tagesablauf:
${lines}

Prüfe auf Lücken, unausgewogene Zeiten und pädagogische Qualität.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "verbesserung"|"gut"|"info", "text": "Konkreter Hinweis"}
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
      hinweise: result.hinweise ?? [],
      stats: { total: list.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
