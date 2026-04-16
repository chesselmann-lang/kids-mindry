import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import KindForm from './kind-form'
import AiKindNeu from './ai-kind-neu'

export const metadata = { title: 'Kind anlegen' }

export default async function NeuesKindPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data: groups } = await supabase
    .from('groups').select('id, name, color').eq('site_id', siteId).order('name')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/kinder" className="text-xs text-brand-600 mb-1 block">← Kinder</Link>
        <h1 className="text-2xl font-bold text-gray-900">Kind anlegen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Neues Kind in der Kita erfassen</p>
      </div>
      <AiKindNeu />
      <KindForm groups={groups ?? []} siteId={siteId} />
    </div>
  )
}
