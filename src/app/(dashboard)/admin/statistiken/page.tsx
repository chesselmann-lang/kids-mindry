import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, BarChart2, TrendingUp, Users, CalendarCheck,
  Baby, UserCheck, Clock, AlertTriangle, CheckCircle2,
  Euro, FileText, ListOrdered, Activity
} from 'lucide-react'
import AiKpiSynthese from './ai-kpi-synthese'
import AiQualitaetsCheck from './ai-qualitaets-check'
import AiBelegungsplaner from './ai-belegungsplaner'
import AiAbwesenheitsPrognose from './ai-abwesenheits-prognose'
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth, getDay } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Statistiken & KPIs' }

function workingDays(start: Date, end: Date): number {
  return eachDayOfInterval({ start, end }).filter(d => {
    const wd = getDay(d)
    return wd >= 1 && wd <= 5
  }).length
}

export default async function StatistikenPage({
  searchParams
}: { searchParams: { month?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()

  // Month selection
  const targetMonth = searchParams.month
    ? new Date(searchParams.month + '-01T12:00:00')
    : startOfMonth(today)
  const monthStart = format(startOfMonth(targetMonth), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(targetMonth), 'yyyy-MM-dd')
  const monthLabel = format(targetMonth, 'MMMM yyyy', { locale: de })
  const wDays = workingDays(startOfMonth(targetMonth), endOfMonth(targetMonth))

  // ── Core Data Fetches ──────────────────────────────────────────
  const [
    { data: children },
    { data: attendance },
    { data: groups },
    { data: staff },
    { data: waitlist },
    { count: reportCount },
    { data: paymentsMonth },
    { data: krankmeldungen },
  ] = await Promise.all([
    supabase.from('children').select('id, group_id, status, groups(name, color)').eq('site_id', siteId),
    supabase.from('attendance')
      .select('child_id, date, status, check_in_at, check_out_at')
      .eq('site_id', siteId)
      .gte('date', monthStart).lte('date', monthEnd),
    supabase.from('groups').select('id, name, color, capacity').eq('site_id', siteId),
    supabase.from('profiles')
      .select('id, role')
      .eq('site_id', siteId)
      .in('role', ['educator', 'group_lead', 'admin', 'caretaker']),
    supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'waitlist'),
    supabase.from('daily_reports').select('id', { count: 'exact', head: true })
      .in('child_id', [])  // will override below
      .gte('report_date', monthStart).lte('report_date', monthEnd),
    supabase.from('payments')
      .select('amount, status, payment_items(amount_cents)')
      .eq('site_id', siteId)
      .eq('status', 'succeeded')
      .gte('created_at', `${monthStart}T00:00:00`)
      .lte('created_at', `${monthEnd}T23:59:59`),
    supabase.from('absence_requests')
      .select('id, reason')
      .eq('site_id', siteId)
      .gte('start_date', monthStart).lte('start_date', monthEnd),
  ])

  const activeChildren = (children ?? []).filter(c => (c as any).status === 'active')
  const totalActive = activeChildren.length
  const totalWaitlist = (waitlist ?? []).length
  const totalStaff = (staff ?? []).length

  // Reports count (fix the join issue - do separate query)
  const childIds = activeChildren.map(c => c.id)
  const { count: rCount } = childIds.length > 0
    ? await supabase.from('daily_reports').select('id', { count: 'exact', head: true })
        .in('child_id', childIds).gte('report_date', monthStart).lte('report_date', monthEnd)
    : { count: 0 }

  // ── KPI Calculations ───────────────────────────────────────────
  const attendanceList = attendance ?? []
  const presentRecords = attendanceList.filter(a => a.status === 'present')
  const sickCount = attendanceList.filter(a => a.status === 'absent_sick').length
  const vacationCount = attendanceList.filter(a => a.status === 'absent_vacation').length
  const otherAbsence = attendanceList.filter(a => a.status === 'absent_other').length

  // Anwesenheitsquote = present days / (active children × working days) × 100
  const theoreticalDays = totalActive * wDays
  const attendanceRate = theoreticalDays > 0
    ? Math.round((presentRecords.length / theoreticalDays) * 100)
    : 0

  // Belegungsquote = active children / total capacity from groups
  const totalCapacity = (groups ?? []).reduce((s, g) => s + ((g as any).capacity ?? 0), 0)
  const belegungsquote = totalCapacity > 0
    ? Math.round((totalActive / totalCapacity) * 100)
    : null

  // Fachkraft-Kind-Ratio (active staff : active children, e.g. 1:5.2)
  const fkRatio = totalStaff > 0 ? (totalActive / totalStaff).toFixed(1) : null

  // Average daily duration from check-in/out
  const completedCheckins = presentRecords.filter(a =>
    (a as any).check_in_at && (a as any).check_out_at
  )
  let avgHours: number | null = null
  if (completedCheckins.length > 0) {
    const totalMs = completedCheckins.reduce((s, a) => {
      const inMs = new Date((a as any).check_in_at).getTime()
      const outMs = new Date((a as any).check_out_at).getTime()
      return s + (outMs - inMs)
    }, 0)
    avgHours = Math.round((totalMs / completedCheckins.length / 1000 / 3600) * 10) / 10
  }

  // Revenue this month
  const monthRevenue = (paymentsMonth ?? []).reduce((s, p) => {
    return s + ((p as any).payment_items?.amount_cents ?? 0)
  }, 0) / 100

  // ── Group Stats ───────────────────────────────────────────────
  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))
  const groupStats: Record<string, {
    name: string; color: string; capacity: number; childCount: number;
    present: number; attendanceDays: number
  }> = {}

  for (const child of activeChildren) {
    const c = child as any
    const gid = c.group_id ?? 'none'
    if (!groupStats[gid]) {
      const grp = groupMap[gid]
      groupStats[gid] = {
        name: grp?.name ?? 'Ohne Gruppe',
        color: grp?.color ?? '#9CA3AF',
        capacity: grp?.capacity ?? 0,
        childCount: 0,
        present: 0,
        attendanceDays: 0,
      }
    }
    groupStats[gid].childCount++
    const childAtt = attendanceList.filter(a => a.child_id === c.id)
    groupStats[gid].present += childAtt.filter(a => a.status === 'present').length
    groupStats[gid].attendanceDays += childAtt.length
  }

  // ── Last 7 days chart ─────────────────────────────────────────
  const last7 = eachDayOfInterval({ start: subDays(today, 6), end: today })
  const dailyStats = last7.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayAtt = attendanceList.filter(a => a.date === dateStr)
    const present = dayAtt.filter(a => a.status === 'present').length
    return {
      date: format(day, 'EEE', { locale: de }),
      label: format(day, 'd.', { locale: de }),
      pct: totalActive > 0 ? Math.round((present / totalActive) * 100) : 0,
      present,
      isWeekend: getDay(day) === 0 || getDay(day) === 6,
    }
  })

  // ── Month navigation ──────────────────────────────────────────
  const prevMonth = format(subDays(startOfMonth(targetMonth), 1), 'yyyy-MM')
  const nextMonth = format(new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 1), 'yyyy-MM')
  const isCurrentMonth = monthStart === format(startOfMonth(today), 'yyyy-MM-dd')

  // ── Helper ────────────────────────────────────────────────────
  function kpiColor(value: number, good: number, warn: number, invert = false): string {
    if (invert) {
      if (value <= good) return 'text-green-600'
      if (value <= warn) return 'text-amber-600'
      return 'text-red-500'
    }
    if (value >= good) return 'text-green-600'
    if (value >= warn) return 'text-amber-600'
    return 'text-red-500'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Statistiken & KPIs</h1>
          <p className="text-sm text-gray-400">Kennzahlen auf einen Blick</p>
        </div>
        <Link href="/api/anwesenheit-export" className="ml-auto flex items-center gap-1.5 text-xs text-brand-600 font-medium bg-brand-50 px-3 py-1.5 rounded-xl hover:bg-brand-100 transition-colors">
          Export
        </Link>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between card p-3">
        <Link href={`/admin/statistiken?month=${prevMonth}`} className="text-sm text-brand-600 font-medium px-2">‹ Zurück</Link>
        <p className="text-sm font-semibold text-gray-700 capitalize">{monthLabel}</p>
        {!isCurrentMonth ? (
          <Link href={`/admin/statistiken?month=${nextMonth}`} className="text-sm text-brand-600 font-medium px-2">Weiter ›</Link>
        ) : (
          <div className="w-16" />
        )}
      </div>

      <AiKpiSynthese />
      <AiQualitaetsCheck />
      <AiBelegungsplaner />
      <AiAbwesenheitsPrognose />

      {/* ── Primary KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Belegungsquote */}
        <div className="card p-4 col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Belegungsquote</p>
              {belegungsquote !== null ? (
                <>
                  <p className={`text-3xl font-black ${kpiColor(belegungsquote, 85, 70)}`}>{belegungsquote}%</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{totalActive} von {totalCapacity} Plätzen</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-black text-brand-600">{totalActive}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Kinder aktiv</p>
                </>
              )}
            </div>
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Baby size={18} className="text-brand-600" />
            </div>
          </div>
        </div>

        {/* Anwesenheitsquote */}
        <div className="card p-4 col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Anwesenheitsquote</p>
              <p className={`text-3xl font-black ${kpiColor(attendanceRate, 80, 65)}`}>{attendanceRate}%</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{presentRecords.length} von {theoreticalDays} PT</p>
            </div>
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <CalendarCheck size={18} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Fachkraft-Kind-Ratio */}
        <div className="card p-4 col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Fachkraft-Kind-Ratio</p>
              {fkRatio ? (
                <>
                  <p className={`text-3xl font-black ${kpiColor(parseFloat(fkRatio), 6, 8, true)}`}>1:{fkRatio}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{totalStaff} Fachkräfte</p>
                </>
              ) : (
                <p className="text-lg font-bold text-gray-400">–</p>
              )}
            </div>
            <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserCheck size={18} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Krankenquote */}
        <div className="card p-4 col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">Krankenquote</p>
              {theoreticalDays > 0 ? (
                <>
                  <p className={`text-3xl font-black ${kpiColor(Math.round(sickCount / theoreticalDays * 100), 10, 5, true)}`}>
                    {Math.round(sickCount / theoreticalDays * 100)}%
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sickCount} Krankentage</p>
                </>
              ) : (
                <p className="text-3xl font-black text-red-500">{sickCount}</p>
              )}
            </div>
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Secondary KPIs row ────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-amber-600">{totalWaitlist}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Warteliste</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-brand-600">{rCount ?? 0}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Tagesberichte</p>
        </div>
        <div className="card p-3 text-center">
          {avgHours !== null ? (
            <>
              <p className="text-xl font-bold text-indigo-600">{avgHours}h</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Ø Betreuungszeit</p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-gray-400">–</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Ø Betreuungszeit</p>
            </>
          )}
        </div>
      </div>

      {/* ── Revenue KPI ───────────────────────────────────────── */}
      {monthRevenue > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Euro size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Umsatz {monthLabel}</p>
              <p className="text-2xl font-black text-emerald-600">
                {monthRevenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Last 7 days chart ─────────────────────────────────── */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Anwesenheit letzte 7 Tage</p>
        <div className="flex items-end justify-between gap-1.5 h-28">
          {dailyStats.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400 font-medium">{day.isWeekend ? '' : `${day.pct}%`}</span>
              <div className="w-full rounded-t-lg overflow-hidden" style={{ height: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {day.isWeekend ? (
                  <div className="w-full bg-gray-50 rounded-t-lg" style={{ height: '100%' }} />
                ) : (
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      height: `${Math.max(day.pct, 4)}%`,
                      backgroundColor: day.pct >= 80 ? '#22c55e' : day.pct >= 60 ? '#f59e0b' : '#ef4444',
                      opacity: 0.85,
                    }}
                  />
                )}
              </div>
              <span className="text-[9px] text-gray-500">{day.date}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          {[
            { color: '#22c55e', label: '≥ 80%' },
            { color: '#f59e0b', label: '60–79%' },
            { color: '#ef4444', label: '< 60%' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[10px] text-gray-400">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Group stats ───────────────────────────────────────── */}
      {Object.keys(groupStats).length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Gruppen-Übersicht</p>
          <div className="space-y-3.5">
            {Object.values(groupStats).sort((a, b) => b.childCount - a.childCount).map((g, idx) => {
              const pct = g.attendanceDays > 0 ? Math.round((g.present / g.attendanceDays) * 100) : 0
              const belegung = g.capacity > 0 ? Math.round((g.childCount / g.capacity) * 100) : null
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                      <span className="text-xs font-semibold text-gray-800">{g.name}</span>
                      <span className="text-[10px] text-gray-400">{g.childCount} Kinder{belegung !== null ? ` · ${belegung}% belegt` : ''}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: g.color }}>{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Absence breakdown ─────────────────────────────────── */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Abwesenheitsanalyse</p>
        <div className="space-y-2">
          {[
            { label: 'Krank', count: sickCount, color: '#ef4444', bg: 'bg-red-50' },
            { label: 'Urlaub / Ferien', count: vacationCount, color: '#3b82f6', bg: 'bg-blue-50' },
            { label: 'Sonstiges', count: otherAbsence, color: '#9ca3af', bg: 'bg-gray-50' },
          ].map(item => {
            const total = sickCount + vacationCount + otherAbsence
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-24 flex-shrink-0">{item.label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-xs font-bold w-6 text-right" style={{ color: item.color }}>{item.count}</span>
              </div>
            )
          })}
        </div>
        {sickCount > 0 && theoreticalDays > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              Ø Krankenquote pro Kind: {(sickCount / totalActive).toFixed(1)} Tage/Monat ·
              Krankenstand: {Math.round(sickCount / theoreticalDays * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* ── Quick links ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/statistik" className="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart2 size={16} className="text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Anwesenheitsliste</p>
            <p className="text-[10px] text-gray-400">Detailansicht pro Kind</p>
          </div>
        </Link>
        <Link href="/admin/gruppen-statistik" className="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Gruppen-Statistik</p>
            <p className="text-[10px] text-gray-400">Aufschlüsselung je Gruppe</p>
          </div>
        </Link>
        <Link href="/admin/aktivitaet" className="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Aktivitätslog</p>
            <p className="text-[10px] text-gray-400">Nutzeraktionen</p>
          </div>
        </Link>
        <Link href="/admin/gebuehren" className="card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Euro size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">Gebührenübersicht</p>
            <p className="text-[10px] text-gray-400">Offene Posten & Zahlungen</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
