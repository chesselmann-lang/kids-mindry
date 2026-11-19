import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/app-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles').select('*').eq('id', user.id).single()

  const role = profile?.role ?? 'parent'
  const isAdmin = ['admin', 'group_lead'].includes(role)
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(role)

  const userName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email || ''

  // Unread notifications count
  const { count: unreadNotifications } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null)

  // Unread messages count (conversations with unread messages)
  const { data: participations } = await (supabase as any)
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', user.id)

  let unreadMessages = 0
  if (participations && participations.length > 0) {
    for (const p of participations) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', p.conversation_id)
        .neq('sender_id', user.id)
        .gt('created_at', p.last_read_at ?? '1970-01-01')
      if (count && count > 0) unreadMessages++
    }
  }

  return (
    <AppShell
      isAdmin={isAdmin}
      isStaff={isStaff}
      userName={userName}
      unreadNotifications={unreadNotifications ?? 0}
      unreadMessages={unreadMessages}
    >
      {children}
    </AppShell>
  )
}
