import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, StickyNote } from 'lucide-react'
import NotizenClient from './notizen-client'
import AiNotizenAktionsliste from './ai-notizen-aktionsliste'

export const metadata = { title: 'Schnellnotizen' }

export default async function NotizenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: notes } = await supabase
    .from('quick_notes')
    .select('*, profiles:author_id(full_name)')
    .eq('site_id', siteId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Schnellnotizen</h1>
          <p className="text-sm text-gray-400">Haftzettel für das Team</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
          <StickyNote size={20} className="text-amber-600" />
        </div>
      </div>

      <AiNotizenAktionsliste />

      <NotizenClient
        notes={(notes ?? []) as any[]}
        userId={user.id}
        siteId={siteId}
      />
    </div>
  )
}
