import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Baby } from 'lucide-react'
import EingewoehnungManager from './eingewoehnung-manager'
import AiEingewoehnungUeberblick from './ai-eingewoehnung-ueberblick'

export const metadata = { title: 'Eingewöhnung' }

export default async function EingewoehnungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead', 'educator'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: processes }, { data: children }] = await Promise.all([
    supabase.from('eingewoehnung_processes')
      .select('*, children:child_id(first_name, last_name)')
      .eq('site_id', siteId)
      .order('start_date', { ascending: false }),
    supabase.from('children')
      .select('id, first_name, last_name')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('first_name'),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Eingewöhnung</h1>
          <p className="text-sm text-gray-400">{(processes ?? []).filter((p: any) => p.status === 'active').length} aktive Prozesse</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center">
          <Baby size={20} className="text-pink-600" />
        </div>
      </div>

      <AiEingewoehnungUeberblick />

      <EingewoehnungManager
        processes={(processes ?? []) as any[]}
        children={(children ?? []) as any[]}
        siteId={siteId}
      />
    </div>
  )
}
