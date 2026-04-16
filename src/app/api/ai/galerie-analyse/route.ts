import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const albumId = req.nextUrl.searchParams.get('albumId')
  if (!albumId) return NextResponse.json({ error: 'albumId required' }, { status: 400 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: album } = await supabase
    .from('albums')
    .select('*')
    .eq('id', albumId)
    .eq('site_id', siteId)
    .single()

  if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: photos } = await supabase
    .from('media_assets')
    .select('caption, created_at')
    .eq('album_id', albumId)
    .order('created_at', { ascending: true })

  const photoList = (photos ?? []) as any[]
  const captions = photoList.map(p => p.caption).filter(Boolean)
  const photoCount = photoList.length

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent. Analysiere dieses Fotoalbum und gib 3 kurze, freundliche Hinweise auf Deutsch fuer Eltern.

Album-Titel: ${(album as any).title}
Beschreibung: ${(album as any).description ?? '(keine)'}
Anzahl Fotos: ${photoCount}
Bildunterschriften (falls vorhanden): ${captions.slice(0, 10).join(' | ') || '(keine)'}

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "highlight"|"info"|"tipp", "text": "..."}
  ],
  "stats": {
    "photoCount": ${photoCount},
    "hasCaptions": ${captions.length > 0}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
