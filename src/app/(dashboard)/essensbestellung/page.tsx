import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MealOrderClient from './meal-order-client'
import AiEssensbestellungAnalyse from './ai-essensbestellung-analyse'
import { startOfWeek, addDays, format } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Essensbestellung' }

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const dayLabels = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']

export default async function EssensbestellungPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Calculate week start (Monday)
  const today = new Date()
  const weekStart = searchParams.week
    ? new Date(searchParams.week + 'T12:00:00')
    : startOfWeek(today, { weekStartsOn: 1 })
  const weekStartStr = format(weekStart, 'yyyy-MM-dd')

  // Get speiseplan for this week
  const { data: weeklyMenu } = await supabase
    .from('weekly_menus')
    .select('*')
    .eq('site_id', siteId)
    .eq('week_start', weekStartStr)
    .maybeSingle()

  const menuByDay: Record<string, any> = {}
  if (weeklyMenu) {
    for (const key of dayKeys) {
      menuByDay[key] = (weeklyMenu as any)[key]
    }
  }

  // Compute dates for each day
  const weekDates = dayKeys.map((_, i) => format(addDays(weekStart, i), 'dd.MM.', { locale: de }))

  // Get children based on role
  let children: any[] = []
  if (isStaff) {
    const { data } = await supabase.from('children').select('id, first_name, last_name')
      .eq('site_id', siteId).eq('status', 'active').order('first_name')
    children = data ?? []
  } else {
    const { data: guardians } = await supabase
      .from('guardians').select('child_id, children(id, first_name, last_name)')
      .eq('user_id', user.id)
    children = (guardians ?? []).filter(g => g.children).map(g => g.children as any)
  }

  // Load existing orders for this week
  const childIds = children.map(c => c.id)
  let existingOrders: Record<string, Record<string, boolean>> = {}
  if (childIds.length > 0) {
    const { data: orders } = await supabase
      .from('meal_orders')
      .select('child_id, orders')
      .in('child_id', childIds)
      .eq('week_start', weekStartStr)
    for (const o of orders ?? []) {
      existingOrders[(o as any).child_id] = (o as any).orders
    }
  }

  // Prev/next week
  const prevWeek = format(addDays(weekStart, -7), 'yyyy-MM-dd')
  const nextWeek = format(addDays(weekStart, 7), 'yyyy-MM-dd')
  const weekLabel = `${format(weekStart, 'd. MMM', { locale: de })} – ${format(addDays(weekStart, 4), 'd. MMM yyyy', { locale: de })}`

  return (
    <div className="space-y-4">
      {isStaff && <AiEssensbestellungAnalyse />}
      <MealOrderClient
      children={children}
      dayKeys={dayKeys}
      dayLabels={dayLabels}
      weekDates={weekDates}
      weekStartStr={weekStartStr}
      weekLabel={weekLabel}
      menuByDay={menuByDay}
      existingOrders={existingOrders}
      userId={user.id}
      siteId={siteId}
      prevWeek={prevWeek}
      nextWeek={nextWeek}
      isStaff={isStaff}
    />
    </div>
  )
}
