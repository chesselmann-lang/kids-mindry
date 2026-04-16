import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import FortbildungManager from './fortbildung-manager'
import AiFortbildungenAnalyse from './ai-fortbildungen-analyse'

export const metadata = { title: 'Fortbildungen' }

export default async function FortbildungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: trainings }, { data: staff }] = await Promise.all([
    supabase.from('trainings')
      .select('*, profiles:staff_id(full_name)')
      .eq('site_id', siteId)
      .order('training_date', { ascending: false })
      .limit(50),
    supabase.from('profiles')
      .select('id, full_name')
      .eq('site_id', siteId)
      .in('role', ['educator', 'group_lead', 'admin', 'caretaker'])
      .order('full_name'),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Fortbildungen</h1>
          <p className="text-sm text-gray-400">{(trainings ?? []).length} Einträge</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <GraduationCap size={20} className="text-indigo-600" />
        </div>
      </div>

      <AiFortbildungenAnalyse />

      <FortbildungManager
        trainings={(trainings ?? []) as any[]}
        staff={(staff ?? []) as any[]}
        siteId={siteId}
      />
    </div>
  )
}
