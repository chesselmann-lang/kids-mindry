import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CockpitDashboard from './cockpit-dashboard'

export const metadata = { title: 'KI-Tages-Cockpit' }
export const dynamic = 'force-dynamic'

export default async function CockpitPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role, site_id')
    .eq('id', user.id)
    .single()

  const isAdmin = ['admin', 'group_lead'].includes(profile?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  return <CockpitDashboard siteId={siteId} />
}
