import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import GuardianManager from './guardian-manager'
import AiGuardian from './ai-guardian'

export const metadata = { title: 'Erziehungsberechtigte' }

export default async function GuardiansPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: child } = await supabase
    .from('children').select('id, first_name, last_name').eq('id', params.id).eq('site_id', siteId).single()
  if (!child) notFound()

  const { data: guardians } = await supabase
    .from('guardians').select('*').eq('child_id', params.id).order('is_primary', { ascending: false })

  // All registered users for linking
  const { data: siteUsers } = await supabase
    .from('profiles').select('id, full_name, role').eq('site_id', siteId).eq('role', 'parent')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/kinder" className="text-xs text-brand-600 mb-1 block">← Kinder</Link>
        <h1 className="text-2xl font-bold text-gray-900">Erziehungsberechtigte</h1>
        <p className="text-sm text-gray-500 mt-0.5">{child.first_name} {child.last_name}</p>
      </div>
      <AiGuardian childId={params.id} />
      <GuardianManager
        childId={params.id}
        guardians={guardians ?? []}
        siteUsers={siteUsers ?? []}
      />
    </div>
  )
}
