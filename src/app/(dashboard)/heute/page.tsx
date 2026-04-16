import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  UserCheck, UserX, HelpCircle, Cake, CalendarDays,
  MessageCircle, ChevronRight, ClipboardList, Users,
  TrendingUp, Bell, Utensils, Leaf, Thermometer, QrCode, Megaphone, LifeBuoy, Sparkles,
} from 'lucide-react'
import AiInsightsWidget from './ai-insights'
import TagesAbschluss from './tages-abschluss'
import AiTagesplan from './ai-tagesplan'
import AiPersonalschluessel from './ai-personalschluessel'
import { format, differenceInDays, addYears, setYear } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Heute' }

function getNextBirthday(dateOfBirth: string) {
  const today = new Date()
  const dob = new Date(dateOfBirth)
  let next = setYear(new Date(dob), today.getFullYear())
  next.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  if (next < today) next = addYears(next, 1)
  const days = differenceInDays(next, today)
  const age = next.getFullYear() - dob.getFullYear()
  return { days, age }
}

export default async function HeutePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  // Determine week start (Monday) for Speiseplan lookup
  const todayDate = new Date(today)
  const dayOfWeek = todayDate.getDay() // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(todayDate)
  monday.setDate(todayDate.getDate() + mondayOffset)
  const weekStart = monday.toISOString().split('T')[0]

  // Day key for today
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayDayKey = dayKeys[todayDate.getDay()]

  // Parallel data fetch
  const [
    { data: children },
    { data: events },
    { data: unreadNotifs },
    { data: todayMenu },
    { data: todaySickReports },
    { count: openTicketCount },
  ] = await Promise.all([
    supabase.from('children').select('id, first_name, last_name, date_of_birth, group_id')
      .eq('site_id', siteId).eq('status', 'active'),
    supabase.from('events').select('id, title, starts_at, all_day')
      .eq('site_id', siteId)
      .gte('starts_at', today)
      .order('starts_at').limit(3),
    supabase.from('notifications').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).is('read_at', null),
    supabase.from('weekly_menus').select('meal_type, title, is_vegetarian, is_vegan')
      .eq('site_id', siteId).eq('week_start', weekStart).eq('day', todayDayKey),
    // Today's child absences (from attendance table)
    supabase.from('attendance')
      .select('child_id, status, notes, children(first_name, last_name, group_id)')
      .neq('status', 'present')
      .eq('date', today),
    // Open support tickets (admin only)
    isAdmin
      ? supabase.from('support_tickets').select('id', { count: 'exact', head: true })
          .eq('site_id', siteId).in('status', ['open', 'in_progress', 'waiting'])
      : Promise.resolve({ count: 0, data: null, error: null }),
  ])

  // Build today's menu map
  const menuByType: Record<string, any> = {}
  for (const m of (todayMenu ?? []) as any[]) menuByType[m.meal_type] = m

  const menuEmoji: Record<string, string> = { breakfast: '🥐', lunch: '🍽️', snack: '🍎' }
  const menuLabel: Record<string, string> = { breakfast: 'Frühstück', lunch: 'Mittagessen', snack: 'Nachmittagssnack' }

  // Filter sick reports to only children from this site
  const childIdSet = new Set((children ?? []).map((c: any) => c.id))
  const sickToday = (todaySickReports ?? []).filter((r: any) => childIdSet.has(r.child_id))

  // Re-fetch attendance with actual child IDs
  const childIds = (children ?? []).map((c: any) => c.id)
  let att: any[] = []
  if (childIds.length > 0) {
    const { data } = await supabase
      .from('attendance').select('child_id, status')
      .in('child_id', childIds).eq('date', today)
    att = data ?? []
  }

  const attMap: Record<string, string> = {}
  for (const a of att) attMap[a.child_id] = a.status

  const presentCount = att.filter(a => a.status === 'present').length
  const absentCount  = att.filter(a => a.status !== 'present').length
  const unknownCount = (children?.length ?? 0) - att.length

  // Today's birthdays
  const todayBirthdays = (children ?? []).filter((c: any) => {
    if (!c.date_of_birth) return false
    const dob = new Date(c.date_of_birth)
    const now = new Date()
    return dob.getDate() === now.getDate() && dob.getMonth() === now.getMonth()
  })

  // Upcoming birthdays (next 7 days, not today)
  const upcomingBirthdays = (children ?? [])
    .filter((c: any) => {
      if (!c.date_of_birth) return false
      const { days } = getNextBirthday(c.date_of_birth)
      return days > 0 && days <= 7
    })
    .sort((a: any, b: any) => getNextBirthday(a.date_of_birth).days - getNextBirthday(b.date_of_birth).days)
    .slice(0, 3)

  // Unread notifications count
  const unreadNotifCount = (unreadNotifs as any)?.count ?? 0

  const dayLabel = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Heute</h1>
        <p className="text-sm text-gray-500 mt-0.5 capitalize">{dayLabel}</p>
      </div>

      {/* Anwesenheits-Übersicht */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Anwesenheit heute</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/kinder" className="card p-4 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-2">
              <UserCheck size={18} className="text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Anwesend</p>
          </Link>
          <Link href="/kinder" className="card p-4 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-2">
              <UserX size={18} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">{absentCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Abwesend</p>
          </Link>
          <Link href="/kinder" className="card p-4 text-center hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-2">
              <HelpCircle size={18} className="text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-400">{unknownCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Unbekannt</p>
          </Link>
        </div>
      </div>

      {/* KI-Insights (Admin) */}
      {isAdmin && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={11} className="text-violet-500" />
              KI-Insights
            </h2>
          </div>
          <AiInsightsWidget />
          <AiPersonalschluessel />
          <AiTagesplan />
        </div>
      )}

      {/* Heute abwesend */}
      {sickToday.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Heute abwesend</h2>
            <span className="text-xs text-gray-400">{sickToday.length} Kind{sickToday.length !== 1 ? 'er' : ''}</span>
          </div>
          <div className="card overflow-hidden p-0">
            {(sickToday as any[]).map((r, idx) => {
              const child = Array.isArray(r.children) ? r.children[0] : r.children
              const statusIcon = {
                sick:     { icon: <Thermometer size={13} />, label: 'Krank',     color: 'text-red-500 bg-red-50' },
                absent:   { icon: <UserX size={13} />,      label: 'Abwesend',  color: 'text-orange-500 bg-orange-50' },
                vacation: { icon: <Leaf size={13} />,       label: 'Urlaub',    color: 'text-sky-500 bg-sky-50' },
              }
              const s = statusIcon[r.status] ?? { icon: <UserX size={13} />, label: r.status, color: 'text-gray-500 bg-gray-100' }
              return (
                <div key={`${r.child_id}-${idx}`} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${s.color}`}>
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {child ? `${child.first_name} ${child.last_name}` : '–'}
                    </p>
                    {r.notes && (
                      <p className="text-xs text-gray-400 truncate">{r.notes}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.color}`}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Heutiger Speiseplan */}
      {(todayMenu && (todayMenu as any[]).length > 0) ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Heute auf dem Tisch</h2>
            <Link href="/speiseplan" className="text-xs text-brand-600 font-medium">Details →</Link>
          </div>
          <div className="card overflow-hidden p-0">
            {(['breakfast', 'lunch', 'snack'] as const).map((mealKey, idx) => {
              const entry = menuByType[mealKey]
              if (!entry) return null
              return (
                <div key={mealKey} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  <span className="text-xl flex-shrink-0">{menuEmoji[mealKey]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium">{menuLabel[mealKey]}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                      {entry.is_vegan && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                          <Leaf size={9} /> Vegan
                        </span>
                      )}
                      {!entry.is_vegan && entry.is_vegetarian && (
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                          <Leaf size={9} /> Vegetarisch
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Speiseplan</h2>
            <Link href="/speiseplan" className="text-xs text-brand-600 font-medium">Bearbeiten →</Link>
          </div>
          <div className="card p-4 flex items-center gap-3 text-gray-400">
            <Utensils size={16} />
            <span className="text-sm">Noch kein Menü für heute eingetragen</span>
          </div>
        </div>
      )}

      {/* Heutige Geburtstage */}
      {todayBirthdays.length > 0 && (
        <div className="card p-4 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex items-center gap-2 mb-3">
            <Cake size={16} className="text-yellow-600" />
            <span className="font-semibold text-sm text-yellow-800">
              Geburtstag heute 🎉
            </span>
          </div>
          <div className="space-y-1.5">
            {(todayBirthdays as any[]).map(c => {
              const { age } = getNextBirthday(c.date_of_birth)
              return (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-800 font-bold text-xs">
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</span>
                    <span className="text-xs text-yellow-700 ml-2">wird {age}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bald: Geburtstage */}
      {upcomingBirthdays.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bald: Geburtstage</h2>
          <div className="card overflow-hidden p-0">
            {(upcomingBirthdays as any[]).map((c, idx) => {
              const { days, age } = getNextBirthday(c.date_of_birth)
              return (
                <div key={c.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  <Cake size={14} className="text-gray-300 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{c.first_name} {c.last_name}</span>
                    <span className="text-xs text-gray-400 ml-2">wird {age}</span>
                  </div>
                  <span className="text-xs text-gray-400">in {days} Tag{days !== 1 ? 'en' : ''}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Nächste Veranstaltungen */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nächste Termine</h2>
          <Link href="/kalender" className="text-xs text-brand-600 font-medium">Alle →</Link>
        </div>
        {!events || events.length === 0 ? (
          <div className="card p-5 text-center">
            <CalendarDays size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Keine Termine geplant</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            {(events as any[]).map((e, idx) => (
              <div key={e.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schnellzugriff */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schnellzugriff</h2>
        <div className="space-y-2">
          <Link href="/kinder" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">Anwesenheit erfassen</p>
              <p className="text-xs text-gray-400">Check-In / Check-Out</p>
            </div>
            <ChevronRight size={15} className="text-gray-300" />
          </Link>

          <Link href="/nachrichten" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">Nachrichten</p>
              <p className="text-xs text-gray-400">Direkt mit Eltern kommunizieren</p>
            </div>
            <ChevronRight size={15} className="text-gray-300" />
          </Link>

          <Link href="/tagesberichte/neu" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <ClipboardList size={18} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">Tagesbericht schreiben</p>
              <p className="text-xs text-gray-400">Für ein Kind</p>
            </div>
            <ChevronRight size={15} className="text-gray-300" />
          </Link>

          {isAdmin && (
            <Link href="/admin/statistik" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-sky-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Statistik</p>
                <p className="text-xs text-gray-400">Monatsübersicht & Export</p>
              </div>
              <ChevronRight size={15} className="text-gray-300" />
            </Link>
          )}

          {isAdmin && (openTicketCount ?? 0) > 0 && (
            <Link href="/admin/support" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow border border-brand-100">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0 relative">
                <LifeBuoy size={18} className="text-brand-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {(openTicketCount ?? 0) > 9 ? '9+' : openTicketCount}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Support-Tickets</p>
                <p className="text-xs text-gray-400">{openTicketCount} offene {(openTicketCount ?? 0) === 1 ? 'Anfrage' : 'Anfragen'}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300" />
            </Link>
          )}

          {unreadNotifCount > 0 && (
            <Link href="/benachrichtigungen" className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow border border-brand-100">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center flex-shrink-0 relative">
                <Bell size={18} className="text-brand-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Benachrichtigungen</p>
                <p className="text-xs text-gray-400">{unreadNotifCount} ungelesen</p>
              </div>
              <ChevronRight size={15} className="text-gray-300" />
            </Link>
          )}

          {/* Tages-Abschluss */}
          <TagesAbschluss />
        </div>
      </div>
    </div>
  )
}
