import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import TraegerClient from './traeger-client'
import AiTraegerAnalyse from './ai-traeger-analyse'

export default async function TraegerDashboardPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/')

  // Alle Kitas des Trägers
  const { data: kitas } = await supabase
    .from('sites')
    .select('id, name, city, max_children, created_at')
    .order('name')

  // Stats pro Kita
  const kitaIds = (kitas ?? []).map(k => k.id)
  
  const [
    { data: childrenCounts },
    { data: openPayments },
    { data: announcements },
  ] = await Promise.all([
    supabase.from('children').select('site_id').in('site_id', kitaIds),
    supabase.from('payment_items').select('site_id, amount, status').in('site_id', kitaIds).eq('status', 'open'),
    supabase.from('announcements').select('site_id, created_at').in('site_id', kitaIds).gte('created_at', new Date(Date.now() - 30*24*3600*1000).toISOString()),
  ])

  const statsMap: Record<string, { kinder: number; offeneZahlungen: number; offenerBetrag: number; neueMitteilungen: number }> = {}
  for (const kita of (kitas ?? [])) {
    statsMap[kita.id] = {
      kinder: (childrenCounts ?? []).filter(c => c.site_id === kita.id).length,
      offeneZahlungen: (openPayments ?? []).filter(p => p.site_id === kita.id).length,
      offenerBetrag: (openPayments ?? []).filter(p => p.site_id === kita.id).reduce((s, p) => s + (p.amount ?? 0), 0),
      neueMitteilungen: (announcements ?? []).filter(a => a.site_id === kita.id).length,
    }
  }

  return (
    <div className="space-y-4">
      <AiTraegerAnalyse />
      <TraegerClient kitas={kitas ?? []} statsMap={statsMap} />
    </div>
  )
}
