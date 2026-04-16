import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EinstellungenForm from './einstellungen-form'
import AiEinstellungenCheck from './ai-einstellungen-check'

export const metadata = { title: 'Kita-Einstellungen' }

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data: site } = await supabase.from('sites').select('*').eq('id', siteId).single()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-xs text-brand-600 mb-1 block">← Admin</Link>
        <h1 className="text-2xl font-bold text-gray-900">Kita-Einstellungen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Name, Adresse und Kontaktdaten</p>
      </div>
      <AiEinstellungenCheck />
      <EinstellungenForm site={site} siteId={siteId} />
    </div>
  )
}
