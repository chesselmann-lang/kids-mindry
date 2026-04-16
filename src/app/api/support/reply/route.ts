export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  const isStaff = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  const siteId = (profile as any)?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { ticketId, message, isInternal, isStaffReply, newStatus } = await req.json()

  if (!ticketId) return NextResponse.json({ error: 'Ticket-ID fehlt' }, { status: 400 })

  // Verify ticket belongs to this site (for staff) or to this user (for parents)
  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('id, site_id, user_id, status')
    .eq('id', ticketId)
    .single()

  if (!ticket) return NextResponse.json({ error: 'Ticket nicht gefunden' }, { status: 404 })

  const canAccess = isStaff
    ? ticket.site_id === siteId
    : ticket.user_id === user.id

  if (!canAccess) return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

  // Add reply if message provided
  if (message) {
    const { error: replyError } = await supabase.from('support_ticket_replies').insert({
      ticket_id: ticketId,
      user_id: user.id,
      message,
      is_internal: isStaff ? (isInternal ?? false) : false,
      is_staff_reply: isStaff ? (isStaffReply ?? false) : false,
    })

    if (replyError) {
      console.error('Reply insert error:', replyError)
      return NextResponse.json({ error: replyError.message }, { status: 500 })
    }
  }

  // Update status if changed
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (newStatus && isStaff) {
    updates.status = newStatus
    if (newStatus === 'resolved' || newStatus === 'closed') {
      updates.resolved_at = new Date().toISOString()
    }
  }

  await supabase.from('support_tickets')
    .update(updates)
    .eq('id', ticketId)

  return NextResponse.json({ success: true })
}
