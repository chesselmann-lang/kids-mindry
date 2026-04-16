import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import RundschreibenClient from './rundschreiben-client'
import AiRundschreibenAnalyse from './ai-rundschreiben-analyse'

export const metadata = { title: 'Rundschreiben & Push-Nachrichten' }

export default async function RundschreibenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load groups for targeting
  const { data: groups } = await supabase
    .from('groups').select('id, name, color').eq('site_id', siteId).order('name')

  // Count parents
  const { count: parentCount } = await supabase
    .from('profiles').select('id', { count: 'exact', head: true })
    .eq('site_id', siteId).eq('role', 'parent')

  // Count push subscriptions
  const { count: pushCount } = await supabase
    .from('push_subscriptions').select('id', { count: 'exact', head: true })
    .eq('site_id', siteId)

  // Recent broadcasts (notifications sent as type=broadcast)
  const { data: recent } = await supabase
    .from('notifications')
    .select('id, title, body, created_at, data')
    .eq('type', 'broadcast')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Rundschreiben</h1>
          <p className="text-sm text-gray-400">Push-Nachrichten & Sofortmitteilungen</p>
        </div>
      </div>

      <AiRundschreibenAnalyse />

      <RundschreibenClient
        siteId={siteId}
        staffId={user.id}
        groups={(groups ?? []) as any[]}
        parentCount={parentCount ?? 0}
        pushCount={pushCount ?? 0}
        recent={(recent ?? []) as any[]}
      />
    </div>
  )
}
