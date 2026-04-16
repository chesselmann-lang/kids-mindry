import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Calendar, Users, Info, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import type { KitaEvent } from '@/types/database'
import RsvpButton from './rsvp-button'
import AiKalender from './ai-kalender'

const typeLabels: Record<string, string> = {
  event:          'Veranstaltung',
  excursion:      'Ausflug',
  parent_evening: 'Elternabend',
  holiday:        'Feiertag',
  closed:         'Geschlossen',
  other:          'Sonstiges',
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .eq('site_id', process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!)
    .single()

  if (!event) notFound()

  const ev = event as KitaEvent
  const startDate = new Date(ev.starts_at)
  const endDate = ev.ends_at ? new Date(ev.ends_at) : null

  // RSVP status for current user
  const { data: myRsvp } = await supabase
    .from('event_rsvps')
    .select('status')
    .eq('event_id', ev.id)
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  // RSVP count
  const { count: yesCount } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', ev.id)
    .eq('status', 'yes')

  // Admin: load all RSVPs with profiles
  let allRsvps: any[] = []
  if (isStaff && ev.rsvp_required) {
    const { data } = await supabase
      .from('event_rsvps')
      .select('status, user_id, profiles(full_name, role)')
      .eq('event_id', ev.id)
      .order('status')
    allRsvps = data ?? []
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/kalender" className="text-xs text-brand-600 mb-1 flex items-center gap-1">
          <ArrowLeft size={12} /> Kalender
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ backgroundColor: ev.color + '25', color: ev.color }}
          >
            <span className="text-[10px] font-bold uppercase">{format(startDate, 'MMM', { locale: de })}</span>
            <span className="text-2xl font-bold leading-none">{format(startDate, 'd')}</span>
          </div>
          <div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: ev.color + '20', color: ev.color }}
            >
              {typeLabels[ev.type] ?? ev.type}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1 leading-snug">{ev.title}</h1>
          </div>
        </div>
      </div>

      <AiKalender eventId={params.id} />

      {/* Event details card */}
      <div className="card p-5 space-y-4">
        {/* Date / Time */}
        <div className="flex items-start gap-3">
          <Calendar size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {format(startDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </p>
            {!ev.all_day && (
              <p className="text-sm text-gray-500 mt-0.5">
                {format(startDate, 'HH:mm')} Uhr
                {endDate && ` – ${format(endDate, 'HH:mm')} Uhr`}
              </p>
            )}
            {ev.all_day && <p className="text-xs text-gray-400 mt-0.5">Ganztägig</p>}
          </div>
        </div>

        {/* Location */}
        {ev.location && (
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700">{ev.location}</p>
          </div>
        )}

        {/* Time remaining */}
        <div className="flex items-start gap-3">
          <Clock size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">
            {startDate > new Date()
              ? `In ${Math.ceil((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Tagen`
              : startDate.toDateString() === new Date().toDateString()
              ? 'Heute'
              : 'Vergangen'
            }
          </p>
        </div>

        {/* RSVP count */}
        {ev.rsvp_required && (
          <div className="flex items-start gap-3">
            <Users size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">{yesCount ?? 0}</span> Anmeldungen
                {ev.max_participants && ` von ${ev.max_participants} möglich`}
              </p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">Anmeldung erforderlich</p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {ev.description && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{ev.description}</p>
        </div>
      )}

      {/* Staff: RSVP-Liste */}
      {isStaff && ev.rsvp_required && allRsvps.length > 0 && (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Anmeldungen ({yesCount ?? 0} Ja)
            </p>
          </div>
          {allRsvps.map((r: any, idx: number) => {
            const icon = r.status === 'yes'
              ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              : r.status === 'no'
              ? <XCircle size={16} className="text-red-400 flex-shrink-0" />
              : <HelpCircle size={16} className="text-amber-400 flex-shrink-0" />
            const label = r.status === 'yes' ? 'Zugesagt' : r.status === 'no' ? 'Abgesagt' : 'Vielleicht'
            return (
              <div key={r.user_id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                {icon}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{(r.profiles as any)?.full_name ?? 'Unbekannt'}</p>
                </div>
                <span className={`text-xs font-medium ${r.status === 'yes' ? 'text-green-600' : r.status === 'no' ? 'text-red-500' : 'text-amber-600'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* RSVP */}
      {ev.rsvp_required && (
        <RsvpButton
          eventId={ev.id}
          userId={user.id}
          currentStatus={myRsvp?.status as 'yes' | 'no' | 'maybe' | null}
          eventTitle={ev.title}
          eventColor={ev.color}
        />
      )}
    </div>
  )
}
