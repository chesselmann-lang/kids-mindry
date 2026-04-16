import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LayoutGrid } from 'lucide-react'
import RaumplanClient from './raumplan-client'
import AiRaumplanAnalyse from './ai-raumplan-analyse'

export const metadata = { title: 'Raumplan' }

export default async function RaumplanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: rooms }, { data: groups }] = await Promise.all([
    supabase.from('rooms').select('*').eq('site_id', siteId).order('name'),
    supabase.from('groups').select('id, name, color').eq('site_id', siteId).order('name'),
  ])

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Raumplan</h1>
          <p className="text-sm text-gray-400">{(rooms ?? []).length} Räume</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-teal-100 flex items-center justify-center">
          <LayoutGrid size={20} className="text-teal-600" />
        </div>
      </div>

      {isStaff && <AiRaumplanAnalyse />}

      <RaumplanClient
        rooms={(rooms ?? []) as any[]}
        groups={(groups ?? []) as any[]}
        isAdmin={isAdmin}
        siteId={siteId}
      />
    </div>
  )
}
