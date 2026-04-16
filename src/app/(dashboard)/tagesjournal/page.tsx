import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, NotebookPen, UserCheck, UserX, HelpCircle, ClipboardList, StickyNote, CalendarDays, Moon } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import TagesjournalClient from './tagesjournal-client'
import SchnellBeobachtung from './schnell-beobachtung'
import AiTagesjournalSynthese from './ai-tagesjournal-synthese'
import AiTagesAbschluss from './ai-tages-abschluss'

export const metadata = { title: 'Tagesjournal' }

export default async function TagesjournalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await (supabase as any).from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const [
    { data: children },
    { data: attendance },
    { data: reports },
    { data: events },
    { data: sleepRecords },
    { data: notes },
  ] = await Promise.all([
    supabase.from('children')
      .select('id, first_name, last_name, group_id, groups(name, color)')
      .eq('site_id', siteId).eq('status', 'active').order('first_name'),
    supabase.from('attendance')
      .select('child_id, status, check_in_at, check_out_at')
      .eq('site_id', siteId).eq('date', today),
    supabase.from('daily_reports')
      .select('child_id, mood, notes, activities, sleep_minutes, photo_urls, author_id')
      .in('child_id', []).eq('report_date', today), // placeholder — we fill after
    supabase.from('events')
      .select('id, title, starts_at, ends_at, all_day, color')
      .eq('site_id', siteId)
      .gte('starts_at', today + 'T00:00:00')
      .lt('starts_at', today + 'T23:59:59')
      .order('starts_at'),
    supabase.from('sleep_records')
      .select('child_id, start_time, end_time, duration_minutes')
      .eq('sleep_date', today),
    (supabase as any).from('quick_notes')
      .select('id, content, color, pinned, created_at, profiles:author_id(full_name)')
      .eq('site_id', siteId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Re-fetch reports for actual child ids
  const childIds = (children ?? []).map((c: any) => c.id)
  let todayReports: any[] = []
  if (childIds.length > 0) {
    const { data: r } = await supabase
      .from('daily_reports')
      .select('child_id, mood, notes, activities, sleep_minutes, photo_urls')
      .in('child_id', childIds)
      .eq('report_date', today)
    todayReports = r ?? []
  }

  const attendanceMap = Object.fromEntries((attendance ?? []).map((a: any) => [a.child_id, a]))
  const reportMap = Object.fromEntries(todayReports.map((r: any) => [r.child_id, r]))
  const sleepMap = Object.fromEntries((sleepRecords ?? []).map((s: any) => [s.child_id, s]))

  const presentCount = (attendance ?? []).filter((a: any) => a.status === 'present').length
  const absentCount = (attendance ?? []).filter((a: any) => a.status !== 'present').length
  const unknownCount = (children ?? []).length - (attendance ?? []).length
  const reportCount = todayReports.length

  const moodEmoji: Record<string, string> = {
    great: '😄', good: '🙂', okay: '😐', sad: '😢', sick: '🤒',
  }

  const dayLabel = format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Tagesjournal</h1>
          <p className="text-sm text-gray-400">{dayLabel}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <NotebookPen size={20} className="text-brand-600" />
        </div>
      </div>

      {/* Attendance stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserCheck size={15} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Anwesend</p>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserX size={15} className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500">{absentCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Abwesend</p>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ClipboardList size={15} className="text-brand-500" />
          </div>
          <p className="text-2xl font-bold text-brand-600">{reportCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Berichte</p>
        </div>
      </div>

      {/* Today's events */}
      {events && events.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CalendarDays size={12} /> Heute
          </h2>
          <div className="card overflow-hidden p-0">
            {(events as any[]).map((e, idx) => (
              <Link key={e.id} href={`/kalender/${e.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color ?? '#3B6CE8' }} />
                <p className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">{e.title}</p>
                {!e.all_day && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(e.starts_at), 'HH:mm')}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Children today */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={12} /> Kinder heute
          </h2>
          <Link href="/kinder" className="text-xs text-brand-600">Alle →</Link>
        </div>
        <div className="card overflow-hidden p-0">
          {(children as any[]).slice(0, 20).map((child: any, idx: number) => {
            const att = attendanceMap[child.id]
            const rep = reportMap[child.id]
            const sleep = sleepMap[child.id]
            const isPresent = att?.status === 'present'

            return (
              <div key={child.id}
                className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: (child.groups as any)?.color ?? '#3B6CE8' }}
                >
                  {child.first_name[0]}{child.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/kinder/${child.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-600 truncate block">
                    {child.first_name} {child.last_name}
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {rep && (
                      <span className="text-[10px] text-gray-400">{moodEmoji[rep.mood] ?? '😐'} Bericht</span>
                    )}
                    {sleep && sleep.duration_minutes && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Moon size={9} /> {Math.floor(sleep.duration_minutes / 60)}h{sleep.duration_minutes % 60 > 0 ? `${sleep.duration_minutes % 60}m` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {!att ? (
                    <span className="w-2 h-2 rounded-full bg-gray-200 block" />
                  ) : isPresent ? (
                    <span className="w-2 h-2 rounded-full bg-green-400 block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-red-300 block" />
                  )}
                </div>
              </div>
            )
          })}
          {(children as any[]).length > 20 && (
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              <Link href="/kinder" className="text-xs text-brand-600">Alle {(children as any[]).length} Kinder anzeigen →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick notes */}
      {notes && notes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <StickyNote size={12} /> Notizen
            </h2>
            <Link href="/notizen" className="text-xs text-brand-600">Alle →</Link>
          </div>
          <div className="space-y-2">
            {(notes as any[]).map((n: any) => (
              <div key={n.id} className="card p-3.5 bg-amber-50 border-amber-100">
                <p className="text-sm text-gray-800">{n.content}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {n.profiles?.full_name ?? 'Unbekannt'} · {format(new Date(n.created_at), 'd. MMM, HH:mm', { locale: de })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick observation */}
      <SchnellBeobachtung
        children={(children as any[]).filter((c: any) => attendanceMap[c.id]?.status === 'present' || !attendanceMap[c.id]).map((c: any) => ({ id: c.id, first_name: c.first_name, last_name: c.last_name }))}
        authorId={user.id}
        siteId={siteId}
      />

      <AiTagesjournalSynthese />

      <AiTagesAbschluss />

      {/* Journal entry (client component for live editing) */}
      <TagesjournalClient userId={user.id} siteId={siteId} today={today} />
    </div>
  )
}
