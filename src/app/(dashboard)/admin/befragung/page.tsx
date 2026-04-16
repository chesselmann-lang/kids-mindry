import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import BefragungManager from './befragung-manager'
import AiBefragungAnalyse from './ai-befragung-analyse'

export const metadata = { title: 'Elternbefragung' }

export default async function BefragungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*, survey_responses(id)')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Elternbefragung</h1>
          <p className="text-sm text-gray-400">Umfragen erstellen & auswerten</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
          <BarChart2 size={20} className="text-violet-600" />
        </div>
      </div>

      <AiBefragungAnalyse />

      <BefragungManager surveys={(surveys ?? []) as any[]} siteId={siteId} />
    </div>
  )
}
