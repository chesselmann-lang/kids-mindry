import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import ZeiterfassungClient from './zeiterfassung-client'
import AiZeiterfassungAnalyse from './ai-zeiterfassung-analyse'

export const metadata = { title: 'Zeiterfassung' }

export default async function ZeiterfassungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Check for open time entry (clocked in but not out)
  const { data: openEntry } = await supabase
    .from('time_entries')
    .select('*')
    .eq('staff_id', user.id)
    .is('clock_out', null)
    .maybeSingle()

  // Get recent entries (last 14 days)
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const { data: entries } = await supabase
    .from('time_entries')
    .select('*')
    .eq('staff_id', user.id)
    .gte('clock_in', twoWeeksAgo.toISOString())
    .order('clock_in', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Zeiterfassung</h1>
          <p className="text-sm text-gray-400">{(profile as any)?.full_name}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <Clock size={20} className="text-brand-600" />
        </div>
      </div>

      <AiZeiterfassungAnalyse />

      <ZeiterfassungClient
        userId={user.id}
        siteId={siteId}
        openEntry={openEntry as any}
        entries={(entries ?? []) as any[]}
      />
    </div>
  )
}
