import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TasksClient from './tasks-client'
import AiAufgabenAnalyse from './ai-aufgaben-analyse'

export const metadata = { title: 'Aufgaben' }

export default async function AufgabenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Staff members for assignment
  const { data: staffMembers } = await supabase
    .from('profiles').select('id, full_name, role')
    .eq('site_id', siteId)
    .in('role', ['educator', 'group_lead', 'admin', 'caretaker'])
    .order('full_name')

  const { data: tasks } = await supabase
    .from('staff_tasks')
    .select('*, profiles!assigned_to(full_name), creator:profiles!created_by(full_name)')
    .eq('site_id', siteId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <AiAufgabenAnalyse />
      <TasksClient
        initialTasks={(tasks ?? []) as any[]}
        staffMembers={(staffMembers ?? []) as any[]}
        userId={user.id}
        siteId={siteId}
      />
    </div>
  )
}
