import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserX, Filter } from 'lucide-react'
import AiAbwesenheitsMuster from './ai-abwesenheits-muster'
import { format, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Abwesenheiten' }

const STATUS_LABELS: Record<string, { label: string; color: string; short: string }> = {
  absent_sick:     { label: 'Krank',   color: 'bg-red-100 text-red-700',    short: 'K' },
  absent_vacation: { label: 'Urlaub',  color: 'bg-blue-100 text-blue-700',  short: 'U' },
  absent_other:    { label: 'Sonstiges', color: 'bg-gray-100 text-gray-600', short: 'S' },
}

export default async function AbwesenheitenPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; status?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const fromDate = searchParams.from ?? subDays(new Date(), 30).toISOString().split('T')[0]
  const toDate   = searchParams.to   ?? new Date().toISOString().split('T')[0]
  const statusFilter = searchParams.status ?? ''

  // Build attendance query for absences
  let query = supabase
    .from('attendance')
    .select('id, date, status, notes, child_id, children(id, first_name, last_name, group_id, groups(name, color))')
    .neq('status', 'present')
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: false })

  if (statusFilter) query = query.eq('status', statusFilter)

  const { data: absences } = await query

  // Filter by site via children
  const siteChildren = new Set<string>()
  const { data: allChildren } = await supabase
    .from('children').select('id').eq('site_id', siteId).eq('status', 'active')
  for (const c of allChildren ?? []) siteChildren.add(c.id)

  const filtered = (absences ?? []).filter((a: any) => siteChildren.has(a.child_id))

  // Count by status
  const counts = { absent_sick: 0, absent_vacation: 0, absent_other: 0 }
  for (const a of filtered) {
    if (a.status in counts) counts[a.status as keyof typeof counts]++
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Abwesenheiten</h1>
          <p className="text-sm text-gray-400">{filtered.length} Einträge</p>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-red-500">{counts.absent_sick}</p>
          <p className="text-xs text-gray-500 mt-0.5">Krank</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-blue-500">{counts.absent_vacation}</p>
          <p className="text-xs text-gray-500 mt-0.5">Urlaub</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-gray-500">{counts.absent_other}</p>
          <p className="text-xs text-gray-500 mt-0.5">Sonstiges</p>
        </div>
      </div>

      <AiAbwesenheitsMuster />

      {/* Filter bar */}
      <form className="card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Von</label>
            <input type="date" name="from" defaultValue={fromDate}
              className="input text-sm w-full" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Bis</label>
            <input type="date" name="to" defaultValue={toDate}
              className="input text-sm w-full" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Grund</label>
          <select name="status" defaultValue={statusFilter} className="input text-sm w-full">
            <option value="">Alle</option>
            <option value="absent_sick">Krank</option>
            <option value="absent_vacation">Urlaub</option>
            <option value="absent_other">Sonstiges</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full text-sm">Filtern</button>
      </form>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <UserX size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Keine Abwesenheiten gefunden</p>
          <p className="text-xs text-gray-400 mt-1">Versuche einen anderen Zeitraum</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          {(filtered as any[]).map((a, idx) => {
            const config = STATUS_LABELS[a.status] ?? { label: a.status, color: 'bg-gray-100 text-gray-500', short: '?' }
            const child = a.children
            return (
              <div key={a.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: child?.groups?.color ?? '#9CA3AF' }}
                >
                  {child?.first_name?.[0]}{child?.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {child?.first_name} {child?.last_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(a.date + 'T12:00:00'), 'EEE, d. MMM yyyy', { locale: de })}
                    {child?.groups ? ` · ${child.groups.name}` : ''}
                  </p>
                  {a.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate italic">{a.notes}</p>
                  )}
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${config.color}`}>
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
