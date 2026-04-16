import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import IntegrationsClient from './integrationen-client'
import AiIntegrationenCheck from './ai-integrationen-check'

export const metadata = { title: 'Integrationen' }

export default async function IntegrationenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (!['admin'].includes((profile as any)?.role ?? '')) redirect('/feed')

  const siteId = (profile as any).site_id

  const { data: zoomInt } = await supabase
    .from('zoom_integrations')
    .select('email')
    .eq('site_id', siteId)
    .maybeSingle()

  const lexofficeConfigured = !!process.env.LEXOFFICE_API_KEY

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-4">
      <Link href="/admin" className="text-xs text-brand-600 block">← Admin</Link>
      <AiIntegrationenCheck />
      <IntegrationsClient
        zoomConnected={!!zoomInt}
        zoomEmail={zoomInt?.email ?? undefined}
        lexofficeConfigured={lexofficeConfigured}
      />
    </div>
  )
}
