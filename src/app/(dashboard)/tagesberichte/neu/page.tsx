import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TagesberichtForm from './tagesbericht-form'
import AiTagesberichtNeu from './ai-tagesbericht-neu'

export const metadata = { title: 'Tagesbericht erstellen' }

export default async function NeuerTagesberichtPage({
  searchParams,
}: {
  searchParams: { child?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, group_id')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('first_name')

  return (
    <div className="space-y-4">
      <AiTagesberichtNeu />
      <TagesberichtForm
        children={(children ?? []) as any[]}
        preselectedChildId={searchParams.child}
        authorId={user.id}
      />
    </div>
  )
}
