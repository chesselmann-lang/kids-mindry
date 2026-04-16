import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, PieChart } from 'lucide-react'
import AiGruppenanalyse from './ai-gruppenanalyse'

export const metadata = { title: 'Gruppen-Statistik' }

export default async function GruppenStatistikPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const [
    { data: groups },
    { data: children },
    { data: todayAtt },
    { data: monthAtt },
    { data: observations },
    { data: incidents },
  ] = await Promise.all([
    supabase.from('groups').select('id, name, color').eq('site_id', siteId).order('name'),
    supabase.from('children').select('id, group_id, date_of_birth').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('attendance').select('child_id, status').eq('site_id', siteId).eq('date', today),
    supabase.from('attendance').select('child_id, status, date')
      .eq('site_id', siteId).gte('date', monthStart).lte('date', today),
    supabase.from('observations').select('child_id, created_at')
      .eq('site_id', siteId).gte('created_at', new Date(monthStart).toISOString()),
    supabase.from('incidents').select('child_id, created_at')
      .eq('site_id', siteId).gte('created_at', new Date(monthStart).toISOString()),
  ])

  // Build child-to-group map
  const childGroupMap: Record<string, string> = {}
  ;(children ?? []).forEach((c: any) => {
    if (c.group_id) childGroupMap[c.id] = c.group_id
  })

  // Per-group stats
  type GroupStats = {
    id: string; name: string; color: string
    totalChildren: number
    todayPresent: number; todayAbsent: number
    monthPresent: number; monthSick: number
    observations: number; incidents: number
    avgAge: number
  }

  const statsMap: Record<string, GroupStats> = {}
  ;(groups ?? []).forEach((g: any) => {
    statsMap[g.id] = {
      id: g.id, name: g.name, color: g.color,
      totalChildren: 0, todayPresent: 0, todayAbsent: 0,
      monthPresent: 0, monthSick: 0, observations: 0, incidents: 0, avgAge: 0,
    }
  })

  // Children per group + avg age
  ;(children ?? []).forEach((c: any) => {
    const gid = c.group_id
    if (!gid || !statsMap[gid]) return
    statsMap[gid].totalChildren++
    if (c.date_of_birth) {
      const age = (Date.now() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      statsMap[gid].avgAge += age
    }
  })
  Object.values(statsMap).forEach(s => {
    if (s.totalChildren > 0) s.avgAge = s.avgAge / s.totalChildren
  })

  // Today attendance
  ;(todayAtt ?? []).forEach((a: any) => {
    const gid = childGroupMap[a.child_id]
    if (!gid || !statsMap[gid]) return
    if (a.status === 'present') statsMap[gid].todayPresent++
    else statsMap[gid].todayAbsent++
  })

  // Month attendance
  ;(monthAtt ?? []).forEach((a: any) => {
    const gid = childGroupMap[a.child_id]
    if (!gid || !statsMap[gid]) return
    if (a.status === 'present') statsMap[gid].monthPresent++
    if (a.status === 'absent_sick') statsMap[gid].monthSick++
  })

  // Observations
  ;(observations ?? []).forEach((o: any) => {
    const gid = childGroupMap[o.child_id]
    if (!gid || !statsMap[gid]) return
    statsMap[gid].observations++
  })

  // Incidents
  ;(incidents ?? []).forEach((i: any) => {
    const gid = childGroupMap[i.child_id]
    if (!gid || !statsMap[gid]) return
    statsMap[gid].incidents++
  })

  const stats = Object.values(statsMap)
  const totalChildren = stats.reduce((s, g) => s + g.totalChildren, 0)
  const totalPresent  = stats.reduce((s, g) => s + g.todayPresent, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Gruppen-Statistik</h1>
          <p className="text-sm text-gray-400">Heute: {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center">
          <PieChart size={20} className="text-emerald-600" />
        </div>
      </div>

      {/* Site-level overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{totalChildren}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Kinder gesamt</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalPresent}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Heute da</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand-600">{stats.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Gruppen</p>
        </div>
      </div>

      {/* Per-group cards */}
      {stats.length === 0 ? (
        <div className="card p-8 text-center">
          <PieChart size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Gruppen angelegt</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stats.map(g => {
            const attendRate = g.totalChildren > 0
              ? Math.round((g.todayPresent / g.totalChildren) * 100)
              : 0
            return (
              <div key={g.id} className="card p-4">
                {/* Group header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                  <p className="font-bold text-gray-900">{g.name}</p>
                  <span className="ml-auto text-xs text-gray-400">{g.totalChildren} Kinder</span>
                </div>

                {/* Attendance bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Anwesenheit heute</span>
                    <span className="font-semibold">{g.todayPresent}/{g.totalChildren} ({attendRate}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${attendRate}%`, backgroundColor: g.color }} />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-base font-bold text-red-500">{g.todayAbsent}</p>
                    <p className="text-[9px] text-gray-400 leading-tight">Abwesend</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-base font-bold text-amber-500">{g.monthSick}</p>
                    <p className="text-[9px] text-gray-400 leading-tight">Krank (Monat)</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-base font-bold text-teal-600">{g.observations}</p>
                    <p className="text-[9px] text-gray-400 leading-tight">Beob. (Monat)</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2">
                    <p className="text-base font-bold text-orange-500">{g.incidents}</p>
                    <p className="text-[9px] text-gray-400 leading-tight">Vorfälle (Monat)</p>
                  </div>
                </div>

                {/* Avg age */}
                {g.avgAge > 0 && (
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    Ø Alter: {g.avgAge.toFixed(1)} Jahre
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* AI Gruppenanalyse */}
      <AiGruppenanalyse />
    </div>
  )
}
