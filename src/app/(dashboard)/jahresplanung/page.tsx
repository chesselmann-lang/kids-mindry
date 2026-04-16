import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, Plus } from 'lucide-react'
import AiJahresplanungAnalyse from './ai-jahresplanung-analyse'
import { format, getYear, startOfYear, endOfYear, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Jahresplanung' }

const EVENT_TYPES: Record<string, { label: string; color: string; bg: string }> = {
  holiday:  { label: 'Feiertag',     color: 'text-red-700',    bg: 'bg-red-100' },
  closing:  { label: 'Schließtag',   color: 'text-orange-700', bg: 'bg-orange-100' },
  special:  { label: 'Besonderer Tag', color: 'text-brand-700', bg: 'bg-brand-100' },
  trip:     { label: 'Ausflug',      color: 'text-green-700',  bg: 'bg-green-100' },
  meeting:  { label: 'Elternabend',  color: 'text-purple-700', bg: 'bg-purple-100' },
  other:    { label: 'Sonstiges',    color: 'text-gray-700',   bg: 'bg-gray-100' },
}

export default async function JahresplanungPage({
  searchParams,
}: { searchParams: { year?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const year = searchParams.year ? parseInt(searchParams.year) : getYear(today)
  const yearStart = format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')
  const yearEnd = format(endOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')

  const { data: events } = await supabase
    .from('annual_events')
    .select('*')
    .eq('site_id', siteId)
    .gte('event_date', yearStart)
    .lte('event_date', yearEnd)
    .order('event_date')

  // Group by month
  const byMonth: Record<number, typeof events> = {}
  for (const ev of events ?? []) {
    const m = parseISO((ev as any).event_date).getMonth()
    if (!byMonth[m]) byMonth[m] = []
    byMonth[m]!.push(ev)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Jahresplanung</h1>
          <p className="text-sm text-gray-400">Termine & besondere Tage</p>
        </div>
        {isAdmin && (
          <Link href="/admin/jahresplanung" className="btn-primary flex items-center gap-2 py-2 px-3 text-sm">
            <Plus size={16} /> Termin
          </Link>
        )}
      </div>

      {isAdmin && <AiJahresplanungAnalyse />}

      {/* Year nav */}
      <div className="flex items-center justify-between card p-3">
        <Link href={`/jahresplanung?year=${year - 1}`} className="text-sm text-brand-600 font-medium">‹ {year - 1}</Link>
        <p className="text-sm font-bold text-gray-700">{year}</p>
        <Link href={`/jahresplanung?year=${year + 1}`} className="text-sm text-brand-600 font-medium">{year + 1} ›</Link>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(EVENT_TYPES).map(([key, val]) => (
          <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${val.bg} ${val.color}`}>
            {val.label}
          </span>
        ))}
      </div>

      {/* Monthly sections */}
      {Array.from({ length: 12 }, (_, i) => {
        const monthEvents = byMonth[i] ?? []
        const monthLabel = format(new Date(year, i, 1), 'MMMM', { locale: de })
        const isPast = new Date(year, i + 1, 0) < today

        return (
          <div key={i} className={`card overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700 capitalize">{monthLabel}</p>
            </div>
            {monthEvents.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-300 italic">Keine Termine geplant</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {(monthEvents as any[]).map(ev => {
                  const type = EVENT_TYPES[ev.event_type] ?? EVENT_TYPES.other
                  return (
                    <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="text-center flex-shrink-0 w-10">
                        <p className="text-lg font-bold text-gray-700 leading-none">
                          {format(parseISO(ev.event_date), 'd')}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase">
                          {format(parseISO(ev.event_date), 'EEE', { locale: de })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                        {ev.description && (
                          <p className="text-xs text-gray-400 truncate">{ev.description}</p>
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${type.bg} ${type.color}`}>
                        {type.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
