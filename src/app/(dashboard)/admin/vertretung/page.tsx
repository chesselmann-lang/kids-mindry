import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import VertretungManager from './vertretung-manager'
import AiVertretungAnalyse from './ai-vertretung-analyse'

export const metadata = { title: 'Vertretungsplan' }

export default async function VertretungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  // Next 14 days
  const until = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [{ data: substitutions }, { data: staff }] = await Promise.all([
    supabase.from('substitutions')
      .select('*, profiles:absent_staff_id(full_name), sub:substitute_staff_id(full_name)')
      .eq('site_id', siteId)
      .gte('date', today)
      .lte('date', until)
      .order('date', { ascending: true }),
    supabase.from('profiles')
      .select('id, full_name')
      .eq('site_id', siteId)
      .in('role', ['educator', 'group_lead', 'caretaker'])
      .order('full_name'),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Vertretungsplan</h1>
          <p className="text-sm text-gray-400">Nächste 14 Tage</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-cyan-100 flex items-center justify-center">
          <RefreshCw size={20} className="text-cyan-600" />
        </div>
      </div>

      <AiVertretungAnalyse />

      <VertretungManager
        substitutions={(substitutions ?? []) as any[]}
        staff={(staff ?? []) as any[]}
        siteId={siteId}
        today={today}
      />
    </div>
  )
}
