import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Plane } from 'lucide-react'
import UrlaubClient from './urlaub-client'
import AiUrlaubAnalyse from './ai-urlaub-analyse'

export const metadata = { title: 'Urlaubsantrag' }

export default async function UrlaubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: requests } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('staff_id', user.id)
    .order('start_date', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Urlaubsantrag</h1>
          <p className="text-sm text-gray-400">{(profile as any)?.full_name}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
          <Plane size={20} className="text-blue-600" />
        </div>
      </div>

      <AiUrlaubAnalyse />

      <UrlaubClient
        userId={user.id}
        siteId={siteId}
        requests={(requests ?? []) as any[]}
      />
    </div>
  )
}
