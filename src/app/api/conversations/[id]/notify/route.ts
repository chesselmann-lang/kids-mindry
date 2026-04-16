/**
 * POST /api/conversations/[id]/notify
 *
 * Called by message-input.tsx after inserting a new message.
 * Looks up conversation participants (excluding sender), checks their
 * notification_settings.notify_nachrichten, and sends push notifications
 * to those who have push subscriptions.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SITE_ID         = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
const APP_URL         = process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Don't block message send — always return quickly, push is best-effort
  const conversationId = params.id

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })

    const { messageBody, senderName } = await req.json()

    // Get conversation participants
    const { data: participants } = await (supabase as any)
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id)

    if (!participants || participants.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    const recipientIds = participants.map((p: any) => p.user_id as string)

    // Filter to those with notify_nachrichten enabled
    const { data: enabledUsers } = await (supabase as any)
      .from('notification_settings')
      .select('user_id')
      .in('user_id', recipientIds)
      .eq('notify_nachrichten', true)

    const filteredIds = enabledUsers?.map((u: any) => u.user_id as string) ?? recipientIds

    if (filteredIds.length === 0) {
      return NextResponse.json({ ok: true, sent: 0 })
    }

    // Send via Edge Function
    const edgeFnUrl = `${SUPABASE_URL}/functions/v1/push-notify`
    const truncatedBody = messageBody && messageBody.length > 80
      ? messageBody.slice(0, 80) + '…'
      : (messageBody ?? '')

    fetch(edgeFnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        siteId: SITE_ID,
        recipientIds: filteredIds,
        title: senderName ? `Neue Nachricht von ${senderName}` : 'Neue Nachricht',
        body: truncatedBody,
        url: `${APP_URL}/nachrichten/${conversationId}`,
        sourceType: 'message',
        sourceId: conversationId,
      }),
    }).catch(err => console.error('push-notify fetch error:', err))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('conversation notify error:', err)
    return NextResponse.json({ ok: false })
  }
}
