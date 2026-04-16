import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight } from 'lucide-react'
import UebergabeManager from './uebergabe-manager'
import AiUebergabeAnalyse from './ai-uebergabe-analyse'
import AiUebergabeEntwurf from './ai-uebergabe-entwurf'

export const metadata = { title: 'Gruppenübergabe' }

export default async function UebergabePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const [{ data: handovers }, { data: groups }] = await Promise.all([
    supabase.from('group_handovers')
      .select('*, profiles:author_id(full_name), groups:group_id(name)')
      .eq('site_id', siteId)
      .order('handover_date', { ascending: false })
      .limit(30),
    supabase.from('groups').select('id, name').eq('site_id', siteId).order('name'),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Gruppenübergabe</h1>
          <p className="text-sm text-gray-400">Protokolle & Übergabenotizen</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
          <ArrowLeftRight size={20} className="text-amber-600" />
        </div>
      </div>

      <AiUebergabeEntwurf />
      <AiUebergabeAnalyse />

      <UebergabeManager
        handovers={(handovers ?? []) as any[]}
        groups={(groups ?? []) as any[]}
        userId={user.id}
        siteId={siteId}
        today={today}
      />
    </div>
  )
}
