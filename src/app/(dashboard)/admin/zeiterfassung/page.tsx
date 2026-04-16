import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, TrendingUp } from 'lucide-react'
import AiZeiterfassungAnalyse from './ai-zeiterfassung-analyse'
import { format, differenceInMinutes, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Zeiterfassung Admin' }

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')} h`
}

export default async function AdminZeiterfassungPage({
  searchParams,
}: { searchParams: { week?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const weekStart = searchParams.week
    ? new Date(searchParams.week + 'T12:00:00')
    : startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const prevWeek = format(new Date(weekStart.getTime() - 7 * 86400000), 'yyyy-MM-dd')
  const nextWeek = format(new Date(weekStart.getTime() + 7 * 86400000), 'yyyy-MM-dd')

  const { data: entries } = await supabase
    .from('time_entries')
    .select('*, profiles:staff_id(full_name, role)')
    .eq('site_id', siteId)
    .gte('clock_in', weekStart.toISOString())
    .lte('clock_in', weekEnd.toISOString())
    .order('clock_in', { ascending: false })

  // Group by staff
  const byStaff: Record<string, { name: string; minutes: number; entries: any[] }> = {}
  for (const e of entries ?? []) {
    const id = (e as any).staff_id
    const name = (e as any).profiles?.full_name ?? 'Unbekannt'
    if (!byStaff[id]) byStaff[id] = { name, minutes: 0, entries: [] }
    if ((e as any).clock_out) {
      const mins = differenceInMinutes(new Date((e as any).clock_out), new Date((e as any).clock_in))
        - ((e as any).break_minutes ?? 0)
      byStaff[id].minutes += Math.max(mins, 0)
    }
    byStaff[id].entries.push(e)
  }

  const weekLabel = `${format(weekStart, 'd. MMM', { locale: de })} – ${format(weekEnd, 'd. MMM yyyy', { locale: de })}`

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Zeiterfassung</h1>
          <p className="text-sm text-gray-400">Übersicht Team-Arbeitszeiten</p>
        </div>
      </div>

      <AiZeiterfassungAnalyse />

      {/* Week nav */}
      <div className="flex items-center justify-between card p-3">
        <Link href={`/admin/zeiterfassung?week=${prevWeek}`} className="text-sm text-brand-600 font-medium">‹ Zurück</Link>
        <p className="text-sm font-semibold text-gray-700">{weekLabel}</p>
        <Link href={`/admin/zeiterfassung?week=${nextWeek}`} className="text-sm text-brand-600 font-medium">Weiter ›</Link>
      </div>

      {Object.keys(byStaff).length === 0 ? (
        <div className="card p-10 text-center">
          <Clock size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Keine Einträge diese Woche</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(byStaff).map(([, staff]) => (
            <div key={staff.name} className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">{staff.name}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp size={14} className="text-brand-500" />
                  <span className="text-sm font-bold text-brand-700">{formatDuration(staff.minutes)}</span>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {staff.entries.map((e: any) => {
                  const duration = e.clock_out
                    ? differenceInMinutes(new Date(e.clock_out), new Date(e.clock_in)) - (e.break_minutes ?? 0)
                    : null
                  return (
                    <div key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">
                          {format(parseISO(e.clock_in), 'EEE d.', { locale: de })}
                          {' '}{format(parseISO(e.clock_in), 'HH:mm')}
                          {e.clock_out && ` – ${format(parseISO(e.clock_out), 'HH:mm')}`}
                        </p>
                        {e.break_minutes > 0 && <p className="text-[10px] text-gray-400">{e.break_minutes} min Pause</p>}
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {duration !== null ? formatDuration(Math.max(duration, 0)) : <span className="text-green-600">läuft</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
