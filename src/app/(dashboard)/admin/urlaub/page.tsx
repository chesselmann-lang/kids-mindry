import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plane, CheckCircle2, XCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import LeaveApprover from './leave-approver'
import AiUrlaubAnalyse from './ai-urlaub-analyse'

export const metadata = { title: 'Urlaubsanträge verwalten' }

export default async function AdminUrlaubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: requests } = await supabase
    .from('leave_requests')
    .select('*, profiles:staff_id(full_name, role)')
    .eq('site_id', siteId)
    .order('start_date', { ascending: false })
    .limit(50)

  const pending = (requests ?? []).filter((r: any) => r.status === 'pending')
  const others = (requests ?? []).filter((r: any) => r.status !== 'pending')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Urlaubsanträge</h1>
          <p className="text-sm text-gray-400">{pending.length} offene {pending.length === 1 ? 'Antrag' : 'Anträge'}</p>
        </div>
      </div>

      <AiUrlaubAnalyse />

      <LeaveApprover pending={pending as any[]} others={others as any[]} />
    </div>
  )
}
