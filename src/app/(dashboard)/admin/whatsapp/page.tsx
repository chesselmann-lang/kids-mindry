import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WhatsAppBroadcast from '@/components/features/whatsapp-broadcast'
import AiWhatsapp from './ai-whatsapp'

export const metadata = { title: 'WhatsApp Broadcast' }

export default async function WhatsAppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  const isStaff = ['admin', 'educator', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-4 px-4">
      <Link href="/admin" className="text-xs text-brand-600 block">← Admin</Link>
      <AiWhatsapp />
      <WhatsAppBroadcast />
    </div>
  )
}
