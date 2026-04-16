import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PollForm from './poll-form'
import AiUmfragenNeu from './ai-umfragen-neu'

export const metadata = { title: 'Neue Umfrage' }

export default async function NeueUmfragePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/umfragen')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data: groups } = await supabase.from('groups').select('id, name').eq('site_id', siteId).order('name')

  return (
    <div className="space-y-4">
      <AiUmfragenNeu />
      <PollForm authorId={user.id} siteId={siteId} groups={(groups ?? []) as any[]} />
    </div>
  )
}
