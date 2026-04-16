import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/push'

// POST /api/nachrichten/send — Nachricht senden + Push auslösen
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversationId, body, type = 'text', meta = {} } = await req.json()
  if (!conversationId || !body?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single()
  const senderName = (profile as any)?.full_name ?? 'Kita'

  // Nachricht einfügen
  const { data: msg, error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: body.trim(),
    type,
    meta,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Alle anderen Teilnehmer laden
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId)
    .neq('user_id', user.id)

  // Push an alle anderen Teilnehmer
  await Promise.allSettled(
    (participants ?? []).map((p: any) =>
      sendPushToUser(supabase, p.user_id, {
        title: `💬 ${senderName}`,
        body: body.length > 80 ? body.slice(0, 80) + '…' : body,
        url: `/nachrichten/${conversationId}`,
      })
    )
  )

  return NextResponse.json({ message: msg })
}
