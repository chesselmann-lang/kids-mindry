import { createClient } from '@/lib/supabase/server'
import { Bell, CalendarDays, BookOpen, Moon, Utensils, ChevronRight } from 'lucide-react'
import type { Announcement } from '@/types/database'
import Link from 'next/link'
import PostButton from './post-button'
import FeedLiveBanner from './feed-live-banner'
import QuickWidgets from './quick-widgets'
import FavoritenStrip from './favoriten-strip'
import OnboardingTour from './onboarding-tour'
import FeedAnnouncements from './feed-announcements'
import AiFeedAnalyse from './ai-feed-analyse'

export const metadata = { title: 'Neuigkeiten' }

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: profile } = await (supabase as any)
    .from('profiles').select('role, language').eq('id', user!.id).single()

  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const userLanguage: string | undefined = (profile as any)?.language ?? undefined

  // Für Eltern: Kinder-Gruppen ermitteln
  let parentGroupIds: string[] = []
  if (!isStaff) {
    const { data: guardians } = await supabase
      .from('guardians')
      .select('children(group_id)')
      .eq('user_id', user!.id)

    parentGroupIds = (guardians ?? [])
      .flatMap((g: any) => g.children ? [g.children.group_id] : [])
      .filter(Boolean) as string[]
  }

  // Ankündigungen laden — Eltern sehen nur ihre Gruppen + site-wide (group_id = null)
  let announcementsQuery = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .eq('site_id', siteId)
    .order('pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(30)

  // Eltern: nur site-wide ODER eigene Gruppe(n)
  if (!isStaff && parentGroupIds.length > 0) {
    // PostgREST: group_id IS NULL OR group_id IN (...)
    announcementsQuery = announcementsQuery.or(
      `group_id.is.null,group_id.in.(${parentGroupIds.join(',')})`
    )
  } else if (!isStaff) {
    // Kein Kind verknüpft → nur site-wide
    announcementsQuery = announcementsQuery.is('group_id', null)
  }

  const { data: announcements, count: announcementCount } = await announcementsQuery

  // Gruppen-Map für Badge
  const allGroupIds = Array.from(new Set((announcements ?? []).map((a: any) => a.group_id).filter(Boolean)))
  let groupMap: Record<string, { name: string; color: string }> = {}
  if (allGroupIds.length > 0) {
    const { data: groups } = await supabase
      .from('groups')
      .select('id, name, color')
      .in('id', allGroupIds)
    groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, { name: g.name, color: g.color }]))
  }

  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('site_id', siteId)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(3)

  // Für Eltern: Heutige Tagesberichte für eigene Kinder
  type DailyReportEntry = {
    child_id: string; report_date: string; mood: string | null
    sleep_hours: number | null; sleep_mins: number | null
    breakfast: string | null; lunch: string | null; snack: string | null
    notes: string | null
    children: { first_name: string; last_name: string } | null
  }
  let parentTodayReports: DailyReportEntry[] = []
  if (!isStaff) {
    const today = new Date().toISOString().split('T')[0]
    const { data: guardianLinks } = await supabase
      .from('guardians').select('child_id').eq('user_id', user!.id)
    const childIds = (guardianLinks ?? []).map((g: any) => g.child_id).filter(Boolean)
    if (childIds.length > 0) {
      const { data: reports } = await (supabase as any)
        .from('daily_reports')
        .select('child_id, report_date, mood, sleep_hours, sleep_mins, breakfast, lunch, snack, notes, children(first_name, last_name)')
        .in('child_id', childIds)
        .eq('report_date', today)
      parentTodayReports = (reports ?? []) as DailyReportEntry[]
    }
  }

  // Today's birthdays (staff sees for all children)
  let todayBirthdays: { first_name: string; last_name: string; turnsAge: number }[] = []
  if (isStaff) {
    const today = new Date()
    const todayMD = `${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const { data: allKids } = await supabase
      .from('children')
      .select('first_name, last_name, date_of_birth')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .not('date_of_birth', 'is', null)
    for (const kid of (allKids ?? []) as any[]) {
      const dobMD = kid.date_of_birth.slice(5) // "MM-DD"
      if (dobMD === todayMD) {
        const turnsAge = today.getFullYear() - parseInt(kid.date_of_birth.slice(0, 4))
        todayBirthdays.push({ first_name: kid.first_name, last_name: kid.last_name, turnsAge })
      }
    }
  }

  return (
    <div className="space-y-6">
      <OnboardingTour isStaff={isStaff} />
      <FeedLiveBanner siteId={siteId} initialCount={announcementCount ?? 0} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neuigkeiten</h1>
          <p className="text-sm text-gray-500 mt-0.5">Alles Wichtige aus dem Kita-Alltag</p>
        </div>
        {isStaff && <PostButton siteId={siteId} authorId={user!.id} />}
      </div>

      {isStaff && <AiFeedAnalyse />}

      {/* Quick widgets */}
      <QuickWidgets isStaff={isStaff} />

      {/* Favoriten-Kinder Strip (only for staff) */}
      {isStaff && <FavoritenStrip userId={user!.id} siteId={siteId} />}

      {/* Heutiger Tagesbericht(e) für Eltern */}
      {!isStaff && parentTodayReports.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BookOpen size={11} className="text-brand-500" />
            Tagesbericht
          </h2>
          <div className="space-y-3">
            {parentTodayReports.map((r) => {
              const moodMap: Record<string, { emoji: string; label: string }> = {
                great: { emoji: '😄', label: 'Super' }, good: { emoji: '🙂', label: 'Gut' },
                okay: { emoji: '😐', label: 'Ok' }, sad: { emoji: '😢', label: 'Traurig' },
                sick: { emoji: '🤒', label: 'Krank' },
              }
              const mood = r.mood ? moodMap[r.mood] : null
              const sleepTotal = (r.sleep_hours ?? 0) * 60 + (r.sleep_mins ?? 0)
              const childName = r.children ? `${r.children.first_name} ${r.children.last_name}` : 'Kind'
              return (
                <Link key={r.child_id} href={`/tagesberichte/${r.child_id}/${r.report_date}`}
                  className="card p-4 flex gap-3 hover:shadow-card-hover transition-shadow group">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-100 to-violet-200 flex items-center justify-center flex-shrink-0 text-lg">
                    {mood?.emoji ?? '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900">{childName}</p>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-500 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {mood ? `Stimmung: ${mood.label}` : 'Tagesbericht verfügbar'}
                    </p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      {sleepTotal > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Moon size={10} />
                          {r.sleep_hours ? `${r.sleep_hours}h` : ''}{r.sleep_mins ? ` ${r.sleep_mins}min` : ''} Schlaf
                        </span>
                      )}
                      {r.lunch && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Utensils size={10} />
                          Mittagessen: {r.lunch}
                        </span>
                      )}
                      {r.notes && (
                        <span className="text-xs text-gray-400 truncate max-w-[180px]">
                          💬 {r.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Today's birthdays banner — staff only */}
      {isStaff && todayBirthdays.length > 0 && (
        <div className="card p-4 bg-yellow-50 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🎂</span>
            <p className="font-bold text-sm text-yellow-900">
              {todayBirthdays.length === 1
                ? 'Heute hat ein Kind Geburtstag!'
                : `Heute haben ${todayBirthdays.length} Kinder Geburtstag!`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {todayBirthdays.map((b, i) => (
              <span key={i} className="text-xs bg-yellow-100 text-yellow-800 font-medium px-2.5 py-1 rounded-full">
                🎉 {b.first_name} {b.last_name} wird {b.turnsAge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming events strip */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Nächste Termine</h2>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
            {(upcomingEvents as any[]).map(ev => {
              const d = new Date(ev.starts_at)
              return (
                <Link key={ev.id} href={`/kalender/${ev.id}`}
                  className="snap-start flex-shrink-0 w-44 card p-4 hover:shadow-card-hover transition-shadow"
                  style={{ borderTop: `3px solid ${ev.color}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ev.color }}>
                    {d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">{ev.title}</p>
                  {!ev.all_day && (
                    <p className="text-xs text-gray-400 mt-1">{d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</p>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Announcements with Infinite Scroll */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pinnwand</h2>
        {!announcements || announcements.length === 0 ? (
          <div className="card p-8 text-center">
            <Bell size={40} className="text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-500 text-sm">Noch keine Beiträge vorhanden</p>
            {isStaff && <p className="text-gray-400 text-xs mt-1">Erstelle den ersten Beitrag mit dem + Button</p>}
          </div>
        ) : (
          <FeedAnnouncements
            initialAnnouncements={announcements as any[]}
            initialHasMore={(announcementCount ?? 0) > (announcements?.length ?? 0)}
            initialTotal={announcementCount ?? 0}
            siteId={siteId}
            isStaff={isStaff}
            userId={user!.id}
            userLanguage={userLanguage}
            groupMap={groupMap}
          />
        )}
      </div>
    </div>
  )
}
