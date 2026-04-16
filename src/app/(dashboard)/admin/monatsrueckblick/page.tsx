import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CalendarRange } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { de } from 'date-fns/locale'
import AiMonatsbrief from './ai-monatsbrief'

export const metadata = { title: 'Monatsrückblick' }

export default async function MonatsrueckblickPage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Determine month
  const monthParam = searchParams.month ?? new Date().toISOString().slice(0, 7)
  const monthDate = new Date(monthParam + '-01')
  const monthStart = startOfMonth(monthDate)
  const monthEnd   = endOfMonth(monthDate)
  const monthLabel = format(monthDate, 'MMMM yyyy', { locale: de })

  const prevMonth = new Date(monthDate)
  prevMonth.setMonth(prevMonth.getMonth() - 1)
  const nextMonth = new Date(monthDate)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const isCurrentMonth = monthParam === new Date().toISOString().slice(0, 7)

  const [{ data: children }, { data: attendance }, { data: events }, { data: incidents }] = await Promise.all([
    supabase.from('children').select('id, first_name, last_name, group_id')
      .eq('site_id', siteId).eq('status', 'active'),
    supabase.from('attendance').select('child_id, date, status')
      .eq('site_id', siteId)
      .gte('date', monthStart.toISOString().split('T')[0])
      .lte('date', monthEnd.toISOString().split('T')[0]),
    supabase.from('events').select('id, title, starts_at, color')
      .eq('site_id', siteId)
      .gte('starts_at', monthStart.toISOString())
      .lte('starts_at', monthEnd.toISOString())
      .order('starts_at'),
    supabase.from('incidents').select('id, title, created_at, severity')
      .eq('site_id', siteId)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString()),
  ])

  const totalChildren = (children ?? []).length

  // Aggregate attendance by date
  const attByDate: Record<string, { present: number; sick: number; absent: number }> = {}
  ;(attendance ?? []).forEach((a: any) => {
    if (!attByDate[a.date]) attByDate[a.date] = { present: 0, sick: 0, absent: 0 }
    if (a.status === 'present') attByDate[a.date].present++
    else if (a.status === 'absent_sick') attByDate[a.date].sick++
    else attByDate[a.date].absent++
  })

  // Events by date
  const eventsByDate: Record<string, any[]> = {}
  ;(events ?? []).forEach((e: any) => {
    const d = e.starts_at.split('T')[0]
    if (!eventsByDate[d]) eventsByDate[d] = []
    eventsByDate[d].push(e)
  })

  // Incidents by date
  const incidentsByDate: Record<string, number> = {}
  ;(incidents ?? []).forEach((i: any) => {
    const d = i.created_at.split('T')[0]
    incidentsByDate[d] = (incidentsByDate[d] ?? 0) + 1
  })

  // Calendar grid
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const firstDow = getDay(monthStart) // 0=Sun
  const leadingBlanks = firstDow === 0 ? 6 : firstDow - 1 // Mon-based

  // Monthly totals
  const monthPresent = Object.values(attByDate).reduce((s, d) => s + d.present, 0)
  const monthSick    = Object.values(attByDate).reduce((s, d) => s + d.sick, 0)
  const workdays     = days.filter(d => { const dow = getDay(d); return dow !== 0 && dow !== 6 }).length
  const avgPresent   = workdays > 0 ? (monthPresent / workdays).toFixed(1) : '–'

  const DOW_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Monatsrückblick</h1>
          <p className="text-sm text-gray-400">{monthLabel}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
          <CalendarRange size={20} className="text-blue-600" />
        </div>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Link href={`?month=${prevMonth.toISOString().slice(0, 7)}`}
          className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200">
          ← Vormonat
        </Link>
        <span className="text-sm font-bold text-gray-800">{monthLabel}</span>
        {!isCurrentMonth && (
          <Link href={`?month=${nextMonth.toISOString().slice(0, 7)}`}
            className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200">
            Nächster →
          </Link>
        )}
        {isCurrentMonth && <div className="w-24" />}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="card p-3 text-center">
          <p className="text-lg font-bold text-gray-800">{workdays}</p>
          <p className="text-[10px] text-gray-400">Werktage</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-lg font-bold text-green-600">{avgPresent}</p>
          <p className="text-[10px] text-gray-400">Ø Anwesend</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-lg font-bold text-red-500">{monthSick}</p>
          <p className="text-[10px] text-gray-400">Kranktage</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-lg font-bold text-amber-500">{(incidents ?? []).length}</p>
          <p className="text-[10px] text-gray-400">Vorfälle</p>
        </div>
      </div>

      {/* AI Monatsbrief */}
      <AiMonatsbrief month={monthParam} monthLabel={monthLabel} />

      {/* Calendar heat map */}
      <div className="card p-4">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DOW_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400">{d}</div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leading blanks */}
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {days.map(day => {
            const ds = format(day, 'yyyy-MM-dd')
            const att = attByDate[ds]
            const dow = getDay(day)
            const isWeekend = dow === 0 || dow === 6
            const isToday = ds === new Date().toISOString().split('T')[0]
            const evs = eventsByDate[ds] ?? []
            const incs = incidentsByDate[ds] ?? 0
            const presentPct = att && totalChildren > 0 ? att.present / totalChildren : 0
            // Color intensity based on attendance
            const bgClass = isWeekend ? 'bg-gray-50' :
              !att ? 'bg-gray-100' :
              presentPct >= 0.8 ? 'bg-green-200' :
              presentPct >= 0.5 ? 'bg-green-100' :
              presentPct >= 0.2 ? 'bg-amber-100' : 'bg-red-100'

            return (
              <div key={ds}
                className={`rounded-lg p-1 min-h-[44px] ${bgClass} ${isToday ? 'ring-2 ring-brand-400' : ''} relative`}>
                <p className={`text-[10px] font-bold ${isToday ? 'text-brand-700' : isWeekend ? 'text-gray-400' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </p>
                {att && !isWeekend && (
                  <p className="text-[9px] text-gray-600 font-semibold">{att.present}</p>
                )}
                {evs.length > 0 && (
                  <div className="mt-0.5 flex gap-0.5 flex-wrap">
                    {evs.slice(0, 2).map((e: any) => (
                      <div key={e.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color ?? '#8B5CF6' }} title={e.title} />
                    ))}
                  </div>
                )}
                {incs > 0 && (
                  <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold">{incs}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-3 flex-wrap">
          {[
            { bg: 'bg-green-200', label: '≥80% anwesend' },
            { bg: 'bg-green-100', label: '50–79%' },
            { bg: 'bg-amber-100', label: '20–49%' },
            { bg: 'bg-red-100',   label: '<20%' },
            { bg: 'bg-gray-100',  label: 'Keine Daten' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${l.bg}`} />
              <span className="text-[9px] text-gray-400">{l.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-400" />
            <span className="text-[9px] text-gray-400">Vorfall</span>
          </div>
        </div>
      </div>

      {/* Events this month */}
      {(events ?? []).length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Veranstaltungen im {format(monthDate, 'MMMM', { locale: de })}</p>
          <div className="space-y-1.5">
            {(events ?? []).map((e: any) => (
              <div key={e.id} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color ?? '#8B5CF6' }} />
                <span className="text-xs text-gray-500 flex-shrink-0 w-14">
                  {format(new Date(e.starts_at), 'd. MMM', { locale: de })}
                </span>
                <span className="text-xs text-gray-800 font-medium truncate">{e.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
