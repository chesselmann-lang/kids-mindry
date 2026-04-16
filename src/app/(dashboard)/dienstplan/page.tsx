import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { startOfWeek, addDays, format } from 'date-fns'
import { de } from 'date-fns/locale'
import DienstplanClient from './dienstplan-client'
import AiDienstplanAnalyse from './ai-dienstplan-analyse'

export const metadata = { title: 'Dienstplan' }

export default async function DienstplanPage({
  searchParams
}: { searchParams: { week?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const today = new Date()
  const weekStart = searchParams.week
    ? new Date(searchParams.week + 'T12:00:00')
    : startOfWeek(today, { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  const weekEnd = addDays(weekStart, 6)
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd')

  // Get staff
  const { data: staffMembers } = await supabase
    .from('profiles').select('id, full_name, role')
    .eq('site_id', siteId)
    .in('role', ['educator', 'group_lead', 'admin', 'caretaker'])
    .order('full_name')

  // Get shifts for this week
  const { data: shifts } = await supabase
    .from('shifts')
    .select('*, profiles:staff_id(full_name)')
    .eq('site_id', siteId)
    .gte('shift_date', weekStartStr)
    .lte('shift_date', weekEndStr)
    .order('shift_date').order('start_time')

  const days = Array.from({ length: 5 }, (_, i) => ({
    date: format(addDays(weekStart, i), 'yyyy-MM-dd'),
    label: format(addDays(weekStart, i), 'EEE d.', { locale: de }),
    isToday: format(addDays(weekStart, i), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'),
  }))

  const prevWeek = format(addDays(weekStart, -7), 'yyyy-MM-dd')
  const nextWeek = format(addDays(weekStart, 7), 'yyyy-MM-dd')
  const weekLabel = `${format(weekStart, 'd. MMM', { locale: de })} – ${format(weekEnd, 'd. MMM yyyy', { locale: de })}`

  return (
    <div className="space-y-4">
      {isAdmin && <AiDienstplanAnalyse weekStart={weekStartStr} isAdmin={isAdmin} />}
      <DienstplanClient
        days={days}
        shifts={(shifts ?? []) as any[]}
        staffMembers={(staffMembers ?? []) as any[]}
        weekLabel={weekLabel}
        prevWeek={prevWeek}
        nextWeek={nextWeek}
        isAdmin={isAdmin}
        userId={user.id}
        siteId={siteId}
      />
    </div>
  )
}
