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
    .limit(6)

  const userProfile = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const role = userProfile.data?.role ?? 'parent'
  const name = userProfile.data?.full_name ?? ''

  const msgList = (messages ?? []).reverse() as any[]
  const lastMsgs = msgList.map((m: any, i: number) => {
    const isMe = m.sender_id === user.id
    return `${isMe ? 'Ich' : 'Gegenüber'}: ${m.content}`
  }).join('\n')

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{
      role: 'user',
      content: `Du bist Kommunikationsassistent in einer Kita. Schreibe 2-3 kurze Antwortvorschläge auf die letzte Nachricht.

Betreff: ${(conv as any)?.subject ?? '(kein Betreff)'}
Konversation:
${lastMsgs || '(keine Nachrichten)'}

Meine Rolle: ${role}${name ? `, Name: ${name}` : ''}

Antworte NUR als JSON:
{"vorschlaege":[{"ton":"formell"|"freundlich"|"kurz","text":"..."}]}
- formell: sachlich und professionell
- freundlich: warm und persönlich
- kurz: sehr kurze Antwort (1-2 Sätze max)

Jeder Vorschlag: direkt verwendbar, 1-3 Sätze, auf Deutsch.
Antworte ausschließlich mit dem JSON, ohne Erklärungen.`
    }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const data = JSON.parse(raw)
  return NextResponse.json(data)
}
