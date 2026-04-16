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

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: protocols } = await supabase
    .from('protocols')
    .select('id, title, meeting_date, published_at, content')
    .order('meeting_date', { ascending: false })
    .limit(15)

  const list = (protocols ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Noch keine Protokolle vorhanden.', hinweise: [], stats: { total: 0, drafts: 0 } })
  }

  const drafts = list.filter(p => !p.published_at)
  const published = list.filter(p => p.published_at)

  const lines = list.slice(0, 6).map((p: any) => {
    const date = format(new Date(p.meeting_date + 'T12:00:00'), 'd. MMM yyyy', { locale: de })
    const status = p.published_at ? 'veröffentlicht' : 'Entwurf'
    const snippet = (p.content ?? p.title ?? '').replace(/<[^>]+>/g, '').slice(0, 100)
    return `${date} [${status}]: ${p.title} — ${snippet}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die vorhandenen Protokolle (Elternabend-Mitschriften).

Statistiken:
- Protokolle gesamt: ${list.length}
- Veröffentlicht: ${published.length}
- Entwürfe: ${drafts.length}

Letzte Einträge:
${lines}

Erkenne Trends, offene Punkte und ob Entwürfe noch fertiggestellt werden sollten.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "dringend"|"hinweis"|"info", "text": "Konkreter Hinweis"}
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
      stats: { total: list.length, drafts: drafts.length, published: published.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
