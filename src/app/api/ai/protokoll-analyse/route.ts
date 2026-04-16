import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const protocolId = req.nextUrl.searchParams.get('protocolId')
  if (!protocolId) return NextResponse.json({ error: 'protocolId required' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  const { data: protocol } = await supabase
    .from('protocols')
    .select('title, content, meeting_date, published_at')
    .eq('id', protocolId)
    .single()

  if (!protocol) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const p = protocol as any
  if (!isStaff && !p.published_at) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const contentPreview = (p.content ?? '').substring(0, 1000)
  const wordCount = (p.content ?? '').split(/\s+/).filter(Boolean).length

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent. Fasse dieses Sitzungsprotokoll kurz zusammen und extrahiere die wichtigsten Punkte.

Titel: ${p.title}
Datum: ${p.meeting_date}
Inhalt: ${contentPreview}

Gib 3 praegnante Hinweise auf Deutsch (Zusammenfassung, Beschluesse/Aktionen, Wichtiges fuer Eltern/Team).

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "zusammenfassung"|"aktion"|"info", "text": "..."}
  ],
  "stats": {
    "wordCount": ${wordCount},
    "isPublished": ${p.published_at ? true : false}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
