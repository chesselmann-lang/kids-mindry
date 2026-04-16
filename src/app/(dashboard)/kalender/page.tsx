import { createClient } from '@/lib/supabase/server'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns'
import { de } from 'date-fns/locale'
import { CalendarDays, MapPin, Users, ChevronRight } from 'lucide-react'
import type { KitaEvent } from '@/types/database'
import { clsx } from 'clsx'
import Link from 'next/link'
import EventCreateButton from './event-create-button'
import ICalButton from './ical-button'
import AiKalenderVorbereitung from './ai-kalender-vorbereitung'

export const metadata = { title: 'Kalender' }

const typeLabels: Record<string, string> = {
  event:          'Veranstaltung',
  excursion:      'Ausflug',
  parent_evening: 'Elternabend',
  holiday:        'Feiertag',
  closed:         'Geschlossen',
  other:          'Sonstiges',
}

export default async function KalenderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('site_id', siteId)
    .gte('starts_at', monthStart.toISOString())
    .lte('starts_at', monthEnd.toISOString())
    .order('starts_at', { ascending: true })

  const { data: futureEvents } = await supabase
    .from('events')
    .select('*')
    .eq('site_id', siteId)
    .gt('starts_at', monthEnd.toISOString())
    .order('starts_at', { ascending: true })
    .limit(5)

  const allEvents = (events ?? []) as KitaEvent[]
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Build event-day map
  const eventDays = new Set(allEvents.map(e => format(new Date(e.starts_at), 'yyyy-MM-dd')))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalender</h1>
          <p className="text-sm text-gray-500 mt-0.5">Termine und Veranstaltungen</p>
        </div>
        <div className="flex items-center gap-2">
          <ICalButton />
          {isStaff && <EventCreateButton siteId={siteId} authorId={user!.id} />}
        </div>
      </div>

      {isStaff && <AiKalenderVorbereitung />}

      {/* Mini calendar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {format(now, 'MMMM yyyy', { locale: de })}
          </h2>
          <span className="text-xs text-gray-400">{allEvents.length} Termin{allEvents.length !== 1 ? 'e' : ''}</span>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
          ))}
        </div>
        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {/* Leading blank cells */}
          {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`blank-${i}`}/>
          ))}
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const hasEvent = eventDays.has(key)
            const today = isToday(day)
            return (
              <div key={key} className="flex flex-col items-center py-0.5">
                <div className={clsx(
                  'w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors',
                  today ? 'bg-brand-800 text-white font-bold' : 'text-gray-700',
                  !today && hasEvent ? 'text-brand-700' : ''
                )}>
                  {format(day, 'd')}
                </div>
                {hasEvent && !today && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-0.5"/>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* This month's events */}
      {allEvents.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Diesen Monat</h2>
          <div className="space-y-3">
            {allEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </div>
      )}

      {/* Upcoming next month */}
      {futureEvents && futureEvents.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Demnächst</h2>
          <div className="space-y-3">
            {(futureEvents as KitaEvent[]).map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </div>
      )}

      {allEvents.length === 0 && (!futureEvents || futureEvents.length === 0) && (
        <div className="card p-10 text-center">
          <CalendarDays size={40} className="text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 text-sm font-medium">Keine Termine vorhanden</p>
          <p className="text-gray-400 text-xs mt-1">Neue Termine werden hier angezeigt, sobald sie eingetragen werden.</p>
        </div>
      )}
    </div>
  )
}

function EventCard({ event: ev }: { event: KitaEvent }) {
  const startDate = new Date(ev.starts_at)
  const typeLabel = typeLabels[ev.type] ?? ev.type

  return (
    <Link href={`/kalender/${ev.id}`} className="card p-4 flex gap-4 items-start hover:shadow-card-hover transition-shadow block">
      {/* Date block */}
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
        style={{ backgroundColor: ev.color + '20', color: ev.color }}>
        <span className="text-[10px] font-bold uppercase">
          {format(startDate, 'MMM', { locale: de })}
        </span>
        <span className="text-2xl font-bold leading-none">{format(startDate, 'd')}</span>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="badge text-[10px] px-2 py-0.5"
            style={{ backgroundColor: ev.color + '20', color: ev.color }}>
            {typeLabel}
          </span>
        </div>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{ev.title}</p>
        {ev.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ev.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {!ev.all_day && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <CalendarDays size={12}/>
              {format(startDate, 'HH:mm', { locale: de })} Uhr
              {ev.ends_at && ` – ${format(new Date(ev.ends_at), 'HH:mm')} Uhr`}
            </span>
          )}
          {ev.location && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin size={12}/> {ev.location}
            </span>
          )}
          {ev.rsvp_required && (
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <Users size={12}/> Anmeldung erforderlich
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1"/>
    </Link>
  )
}
