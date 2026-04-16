import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KitaSetupWizard from './kita-setup-wizard'
import AiEinrichtenCheck from './ai-einrichten-check'

export const metadata = { title: 'Kita einrichten' }

export default async function KitaSetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  if (!['admin'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Fetch existing data to pre-fill wizard
  const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).single()
  const { data: groups } = await supabase.from('groups').select('*').eq('site_id', siteId).order('name')
  const { data: children } = await (supabase as any)
    .from('children').select('id, first_name, last_name, group_id').eq('site_id', siteId).eq('status', 'active').order('first_name')
  const { count: staffCount } = await supabase
    .from('profiles').select('id', { count: 'exact', head: true })
    .eq('site_id', siteId).in('role', ['educator', 'group_lead', 'admin', 'caretaker'])
  const { count: parentCount } = await supabase
    .from('profiles').select('id', { count: 'exact', head: true })
    .eq('site_id', siteId).eq('role', 'parent')

  return (
    <div className="space-y-4">
    <AiEinrichtenCheck />
    <KitaSetupWizard
      userId={user.id}
      siteId={siteId}
      site={site}
      groups={groups ?? []}
      children={children ?? []}
      staffCount={staffCount ?? 0}
      parentCount={parentCount ?? 0}
    />
    </div>
  )
}
