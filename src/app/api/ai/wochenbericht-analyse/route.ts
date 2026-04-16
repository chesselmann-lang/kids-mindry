import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reportId = req.nextUrl.searchParams.get('reportId')
  if (!reportId) return NextResponse.json({ error: 'reportId required' }, { status: 400 })

  const { data: report } = await supabase
    .from('weekly_reports')
    .select('*, groups(name), profiles:author_id(full_name)')
    .eq('id', reportId)
    .single()

  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const r = report as any
  const highlights: string[] = Array.isArray(r.highlights) ? r.highlights : []
  const contentLength = (r.content ?? '').length
  const hasPhotos = Array.isArray(r.photo_urls) && r.photo_urls.length > 0

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Du bist ein pädagogischer Assistent für eine Kita-App. Analysiere diesen Wochenbericht und gib 3 prägnante Hinweise auf Deutsch.

Titel: ${r.title}
Gruppe: ${r.groups?.name ?? 'unbekannt'}
Zusammenfassung: ${r.summary ?? '(keine)'}
Inhalt (Auszug): ${(r.content ?? '').substring(0, 500)}
Highlights (${highlights.length}): ${highlights.slice(0, 5).join(', ') || '(keine)'}
Fotos: ${hasPhotos ? 'Ja' : 'Nein'}

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "highlight"|"tipp"|"info", "text": "..."}
  ],
  "stats": {
    "highlightCount": ${highlights.length},
    "hasPhotos": ${hasPhotos},
    "contentLength": ${contentLength}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
