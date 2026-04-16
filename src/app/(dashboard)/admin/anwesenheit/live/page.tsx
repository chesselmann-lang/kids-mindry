import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LiveBoard from './live-board'
import AiLiveAnwesenheit from './ai-live-anwesenheit'

export const metadata = { title: 'Live-Anwesenheitstafel' }

export default async function LiveAnwesenheitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role, site_id')
    .eq('id', user.id)
    .single()

  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  return (
    <div className="space-y-4">
      <AiLiveAnwesenheit />
      <LiveBoard siteId={siteId} />
    </div>
  )
}
