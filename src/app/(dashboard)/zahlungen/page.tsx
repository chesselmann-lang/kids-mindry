import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ZahlungenClient from './zahlungen-client'
import AiZahlungenAnalyse from './ai-zahlungen-analyse'

export default async function ZahlungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('site_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Payment items for this site
  const { data: items } = await supabase
    .from('payment_items')
    .select('*')
    .eq('site_id', profile.site_id as string)
    .order('created_at', { ascending: false })

  // User's payments
  const { data: payments } = await supabase
    .from('payments')
    .select('payment_item_id, status, paid_at, amount')
    .eq('user_id', user.id)

  const paidItemIds = new Set(
    (payments ?? [])
      .filter(p => p.status === 'paid' && p.payment_item_id != null)
      .map(p => p.payment_item_id as string)
  )

  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  return (
    <div className="space-y-4">
      {isAdmin && <AiZahlungenAnalyse />}
      <ZahlungenClient
        items={items ?? []}
        paidItemIds={[...paidItemIds]}
        userId={user.id}
        role={(profile as any).role ?? 'parent'}
      />
    </div>
  )
}
