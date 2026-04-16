import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GruppenManager from './gruppen-manager'
import AiGruppenAnalyse from './ai-gruppen-analyse'
import AiGruppenNewsletter from './ai-gruppen-newsletter'

export const metadata = { title: 'Gruppen' }

export default async function GruppenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: groups } = await supabase
    .from('groups').select('*').eq('site_id', siteId).order('name')

  // Child count per group
  const { data: children } = await supabase
    .from('children').select('group_id').eq('site_id', siteId).eq('status', 'active')

  const childCountMap: Record<string, number> = {}
  ;(children ?? []).forEach(c => {
    if (c.group_id) childCountMap[c.group_id] = (childCountMap[c.group_id] ?? 0) + 1
  })

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-xs text-brand-600 mb-1 block">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Gruppen</h1>
        <p className="text-sm text-gray-500">{(groups ?? []).length} Gruppen</p>
      </div>
      <AiGruppenAnalyse />
      <AiGruppenNewsletter groups={(groups ?? []).map((g: any) => ({ id: g.id, name: g.name, color: g.color }))} />

      <GruppenManager groups={groups ?? []} childCountMap={childCountMap} siteId={siteId} />
    </div>
  )
}
