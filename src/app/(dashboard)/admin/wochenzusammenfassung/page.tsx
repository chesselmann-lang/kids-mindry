import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BarChart2 } from 'lucide-react'
import { startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'
import { de } from 'date-fns/locale'
import AiWochenanalyse from './ai-wochenanalyse'

export const metadata = { title: 'Wochenzusammenfassung' }

export default async function WochenzusammenfassungPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Last week range
  const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const lastWeekEnd   = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 })
  const lwFrom = lastWeekStart.toISOString().split('T')[0]
  const lwTo   = lastWeekEnd.toISOString().split('T')[0]

  // This week range
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const thisWeekEnd   = endOfWeek(new Date(), { weekStartsOn: 1 })
  const twFrom = thisWeekStart.toISOString().split('T')[0]
  const twTo   = thisWeekEnd.toISOString().split('T')[0]

  const [
    { count: lwPresent },
    { count: lwSick },
    { count: lwObservations },
    { count: lwIncidents },
    { count: lwOrders },
    { count: twEvents },
    { data: topObservers },
    { data: birthdays },
  ] = await Promise.all([
    supabase.from('attendance').select('id', { count: 'exact', head: true })
      .eq('site_id', siteId).eq('status', 'present').gte('date', lwFrom).lte('date', lwTo),
    supabase.from('attendance').select('id', { count: 'exact', head: true })
      .eq('site_id', siteId).eq('status', 'absent_sick').gte('date', lwFrom).lte('date', lwTo),
    supabase.from('observations').select('id', { count: 'exact', head: true })
      .eq('site_id', siteId).gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
    supabase.from('incidents').select('id', { count: 'exact', head: true })
      .eq('site_id', siteId).gte('created_at', lastWeekStart.toISOString()).lte('created_at', lastWeekEnd.toISOString()),
    supabase.from('material_orders').select('id', { count: 'exact', head: true })
      .eq('site_id', siteId).eq('status', 'pending'),
    supabase.from('events').select('id', { count: 'exact', head: true })
      .eq('site_id', siteId).gte('starts_at', thisWeekStart.toISOString()).lte('starts_at', thisWeekEnd.toISOString()),
    // Top observers last week
    supabase.from('observations')
      .select('author_id, profiles:author_id(full_name)')
      .eq('site_id', siteId)
      .gte('created_at', lastWeekStart.toISOString())
      .lte('created_at', lastWeekEnd.toISOString()),
    // Birthdays this week
    supabase.from('children').select('id, first_name, last_name, date_of_birth')
      .eq('site_id', siteId).eq('status', 'active').not('date_of_birth', 'is', null),
  ])

  // Count observations per author
  const observerMap: Record<string, { name: string; count: number }> = {}
  ;(topObservers ?? []).forEach((o: any) => {
    const id = o.author_id
    if (!observerMap[id]) observerMap[id] = { name: o.profiles?.full_name ?? 'Unbekannt', count: 0 }
    observerMap[id].count++
  })
  const topObserverList = Object.values(observerMap).sort((a, b) => b.count - a.count).slice(0, 3)

  // Birthday children this week (by month/day only)
  const thisMonDay = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(thisWeekStart)
    d.setDate(d.getDate() + i)
    return thisMonDay(d)
  })
  const birthdayKids = (birthdays ?? []).filter((c: any) => {
    if (!c.date_of_birth) return false
    const md = c.date_of_birth.slice(5, 10) // MM-DD
    return weekDays.includes(md)
  })

  const lwLabel = `${format(lastWeekStart, 'd. MMM', { locale: de })} – ${format(lastWeekEnd, 'd. MMM', { locale: de })}`
  const twLabel = `${format(thisWeekStart, 'd. MMM', { locale: de })} – ${format(thisWeekEnd, 'd. MMM', { locale: de })}`

  const stats = [
    { label: 'Anwesenheitstage (Vorwoche)', value: lwPresent ?? 0, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Kranktage (Vorwoche)',        value: lwSick ?? 0,    color: 'text-red-500',   bg: 'bg-red-50' },
    { label: 'Beobachtungen (Vorwoche)',    value: lwObservations ?? 0, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Vorfälle (Vorwoche)',         value: lwIncidents ?? 0,    color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Bestellungen offen',          value: lwOrders ?? 0,       color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Termine diese Woche',         value: twEvents ?? 0,       color: 'text-blue-600',   bg: 'bg-blue-50' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Wochenzusammenfassung</h1>
          <p className="text-sm text-gray-400">Diese Woche: {twLabel}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <BarChart2 size={20} className="text-indigo-600" />
        </div>
      </div>

      {/* KPI grid */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Vorwoche · {lwLabel}</p>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`card p-4 ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Wochenanalyse */}
      <AiWochenanalyse />

      {/* Top observers */}
      {topObserverList.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Aktivste Beobachter · Vorwoche</p>
          <div className="space-y-2">
            {topObserverList.map((o, i) => (
              <div key={o.name} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-xs font-bold text-teal-700">
                  {i + 1}
                </div>
                <p className="flex-1 text-sm font-medium text-gray-800">{o.name}</p>
                <p className="text-sm font-bold text-teal-600">{o.count}×</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Birthdays this week */}
      {birthdayKids.length > 0 && (
        <div className="card p-4 bg-amber-50">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-3">🎂 Geburtstage diese Woche</p>
          <div className="space-y-1.5">
            {birthdayKids.map((c: any) => {
              const dob = new Date(c.date_of_birth)
              const age = new Date().getFullYear() - dob.getFullYear()
              return (
                <div key={c.id} className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">{c.first_name} {c.last_name}</p>
                  <p className="text-xs text-amber-600 font-semibold">
                    {format(dob, 'd. MMM', { locale: de })} · {age} Jahre
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/statistik" className="card p-4 text-center hover:shadow-card-hover transition-shadow">
          <BarChart2 size={24} className="text-brand-500 mx-auto mb-1" />
          <p className="text-xs font-semibold text-gray-700">Statistiken</p>
        </Link>
        <Link href="/kalender" className="card p-4 text-center hover:shadow-card-hover transition-shadow">
          <span className="text-2xl">📅</span>
          <p className="text-xs font-semibold text-gray-700 mt-1">Kalender</p>
        </Link>
      </div>
    </div>
  )
}
