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

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: posts } = await supabase
    .from('bulletin_posts')
    .select('id, title, content, is_pinned, category, created_at')
    .eq('site_id', siteId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  if (!posts || posts.length === 0) {
    return NextResponse.json({
      message: 'Keine Beiträge auf der Pinnwand.',
      highlights: [],
      zusammenfassung: '',
    })
  }

  const pinnedCount = (posts as any[]).filter(p => p.is_pinned).length

  const postLines = (posts as any[]).map(p => {
    const dateStr = format(new Date(p.created_at), 'd. MMM', { locale: de })
    const pin = p.is_pinned ? '[GEPINNT] ' : ''
    const cat = p.category ? `[${p.category}] ` : ''
    return `${pin}${cat}${p.title ?? ''}: ${p.content?.slice(0, 100) ?? ''} (${dateStr})`
  }).join('\n')

  const prompt = `Du bist Kita-Koordinatorin. Analysiere diese Pinnwand-Beiträge.

Beiträge (${posts.length} gesamt, ${pinnedCount} gepinnt):
${postLines}

Fasse das Wichtigste zusammen und hebe dringende Punkte hervor. Antworte NUR mit JSON:
{
  "zusammenfassung": "1-2 Sätze: Was sind die aktuell wichtigsten Themen auf der Pinnwand?",
  "highlights": [
    {"typ": "wichtig"|"termin"|"info", "text": "Kurzer konkreter Hinweis"}
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
      highlights: result.highlights ?? [],
      stats: { total: posts.length, pinned: pinnedCount },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
