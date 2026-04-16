import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock3 } from 'lucide-react'
import TagesablaufManager from './tagesablauf-manager'
import AiTagesablaufCheck from './ai-tagesablauf-check'

export const metadata = { title: 'Tagesablauf' }

export default async function TagesablaufPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: items }, { data: groups }] = await Promise.all([
    supabase.from('daily_schedule_items')
      .select('*')
      .eq('site_id', siteId)
      .order('time_start', { ascending: true }),
    supabase.from('groups').select('id, name').eq('site_id', siteId).order('name'),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Tagesablauf</h1>
          <p className="text-sm text-gray-400">Zeiten & Aktivitäten</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
          <Clock3 size={20} className="text-green-600" />
        </div>
      </div>

      <AiTagesablaufCheck />

      <TagesablaufManager
        items={(items ?? []) as any[]}
        groups={(groups ?? []) as any[]}
        siteId={siteId}
      />
    </div>
  )
}
