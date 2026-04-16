import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ClipboardCheck } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import UebergabeCheckClient from './uebergabe-check-client'
import AiUebergabeAnalyse from './ai-uebergabe-analyse'

export const metadata = { title: 'Kind-Übergabe' }

export default async function UebergabeCheckPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const [{ data: children }, { data: todayChecks }] = await Promise.all([
    supabase.from('children')
      .select('id, first_name, last_name, group_id')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('first_name'),
    supabase.from('child_handover_checks')
      .select('*')
      .eq('date', today),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Kind-Übergabe</h1>
          <p className="text-sm text-gray-400">{format(new Date(), 'EEEE, d. MMMM', { locale: de })}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <ClipboardCheck size={20} className="text-brand-600" />
        </div>
      </div>

      <AiUebergabeAnalyse />

      <UebergabeCheckClient
        children={(children ?? []) as any[]}
        todayChecks={(todayChecks ?? []) as any[]}
        staffId={user.id}
        today={today}
      />
    </div>
  )
}
