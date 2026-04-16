import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Thermometer } from 'lucide-react'
import KrankmeldungClient from './krankmeldung-client'
import AiKrankmeldungAnalyse from './ai-krankmeldung-analyse'

export const metadata = { title: 'Krankmeldung' }

export default async function KrankmeldungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const { data: reports } = await supabase
    .from('sick_reports')
    .select('*')
    .eq('staff_id', user.id)
    .order('start_date', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Krankmeldung</h1>
          <p className="text-sm text-gray-400">{(profile as any)?.full_name}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
          <Thermometer size={20} className="text-red-500" />
        </div>
      </div>

      {isAdmin && <AiKrankmeldungAnalyse />}

      <KrankmeldungClient
        userId={user.id}
        siteId={siteId}
        today={today}
        reports={(reports ?? []) as any[]}
      />
    </div>
  )
}
