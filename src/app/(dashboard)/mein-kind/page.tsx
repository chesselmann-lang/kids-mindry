import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Baby, CalendarDays, ClipboardList, UserCheck, UserX,
  HelpCircle, ChevronRight, MessageCircle, HeartPulse,
  Phone, AlertTriangle, BellOff, Users, BookOpen, Star, Camera,
} from 'lucide-react'
import AiMeinKind from './ai-mein-kind'
import AiElternFeed from './ai-eltern-feed'
import { format, startOfWeek, eachDayOfInterval, endOfWeek, isSameDay } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Mein Kind' }

const moodEmoji: Record<string, string> = {
  great: '😄', good: '🙂', okay: '😐', sad: '😢', sick: '🤒',
}

const attLabel: Record<string, { label: string; color: string }> = {
  present:          { label: 'Anwesend',  color: 'bg-green-100 text-green-700' },
  absent_sick:      { label: 'Krank',     color: 'bg-red-100 text-red-700' },
  absent_vacation:  { label: 'Urlaub',    color: 'bg-blue-100 text-blue-700' },
  absent_other:     { label: 'Abwesend',  color: 'bg-gray-100 text-gray-500' },
}

export default async function MeinKindPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  // Staff sees the kinder page instead
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (isStaff) redirect('/kinder')

  // Get this parent's children
  const { data: guardians } = await supabase
    .from('guardians')
    .select('*, children(*, groups(name, color))')
    .eq('user_id', user.id)

  const children = (guardians ?? [])
    .filter((g: any) => g.children)
    .map((g: any) => ({ ...g.children, relationship: g.relationship, is_primary: g.is_primary }))

  if (children.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-gray-900">Mein Kind</h1>
        <div className="card p-12 text-center">
          <Baby size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600">Noch kein Kind verknüpft</p>
          <p className="text-sm text-gray-400 mt-1">Bitte wenden Sie sich an die Kita</p>
        </div>
      </div>
    )
  }

  // For now, show the first/primary child; if multiple, show selector
  const today = new Date().toISOString().split('T')[0]

  // Gather data for all children in parallel
  const childIds = children.map((c: any) => c.id)

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
    .filter(d => d.getDay() !== 0 && d.getDay() !== 6) // Mon-Fri

  const [{ data: weekAttendance }, { data: recentReports }, { data: upcomingEvents }] = await Promise.all([
    supabase.from('attendance').select('child_id, date, status, check_in_at, check_out_at')
      .in('child_id', childIds)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0]),
    supabase.from('daily_reports').select('*')
      .in('child_id', childIds)
      .order('report_date', { ascending: false })
      .limit(10),
    supabase.from('events').select('id, title, starts_at, all_day')
      .eq('site_id', process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!)
      .gte('starts_at', today)
      .order('starts_at').limit(3),
  ])

  // Map attendance by child_id+date
  const attMap: Record<string, string> = {}
  for (const a of weekAttendance ?? []) {
    attMap[`${a.child_id}:${a.date}`] = a.status
  }

  // Today's attendance
  const todayAtt: Record<string, any> = {}
  for (const a of weekAttendance ?? []) {
    if (a.date === today) todayAtt[a.child_id] = a
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mein Kind</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {format(new Date(), "EEEE, d. MMMM", { locale: de })}
        </p>
      </div>

      <AiElternFeed />
      <AiMeinKind />

      {(children as any[]).map((child: any) => {
        const group = child.groups
        const age = child.date_of_birth
          ? Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
          : null
        const att = todayAtt[child.id]
        const childReports = (recentReports ?? []).filter((r: any) => r.child_id === child.id)

        return (
          <div key={child.id} className="space-y-4">
            {/* Child header card */}
            <div className="card p-5 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                style={{ backgroundColor: group?.color ?? '#3B6CE8' }}
              >
                {child.first_name[0]}{child.last_name[0]}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 text-lg">{child.first_name} {child.last_name}</h2>
                <p className="text-sm text-gray-400">
                  {age !== null ? `${age} Jahre` : ''}
                  {group ? ` · ${group.name}` : ''}
                </p>
                {child.care_days && child.care_days.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    🕐 {child.care_days.join(', ')}
                    {child.care_start_time && child.care_end_time
                      ? ` · ${child.care_start_time.slice(0, 5)}–${child.care_end_time.slice(0, 5)} Uhr`
                      : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Allergies warning */}
            {(child.allergies?.length || child.medical_notes) && (
              <div className="card p-4 border-l-4 border-amber-400">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="font-semibold text-xs text-amber-700">Gesundheitshinweise</span>
                </div>
                {child.allergies && child.allergies.length > 0 && (
                  <p className="text-xs text-gray-700"><strong>Allergien:</strong> {child.allergies.join(', ')}</p>
                )}
                {child.medical_notes && (
                  <p className="text-xs text-gray-700 mt-0.5"><strong>Medizinisch:</strong> {child.medical_notes}</p>
                )}
              </div>
            )}

            {/* Today status */}
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {att?.status === 'present' ? (
                    <UserCheck size={16} className="text-green-600" />
                  ) : att ? (
                    <UserX size={16} className="text-red-500" />
                  ) : (
                    <HelpCircle size={16} className="text-gray-400" />
                  )}
                  <span className="font-semibold text-sm text-gray-900">Heute</span>
                </div>
                {att ? (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${attLabel[att.status]?.color ?? 'bg-gray-100 text-gray-500'}`}>
                    {attLabel[att.status]?.label ?? att.status}
                    {att.status === 'present' && att.check_in_at
                      ? ` seit ${new Date(att.check_in_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`
                      : ''}
                  </span>
                ) : (
                  <Link href="/nachrichten" className="text-xs text-brand-600 font-medium">Abmelden →</Link>
                )}
              </div>
            </div>

            {/* Week attendance mini calendar */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Diese Woche</h3>
              <div className="flex gap-2">
                {weekDays.map(day => {
                  const dateStr = day.toISOString().split('T')[0]
                  const status = attMap[`${child.id}:${dateStr}`]
                  const isToday = isSameDay(day, new Date())
                  return (
                    <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                      <span className={`text-[10px] font-medium ${isToday ? 'text-brand-600' : 'text-gray-400'}`}>
                        {format(day, 'EEE', { locale: de }).slice(0, 2)}
                      </span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isToday ? 'ring-2 ring-brand-400 ring-offset-1' : ''
                      } ${
                        status === 'present' ? 'bg-green-100 text-green-700' :
                        status === 'absent_sick' ? 'bg-red-100 text-red-500' :
                        status === 'absent_vacation' ? 'bg-blue-100 text-blue-500' :
                        status ? 'bg-gray-100 text-gray-400' :
                        'bg-gray-50 text-gray-300'
                      }`}>
                        {status === 'present' ? '✓' :
                         status === 'absent_sick' ? 'K' :
                         status === 'absent_vacation' ? 'U' :
                         status ? '–' :
                         format(day, 'd')}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3 mt-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-100 inline-block" /> Anwesend</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 inline-block" /> Krank</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-100 inline-block" /> Urlaub</span>
              </div>
            </div>

            {/* Recent reports */}
            {childReports.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Letzte Tagesberichte</h3>
                  <Link href="/tagesberichte" className="text-xs text-brand-600 font-medium">Alle →</Link>
                </div>
                <div className="space-y-2">
                  {childReports.slice(0, 3).map((report: any) => {
                    const isToday = report.report_date === today
                    return (
                      <Link key={report.id}
                        href={`/tagesberichte/${child.id}/${report.report_date}`}
                        className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
                      >
                        <div className="text-2xl">{moodEmoji[report.mood] ?? '😐'}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {isToday ? 'Heute' : format(new Date(report.report_date + 'T12:00:00'), 'EEE, d. MMM', { locale: de })}
                          </p>
                          {report.notes && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{report.notes}</p>
                          )}
                        </div>
                        <ChevronRight size={15} className="text-gray-300" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Upcoming events */}
            {upcomingEvents && (upcomingEvents as any[]).length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nächste Termine</h3>
                  <Link href="/kalender" className="text-xs text-brand-600 font-medium">Alle →</Link>
                </div>
                <div className="card overflow-hidden p-0">
                  {(upcomingEvents as any[]).map((e: any, idx: number) => (
                    <Link key={e.id} href={`/kalender/${e.id}`}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                      <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <CalendarDays size={15} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(e.starts_at), 'd. MMM', { locale: de })}
                          {!e.all_day ? ` · ${format(new Date(e.starts_at), 'HH:mm')} Uhr` : ''}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-2">
              <Link href="/abwesenheit-melden"
                className="card p-3 flex flex-col items-center gap-1.5 text-center hover:shadow-card-hover transition-shadow">
                <div className="w-9 h-9 rounded-2xl bg-red-100 flex items-center justify-center">
                  <BellOff size={16} className="text-red-600" />
                </div>
                <p className="text-[11px] font-semibold text-gray-900 leading-tight">Abwesen&shy;heit melden</p>
              </Link>
              <Link href="/nachrichten"
                className="card p-3 flex flex-col items-center gap-1.5 text-center hover:shadow-card-hover transition-shadow">
                <div className="w-9 h-9 rounded-2xl bg-green-100 flex items-center justify-center">
                  <MessageCircle size={16} className="text-green-600" />
                </div>
                <p className="text-[11px] font-semibold text-gray-900 leading-tight">Nachricht schreiben</p>
              </Link>
              <Link href="/tagesberichte"
                className="card p-3 flex flex-col items-center gap-1.5 text-center hover:shadow-card-hover transition-shadow">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <ClipboardList size={16} className="text-amber-600" />
                </div>
                <p className="text-[11px] font-semibold text-gray-900 leading-tight">Alle Berichte</p>
              </Link>
            </div>

            {/* Child-specific quick links */}
            <div className="space-y-2">
              <Link
                href={`/portfolio/${child.id}`}
                className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Camera size={16} className="text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Portfolio</p>
                  <p className="text-xs text-gray-400">Fotos & Entwicklungsmomente</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>

              <Link
                href={`/meilensteine/${child.id}`}
                className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Star size={16} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Meilensteine</p>
                  <p className="text-xs text-gray-400">Entwicklungsschritte & Fortschritte</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>

              <Link
                href={`/gesundheit/${child.id}`}
                className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <HeartPulse size={16} className="text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Gesundheitsakte</p>
                  <p className="text-xs text-gray-400">Impfungen, Allergien & Notfallkontakte</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>

              <Link
                href={`/abholberechtigte/${child.id}`}
                className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users size={16} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Abholberechtigte</p>
                  <p className="text-xs text-gray-400">Berechtigte Personen verwalten</p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
