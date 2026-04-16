import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AbwesenheitForm from './abwesenheit-form'
import AiAbwesenheit from './ai-abwesenheit'

export const metadata = { title: 'Abwesenheit melden' }

export default async function AbwesenheitMeldenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  // Staff use the admin abwesenheiten page
  if (isStaff) redirect('/admin/abwesenheiten')

  // Get parent's children
  const { data: guardians } = await supabase
    .from('guardians')
    .select('child_id, children(id, first_name, last_name)')
    .eq('user_id', user.id)

  const children = (guardians ?? [])
    .filter(g => g.children)
    .map(g => g.children as any)

  // Get recent absences for these children
  const childIds = children.map((c: any) => c.id)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  let recentAbsences: any[] = []
  if (childIds.length > 0) {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .in('child_id', childIds)
      .neq('status', 'present')
      .neq('status', 'unknown')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(10)
    recentAbsences = data ?? []
  }

  const childMap = Object.fromEntries(children.map((c: any) => [c.id, c]))

  return (
    <div className="space-y-4">
      <AiAbwesenheit />
      <AbwesenheitForm
        children={children}
        reporterId={user.id}
        siteId={process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!}
        recentAbsences={recentAbsences}
        childMap={childMap}
      />
    </div>
  )
}
