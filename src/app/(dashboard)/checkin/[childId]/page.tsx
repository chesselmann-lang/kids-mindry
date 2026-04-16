import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CheckinClient from './checkin-client'
import AiCheckin from './ai-checkin'

export const metadata = { title: 'Check-in' }

export default async function CheckinPage({ params }: { params: { childId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/checkin/${params.childId}`)

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: child } = await supabase
    .from('children')
    .select('id, first_name, last_name, site_id, status')
    .eq('id', params.childId)
    .single()

  if (!child || (child as any).site_id !== siteId || (child as any).status !== 'active') {
    notFound()
  }

  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('id, status')
    .eq('child_id', params.childId)
    .eq('date', today)
    .maybeSingle()

  const c = child as any
  const childName = `${c.first_name} ${c.last_name}`

  return (
    <div className="space-y-4">
      <AiCheckin childName={c.first_name} />
      <CheckinClient
        childId={params.childId}
        childName={childName}
        siteId={siteId}
        todayAttendance={todayAttendance as any}
      />
    </div>
  )
}
