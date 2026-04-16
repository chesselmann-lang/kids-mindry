import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Pin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import PinnwandManager from './pinnwand-manager'
import AiPinnwandZusammenfassung from './ai-pinnwand-zusammenfassung'

export const metadata = { title: 'Pinnwand' }

export default async function PinnwandPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: posts } = await supabase
    .from('bulletin_posts')
    .select('*, profiles:author_id(full_name, role)')
    .eq('site_id', siteId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pinnwand</h1>
          <p className="text-sm text-gray-400">Aushänge & Infos</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-yellow-100 flex items-center justify-center">
          <Pin size={20} className="text-yellow-600" />
        </div>
      </div>

      <AiPinnwandZusammenfassung />

      <PinnwandManager
        posts={(posts ?? []) as any[]}
        userId={user.id}
        siteId={siteId}
        isAdmin={isAdmin}
        isStaff={isStaff}
      />
    </div>
  )
}
