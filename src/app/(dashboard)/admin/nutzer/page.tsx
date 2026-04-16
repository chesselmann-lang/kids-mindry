import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NutzerManager from './nutzer-manager'
import AiNutzerAnalyse from './ai-nutzer-analyse'

export const metadata = { title: 'Nutzer' }

export default async function NutzerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-xs text-brand-600 mb-1 block">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Nutzer & Einladungen</h1>
        <p className="text-sm text-gray-500">{(users ?? []).length} registrierte Nutzer</p>
      </div>
      <AiNutzerAnalyse />

      <NutzerManager users={users ?? []} siteId={siteId} />
    </div>
  )
}
