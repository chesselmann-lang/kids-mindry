import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SteuerbescheinigungView from './steuerbescheinigung-view'
import AiSteuer from './ai-steuer'

export const metadata = { title: 'Steuerbescheinigung' }

export default async function SteuerbescheinigungPage({
  searchParams,
}: {
  searchParams: { year?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const year = parseInt(searchParams.year ?? String(new Date().getFullYear() - 1))
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, site_id')
    .eq('id', user.id)
    .single()

  // Get all paid payments for this user in the given year
  const { data: payments } = await supabase
    .from('payments')
    .select('*, payment_items(title, description, amount_cents, due_date)')
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`)
    .order('created_at', { ascending: true })

  // Get children linked to this parent
  const { data: guardians } = await supabase
    .from('guardians')
    .select('children(first_name, last_name, date_of_birth)')
    .eq('user_id', user.id)

  const children = (guardians ?? [])
    .flatMap((g: any) => g.children ? [g.children] : [])

  // Get Kita info
  const { data: site } = await supabase
    .from('sites')
    .select('name, address, city, zip, phone, email')
    .eq('id', siteId)
    .single()

  const totalCents = (payments ?? []).reduce(
    (sum: number, p: any) => sum + (p.payment_items?.amount_cents ?? 0), 0
  )

  return (
    <div className="space-y-4">
      <AiSteuer year={year} />
      <SteuerbescheinigungView
        year={year}
        payments={(payments ?? []) as any[]}
        totalCents={totalCents}
        parentName={(profile as any)?.full_name ?? ''}
        children={children}
        site={(site as any) ?? {}}
      />
    </div>
  )
}
