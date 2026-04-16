export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/rundschreiben
// Send a broadcast push notification + optional in-app message to parents/groups
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = (profile as any).site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const body = await req.json()
  const { title, body: msgBody, channel, target } = body

  if (!title?.trim()) return NextResponse.json({ error: 'title required' }, { status: 400 })
  if (!msgBody?.trim()) return NextResponse.json({ error: 'body required' }, { status: 400 })

  // Determine recipients based on target
  let recipientIds: string[] = []

  if (target === 'all') {
    const { data: allUsers } = await supabase
      .from('profiles').select('id').eq('site_id', siteId)
    recipientIds = (allUsers ?? []).map((u: any) => u.id)
  } else if (target === 'parents') {
    const { data: parents } = await supabase
      .from('profiles').select('id').eq('site_id', siteId).eq('role', 'parent')
    recipientIds = (parents ?? []).map((u: any) => u.id)
  } else if (target) {
    // group id — find parents whose children are in this group
    const { data: children } = await supabase
      .from('children').select('id')
      .eq('site_id', siteId).eq('group_id', target).eq('status', 'active')
    const childIds = (children ?? []).map((c: any) => c.id)
    if (childIds.length > 0) {
      const { data: guardians } = await supabase
        .from('guardians').select('user_id')
        .in('child_id', childIds).not('user_id', 'is', null)
      recipientIds = [...new Set((guardians ?? []).map((g: any) => g.user_id).filter(Boolean))]
    }
  }

  if (recipientIds.length === 0) {
    return NextResponse.json({ error: 'Keine Empfänger gefunden' }, { status: 400 })
  }

  // Save broadcast notification records
  const notifications = recipientIds.map(uid => ({
    user_id: uid,
    type: 'broadcast',
    title: title.trim(),
    body: msgBody.trim(),
    data: { broadcast_by: user.id, target, channel, recipients: recipientIds.length },
  }))

  await supabase.from('notifications').insert(notifications)

  let pushSent = 0
  let messageSent = 0

  // Send push notifications if requested
  if (channel === 'push' || channel === 'both') {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kids.mindry.de'}/api/push-send`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientIds,
            title: title.trim(),
            body: msgBody.trim(),
            url: '/feed',
            sourceType: 'broadcast',
            sourceId: user.id,
          }),
        }
      )
      if (res.ok) pushSent = recipientIds.length
    } catch (e) {
      console.error('push-send error:', e)
    }
  }

  // Send in-app messages if requested
  if (channel === 'message' || channel === 'both') {
    try {
      // Create a broadcast conversation (one conversation per recipient)
      for (const recipientId of recipientIds.slice(0, 50)) { // cap at 50 to avoid timeout
        const { data: conv } = await supabase.from('conversations').insert({
          site_id: siteId,
          subject: title.trim(),
        }).select().single()

        if (conv) {
          await supabase.from('conversation_participants').insert([
            { conversation_id: conv.id, user_id: user.id, joined_at: new Date().toISOString() },
            { conversation_id: conv.id, user_id: recipientId, joined_at: new Date().toISOString() },
          ])
          await supabase.from('messages').insert({
            conversation_id: conv.id,
            sender_id: user.id,
            content: `**${title.trim()}**\n\n${msgBody.trim()}`,
          })
        }
      }
      messageSent = recipientIds.length
    } catch (e) {
      console.error('message broadcast error:', e)
    }
  }

  return NextResponse.json({
    success: true,
    recipients: recipientIds.length,
    pushSent,
    messageSent,
  })
}
