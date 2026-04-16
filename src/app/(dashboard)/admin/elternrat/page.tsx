import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ElternratManager from './elternrat-manager'
import AiElternratAnalyse from './ai-elternrat-analyse'

export const metadata = { title: 'Elternrat verwalten' }

export default async function AdminElternratPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Get parents from site
  const { data: parents } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('site_id', siteId)
    .eq('role', 'parent')
    .order('full_name')

  const { data: members } = await supabase
    .from('council_members')
    .select('*, profiles:user_id(full_name)')
    .eq('site_id', siteId)
    .order('position_order')

  const { data: meetings } = await supabase
    .from('council_meetings')
    .select('*')
    .eq('site_id', siteId)
    .order('meeting_date', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Elternrat verwalten</h1>
          <p className="text-sm text-gray-400">Mitglieder & Sitzungen</p>
        </div>
      </div>

      <AiElternratAnalyse />

      <ElternratManager
        siteId={siteId}
        staffId={user.id}
        parents={(parents ?? []) as any[]}
        members={(members ?? []) as any[]}
        meetings={(meetings ?? []) as any[]}
      />
    </div>
  )
}
