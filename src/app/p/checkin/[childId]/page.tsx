import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import PublicCheckinClient from './public-checkin-client'

export const metadata = { title: 'Check-in' }

export default async function PublicCheckinPage({ params }: { params: { childId: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get: (n: string) => cookieStore.get(n)?.value } }
  )

  const { data: child } = await supabase
    .from('children')
    .select('id, first_name, last_name, photo_url, group_id, groups(name, color)')
    .eq('id', params.childId)
    .eq('status', 'active')
    .single()

  if (!child) notFound()

  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('id, status, check_in_at, check_out_at')
    .eq('child_id', params.childId)
    .eq('date', today)
    .maybeSingle()

  return (
    <PublicCheckinClient
      child={child as any}
      todayAttendance={todayAttendance as any}
    />
  )
}
