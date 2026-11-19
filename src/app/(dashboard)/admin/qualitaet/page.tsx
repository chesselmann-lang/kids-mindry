import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QualitaetsDashboard from './qualitaets-dashboard'

export const metadata = { title: 'KI-Qualitätssicherung' }
export const dynamic = 'force-dynamic'

export default async function QualitaetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = ['admin', 'group_lead'].includes(profile?.role ?? '')
  if (!isAdmin) redirect('/feed')

  return <QualitaetsDashboard />
}
