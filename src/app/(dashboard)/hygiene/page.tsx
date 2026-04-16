import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import HygieneClient from './hygiene-client'
import AiHygieneCompliance from './ai-hygiene-compliance'

export const metadata = { title: 'Hygiene-Checkliste' }

export default async function HygienePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const today = new Date().toISOString().split('T')[0]
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: todayChecks } = await supabase
    .from('hygiene_checks')
    .select('*')
    .eq('site_id', siteId)
    .eq('check_date', today)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Hygiene-Checkliste</h1>
          <p className="text-sm text-gray-400">Tägliche Kontrollen</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-cyan-100 flex items-center justify-center">
          <Sparkles size={20} className="text-cyan-600" />
        </div>
      </div>

      <AiHygieneCompliance />

      <HygieneClient
        todayChecks={(todayChecks ?? []) as any[]}
        userId={user.id}
        siteId={siteId}
        today={today}
      />
    </div>
  )
}
