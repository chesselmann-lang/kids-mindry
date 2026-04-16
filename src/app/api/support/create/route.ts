export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('site_id').eq('id', user.id).single()

  const siteId = (profile as any)?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { category, priority, subject, message } = await req.json()

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Betreff und Nachricht sind erforderlich' }, { status: 400 })
  }

  const validCategories = ['question', 'bug', 'feature', 'billing', 'other']
  const validPriorities = ['low', 'normal', 'high', 'urgent']

  const { data: ticket, error } = await supabase.from('support_tickets').insert({
    site_id: siteId,
    user_id: user.id,
    category: validCategories.includes(category) ? category : 'question',
    priority: validPriorities.includes(priority) ? priority : 'normal',
    subject: subject.trim().slice(0, 200),
    message: message.trim().slice(0, 5000),
    status: 'open',
  }).select('id').single()

  if (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify admins about new ticket
  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('site_id', siteId)
      .in('role', ['admin', 'group_lead'])

    if (admins && admins.length > 0) {
      const notifications = admins.map((a: any) => ({
        user_id: a.id,
        type: 'support_ticket',
        title: 'Neue Support-Anfrage',
        body: subject.trim().slice(0, 100),
        data: { ticket_id: ticket.id, category, priority },
      }))
      await supabase.from('notifications').insert(notifications)
    }
  } catch (notifErr) {
    console.error('Notification error:', notifErr)
    // Don't fail the request if notification fails
  }

  return NextResponse.json({ id: ticket.id })
}
