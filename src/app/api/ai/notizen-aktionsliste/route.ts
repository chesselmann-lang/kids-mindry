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
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: notes } = await supabase
    .from('quick_notes')
    .select('id, content, color, pinned, created_at')
    .eq('site_id', siteId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  if (!notes || notes.length === 0) {
    return NextResponse.json({
      message: 'Keine Notizen vorhanden.',
      aktionen: [],
      zusammenfassung: '',
    })
  }

  const pinnedCount = (notes as any[]).filter(n => n.pinned).length
  const noteLines = (notes as any[]).map((n, i) =>
    `${n.pinned ? '[GEPINNT] ' : ''}${n.content?.slice(0, 120) ?? ''}`
  ).join('\n')

  const prompt = `Du bist Kita-Koordinatorin. Analysiere diese Team-Schnellnotizen und extrahiere Handlungsbedarf.

Notizen (${notes.length} insgesamt, ${pinnedCount} gepinnt):
${noteLines}

Erkenne Aktionspunkte, offene Aufgaben und wichtige Hinweise. Antworte NUR mit JSON:
{
  "zusammenfassung": "1-2 Sätze: Was dominiert die aktuellen Notizen?",
  "aktionen": [
    {"prioritaet": "hoch"|"mittel"|"info", "text": "Konkreter Handlungspunkt oder wichtiger Hinweis"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      zusammenfassung: result.zusammenfassung ?? '',
      aktionen: result.aktionen ?? [],
      stats: { total: notes.length, pinned: pinnedCount },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
