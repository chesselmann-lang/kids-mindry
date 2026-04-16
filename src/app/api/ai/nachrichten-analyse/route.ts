import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const conversationId = req.nextUrl.searchParams.get('conversationId')
  if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })

  // Check participation
  const { data: participation } = await supabase
    .from('conversation_participants').select('id')
    .eq('conversation_id', conversationId).eq('user_id', user.id).single()

  if (!participation) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: conv } = await supabase
    .from('conversations').select('subject').eq('id', conversationId).single()

  const { data: messages } = await supabase
    .from('messages').select('content, created_at, sender_id')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(20)

  const msgList = (messages ?? []) as any[]
  const messageCount = msgList.length
  const recentMessages = msgList.slice(0, 5).map(m => m.content).join(' | ').substring(0, 400)

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Kommunikationsassistent. Fasse diese Konversation kurz zusammen (2-3 Hinweise auf Deutsch).

Betreff: ${(conv as any)?.subject ?? '(kein Betreff)'}
Letzte Nachrichten (Auszug): ${recentMessages || '(keine)'}
Gesamt: ${messageCount} Nachrichten

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "zusammenfassung"|"offen"|"info", "text": "..."}
  ],
  "stats": {
    "messageCount": ${messageCount}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
