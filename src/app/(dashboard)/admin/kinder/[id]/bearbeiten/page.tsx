import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import KindForm from '../../neu/kind-form'
import AiKindCheck from './ai-kind-check'

export const metadata = { title: 'Kind bearbeiten' }

export default async function KindBearbeitenPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: child } = await supabase
    .from('children').select('*').eq('id', params.id).eq('site_id', siteId).single()
  if (!child) notFound()

  const { data: groups } = await supabase
    .from('groups').select('id, name, color').eq('site_id', siteId).order('name')

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/kinder" className="text-xs text-brand-600 mb-1 block">← Kinder</Link>
        <h1 className="text-2xl font-bold text-gray-900">Kind bearbeiten</h1>
        <p className="text-sm text-gray-500 mt-0.5">{child.first_name} {child.last_name}</p>
      </div>
      <AiKindCheck childId={params.id} />
      <KindForm
        groups={groups ?? []}
        siteId={siteId}
        initialData={{
          id: child.id,
          first_name: child.first_name,
          last_name: child.last_name,
          date_of_birth: child.date_of_birth,
          gender: child.gender,
          group_id: child.group_id,
          allergies: child.allergies,
          medical_notes: child.medical_notes,
          status: child.status,
        }}
      />
    </div>
  )
}
