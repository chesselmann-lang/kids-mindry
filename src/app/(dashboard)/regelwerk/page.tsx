import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'
import RegelwerkManager from './regelwerk-manager'
import AiRegelwerkAnalyse from './ai-regelwerk-analyse'

export const metadata = { title: 'Kita-Regelwerk' }

export default async function RegelwerkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: rules } = await supabase
    .from('rulebook_entries')
    .select('*')
    .eq('site_id', siteId)
    .order('category', { ascending: true })
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Kita-Regelwerk</h1>
          <p className="text-sm text-gray-400">Richtlinien & Verfahren</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Scale size={20} className="text-slate-600" />
        </div>
      </div>

      {isStaff && <AiRegelwerkAnalyse />}

      <RegelwerkManager
        rules={(rules ?? []) as any[]}
        isAdmin={isAdmin}
        siteId={siteId}
      />
    </div>
  )
}
