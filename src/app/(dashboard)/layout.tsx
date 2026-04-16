import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/bottom-nav'
import TopBar from '@/components/layout/top-bar'
import InstallBanner from '@/components/pwa/install-banner'
import { OfflineBanner } from '@/components/ui/offline-banner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles').select('*').eq('id', user.id).single()

  const { data: site } = await supabase
    .from('sites').select('*').eq('id', process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!).single()

  const role = profile?.role ?? 'parent'
  const isAdmin = ['admin', 'group_lead'].includes(role)
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(role)

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar
        user={user}
        profile={profile}
        site={site}
        isStaff={isStaff}
        isAdmin={isAdmin}
        unreadNotifications={unreadNotifications ?? 0}
      />
      <main id="main-content" className="flex-1 max-w-2xl mx-auto w-full px-4 pb-24 pt-4">
        {children}
      </main>
      <BottomNav isStaff={isStaff} isAdmin={isAdmin} unreadMessages={unreadMessages} unreadNotifications={unreadNotifications ?? 0} />
      <InstallBanner />
      <OfflineBanner />
    </div>
  )
}
