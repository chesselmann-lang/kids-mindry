import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const newsletterId = req.nextUrl.searchParams.get('newsletterId')
  if (!newsletterId) return NextResponse.json({ error: 'newsletterId required' }, { status: 400 })

  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('title, content, summary, published_at, attachment_url')
    .eq('id', newsletterId)
    .single()

  if (!newsletter) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const n = newsletter as any
  const wordCount = (n.content ?? '').split(/\s+/).filter(Boolean).length
  const contentPreview = (n.content ?? '').substring(0, 800)

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent. Fasse diesen Newsletter kurz zusammen und extrahiere die wichtigsten Punkte fuer Eltern auf Deutsch.

Titel: ${n.title}
Inhalt: ${contentPreview}
Anhang: ${n.attachment_url ? 'Ja' : 'Nein'}

Gib 3 praegnante Hinweise (Wichtigstes zuerst).

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "wichtig"|"info"|"tipp", "text": "..."}
  ],
  "stats": {
    "wordCount": ${wordCount},
    "hasAttachment": ${n.attachment_url ? true : false}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
