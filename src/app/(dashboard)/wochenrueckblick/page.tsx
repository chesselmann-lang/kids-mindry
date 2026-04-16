import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react'
import { startOfWeek, endOfWeek, format, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'
import AiWochenbrief from './ai-wochenbrief'

export const metadata = { title: 'Wockenrückblick' }

export default async function WochenrueckblickPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Load children for this user (parents see their children, staff see all)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  let childIds: string[] = []
  if (isStaff) {
    const { data: all } = await supabase
      .from('children').select('id').eq('site_id', siteId).eq('status', 'active')
    childIds = (all ?? []).map((c: any) => c.id)
  } else {
    const { data: guardians } = await supabase
      .from('guardians').select('child_id').eq('user_id', user.id)
    childIds = (guardians ?? []).map((g: any) => g.child_id)
  }

  if (childIds.length === 0) redirect('/feed')

  // Week range (default: last week, or this week if Mon)
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun, 1=Mon...
  const useLastWeek = dayOfWeek === 0 || dayOfWeek === 1 // Sun or Mon → show last week
  const refDate = useLastWeek ? subWeeks(now, 1) : now
  const weekStart = startOfWeek(refDate, { weekStartsOn: 1 })
  const weekEnd   = endOfWeek(refDate, { weekStartsOn: 1 })
  const fromISO   = weekStart.toISOString()
  const toISO     = weekEnd.toISOString()
  const label     = `${format(weekStart, 'd. MMM', { locale: de })} – ${format(weekEnd, 'd. MMM', { locale: de })}`

  const [
    { data: observations },
    { data: reports },
    { data: healthRecords },
    { data: attendance },
    { data: milestones },
    { data: children },
  ] = await Promise.all([
    supabase.from('observations')
      .select('id, content, created_at, child_id, children(first_name, last_name)')
      .in('child_id', childIds)
      .gte('created_at', fromISO).lte('created_at', toISO)
      .order('created_at', { ascending: false }),
    supabase.from('daily_reports')
      .select('id, mood, summary, created_at, child_id, children(first_name, last_name)')
      .in('child_id', childIds)
      .gte('report_date', weekStart.toISOString().split('T')[0])
      .lte('report_date', weekEnd.toISOString().split('T')[0])
      .order('report_date', { ascending: false }),
    supabase.from('health_records')
      .select('id, type, description, created_at, child_id, children(first_name, last_name)')
      .in('child_id', childIds)
      .gte('created_at', fromISO).lte('created_at', toISO),
    supabase.from('attendance')
      .select('id, status, date, child_id, children(first_name, last_name)')
      .in('child_id', childIds)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0]),
    supabase.from('milestones')
      .select('id, title, achieved_at, child_id, children(first_name, last_name)')
      .in('child_id', childIds)
      .gte('achieved_at', weekStart.toISOString().split('T')[0])
      .lte('achieved_at', weekEnd.toISOString().split('T')[0]),
    supabase.from('children')
      .select('id, first_name, last_name, group_id, groups(color, name)')
      .in('id', childIds),
  ])

  const childMap = Object.fromEntries((children ?? []).map((c: any) => [c.id, c]))

  // Attendance summary per child
  const attByChild: Record<string, { present: number; absent: number }> = {}
  ;(attendance ?? []).forEach((a: any) => {
    if (!attByChild[a.child_id]) attByChild[a.child_id] = { present: 0, absent: 0 }
    if (a.status === 'present') attByChild[a.child_id].present++
    else attByChild[a.child_id].absent++
  })

  const MOOD_ICONS: Record<string, string> = { great: '😄', good: '🙂', neutral: '😐', sad: '😔', upset: '😢' }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Wochenrückblick</h1>
          <p className="text-sm text-gray-400">{label}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <BookOpen size={20} className="text-brand-600" />
        </div>
      </div>

      {/* Per-child sections */}
      {(children ?? []).map((child: any) => {
        const cid = child.id
        const childObs    = (observations ?? []).filter((o: any) => o.child_id === cid)
        const childRep    = (reports ?? []).filter((r: any) => r.child_id === cid)
        const childHealth = (healthRecords ?? []).filter((h: any) => h.child_id === cid)
        const childMiles  = (milestones ?? []).filter((m: any) => m.child_id === cid)
        const att         = attByChild[cid] ?? { present: 0, absent: 0 }
        const color       = child.groups?.color ?? '#3B6CE8'

        return (
          <div key={cid} className="space-y-3">
            {/* Child header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ backgroundColor: color }}>
                {child.first_name[0]}{child.last_name[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900">{child.first_name} {child.last_name}</p>
                {child.groups && <p className="text-xs text-gray-400">{child.groups.name}</p>}
              </div>
            </div>

            {/* Attendance pill */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                {att.present}× anwesend
              </span>
              {att.absent > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                  {att.absent}× abwesend
                </span>
              )}
            </div>

            {/* AI Wochenbrief */}
            <AiWochenbrief childId={cid} childName={child.first_name} />

            {/* Milestones */}
            {childMiles.length > 0 && (
              <div className="card p-3 bg-amber-50 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={13} className="text-amber-500" />
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Neue Meilensteine 🎉</p>
                </div>
                {childMiles.map((m: any) => (
                  <p key={m.id} className="text-sm text-amber-800 font-medium">· {m.title}</p>
                ))}
              </div>
            )}

            {/* Daily reports */}
            {childRep.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tagesberichte</p>
                {childRep.map((r: any) => (
                  <div key={r.id} className="card p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{MOOD_ICONS[r.mood] ?? '🙂'}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(r.created_at), 'EEEE, d. MMM', { locale: de })}
                      </span>
                    </div>
                    {r.summary && <p className="text-sm text-gray-700 leading-relaxed">{r.summary}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Observations */}
            {childObs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Beobachtungen</p>
                {childObs.map((o: any) => (
                  <div key={o.id} className="card p-3">
                    <p className="text-sm text-gray-700 leading-relaxed">{o.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {format(new Date(o.created_at), 'd. MMM', { locale: de })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Health */}
            {childHealth.length > 0 && (
              <div className="card p-3 border border-red-100 bg-red-50">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Gesundheit</p>
                {childHealth.map((h: any) => (
                  <p key={h.id} className="text-sm text-red-800">· {h.type ?? 'Eintrag'}: {h.description}</p>
                ))}
              </div>
            )}

            {childObs.length === 0 && childRep.length === 0 && childHealth.length === 0 && childMiles.length === 0 && (
              <div className="card p-4 text-center">
                <p className="text-sm text-gray-400">Diese Woche keine Einträge vorhanden.</p>
              </div>
            )}

            <hr className="border-gray-100" />
          </div>
        )
      })}
    </div>
  )
}
