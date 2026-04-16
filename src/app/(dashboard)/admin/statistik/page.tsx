import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BarChart3, TrendingUp, Download } from 'lucide-react'
import AiStatistikKommentar from './ai-statistik-kommentar'
import AiAnomalienerkennung from './ai-anomalienerkennung'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Anwesenheitsstatistik' }

function workingDaysInMonth(year: number, month: number): number {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0)
  return eachDayOfInterval({ start, end })
    .filter(d => getDay(d) >= 1 && getDay(d) <= 5).length
}

export default async function StatistikPage({
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

  // Month navigation: default = current month
  const now = new Date()
  let year = now.getFullYear()
  let month = now.getMonth()  // 0-based

  if (searchParams.month) {
    const [y, m] = searchParams.month.split('-').map(Number)
    if (!isNaN(y) && !isNaN(m)) { year = y; month = m - 1 }
  }

  const monthStart = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd')
  const monthEnd   = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd')
  const workDays   = workingDaysInMonth(year, month)

  const prevMonth = new Date(year, month - 1)
  const nextMonth = new Date(year, month + 1)
  const prevParam = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  const nextParam = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: groups }] = await Promise.all([
    supabase
      .from('children')
      .select('id, first_name, last_name, group_id')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('last_name'),
    supabase
      .from('groups')
      .select('id, name, color')
      .eq('site_id', siteId),
  ])

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))
  const childIds = (children ?? []).map((c: any) => c.id)

  // Attendance records for this month
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let attendance: any[] = []
  if (childIds.length > 0) {
    const { data } = await supabase
      .from('attendance')
      .select('child_id, status, date')
      .in('child_id', childIds)
      .gte('date', monthStart)
      .lte('date', monthEnd)
    attendance = data ?? []
  }

  // Group by child
  const attByChild: Record<string, { present: number; sick: number; vacation: number; other: number }> = {}
  for (const a of attendance) {
    if (!attByChild[a.child_id]) attByChild[a.child_id] = { present: 0, sick: 0, vacation: 0, other: 0 }
    if (a.status === 'present')         attByChild[a.child_id].present++
    else if (a.status === 'absent_sick') attByChild[a.child_id].sick++
    else if (a.status === 'absent_vacation') attByChild[a.child_id].vacation++
    else if (a.status === 'absent_other') attByChild[a.child_id].other++
  }

  // Summary totals
  const totalPresent = Object.values(attByChild).reduce((s, c) => s + c.present, 0)
  const totalSick    = Object.values(attByChild).reduce((s, c) => s + c.sick, 0)
  const totalKinder  = children?.length ?? 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Anwesenheitsstatistik</h1>
          <p className="text-sm text-gray-400">{workDays} Werktage diesen Monat</p>
        </div>
        <a
          href={`/api/anwesenheit-export?month=${year}-${String(month + 1).padStart(2, '0')}`}
          download
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          title="Als CSV exportieren"
        >
          <Download size={18} className="text-gray-500" />
        </a>
      </div>

      {/* Monatsnavigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
        <Link href={`?month=${prevParam}`} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-500" />
        </Link>
        <span className="font-semibold text-gray-900">
          {format(new Date(year, month), 'MMMM yyyy', { locale: de })}
        </span>
        <Link
          href={isCurrentMonth ? '#' : `?month=${nextParam}`}
          className={`p-1.5 rounded-lg transition-colors ${isCurrentMonth ? 'opacity-30 pointer-events-none' : 'hover:bg-gray-100'}`}
        >
          <ArrowRight size={18} className="text-gray-500" />
        </Link>
      </div>

      <AiStatistikKommentar />
      <AiAnomalienerkennung />

      {/* Übersichtskacheln */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {totalKinder > 0 ? Math.round(totalPresent / (totalKinder * workDays) * 100) : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Ø Anwesenheit</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{totalSick}</p>
          <p className="text-xs text-gray-500 mt-0.5">Krankmeldungen</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">{totalKinder}</p>
          <p className="text-xs text-gray-500 mt-0.5">Kinder</p>
        </div>
      </div>

      {/* Kinderliste */}
      {children?.length === 0 ? (
        <div className="card p-10 text-center">
          <BarChart3 size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Keine aktiven Kinder</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            Auswertung pro Kind
          </p>
          <div className="card overflow-hidden p-0">
            {(children ?? []).map((child: any, idx: number) => {
              const stats = attByChild[child.id] ?? { present: 0, sick: 0, vacation: 0, other: 0 }
              const recorded = stats.present + stats.sick + stats.vacation + stats.other
              const rate = workDays > 0 ? Math.round(stats.present / workDays * 100) : 0
              const group = child.group_id ? groupMap[child.group_id] : null

              return (
                <div
                  key={child.id}
                  className={`px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: group?.color ?? '#3B6CE8' }}
                    >
                      {child.first_name[0]}{child.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {child.first_name} {child.last_name}
                      </p>
                      {group && <p className="text-xs text-gray-400">{group.name}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                        {rate}%
                      </p>
                      <p className="text-xs text-gray-400">{stats.present} / {workDays} T.</p>
                    </div>
                  </div>

                  {/* Fortschrittsbalken */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-green-500 transition-all" style={{ width: `${rate}%` }} />
                    {stats.sick > 0 && (
                      <div className="h-full bg-red-400 transition-all" style={{ width: `${Math.round(stats.sick / workDays * 100)}%` }} />
                    )}
                    {stats.vacation > 0 && (
                      <div className="h-full bg-blue-400 transition-all" style={{ width: `${Math.round(stats.vacation / workDays * 100)}%` }} />
                    )}
                  </div>

                  {/* Detail-Badges */}
                  {recorded > 0 && (
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      {stats.present > 0 && (
                        <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                          ✓ {stats.present}× anwesend
                        </span>
                      )}
                      {stats.sick > 0 && (
                        <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                          🤒 {stats.sick}× krank
                        </span>
                      )}
                      {stats.vacation > 0 && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                          🏖️ {stats.vacation}× Urlaub
                        </span>
                      )}
                      {stats.other > 0 && (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                          {stats.other}× sonstig
                        </span>
                      )}
                    </div>
                  )}
                  {recorded === 0 && (
                    <p className="text-xs text-gray-300 mt-1">Keine Einträge diesen Monat</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Legende */}
      <div className="flex items-center gap-4 text-xs text-gray-400 px-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-green-500 inline-block" /> Anwesend</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-red-400 inline-block" /> Krank</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-blue-400 inline-block" /> Urlaub</span>
      </div>
    </div>
  )
}
