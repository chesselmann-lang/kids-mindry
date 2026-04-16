'use client'

import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  BookOpen, Heart, LogIn, Target, Eye, Filter,
  Smile, Meh, Frown, Star
} from 'lucide-react'
import Link from 'next/link'

type EventType = 'report' | 'observation' | 'health' | 'attendance' | 'goal'

interface TimelineEvent {
  id: string
  date: string
  type: EventType
  title: string
  subtitle?: string
  extra?: string
  href?: string
}

const TYPE_CONFIG: Record<EventType, { label: string; icon: any; color: string; bg: string; border: string }> = {
  report:      { label: 'Tagesbericht',  icon: BookOpen, color: 'text-brand-600',  bg: 'bg-brand-100',  border: 'border-brand-300' },
  observation: { label: 'Beobachtung',   icon: Eye,      color: 'text-teal-600',   bg: 'bg-teal-100',   border: 'border-teal-300' },
  health:      { label: 'Gesundheit',    icon: Heart,    color: 'text-red-600',    bg: 'bg-red-100',    border: 'border-red-300' },
  attendance:  { label: 'Anwesenheit',   icon: LogIn,    color: 'text-green-600',  bg: 'bg-green-100',  border: 'border-green-300' },
  goal:        { label: 'Förderplan',    icon: Target,   color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300' },
}

const MOOD_ICONS: Record<string, any> = {
  great: Star, good: Smile, neutral: Meh, bad: Frown,
}
const MOOD_COLORS: Record<string, string> = {
  great: 'text-yellow-500', good: 'text-green-500', neutral: 'text-gray-400', bad: 'text-red-400',
}

const ALL_TYPES: EventType[] = ['report', 'observation', 'health', 'attendance', 'goal']

interface Props {
  reports: any[]
  observations: any[]
  healthRecords: any[]
  attendance: any[]
  foerderGoals: any[]
  isStaff: boolean
  childId: string
}

export default function TimelineClient({
  reports, observations, healthRecords, attendance, foerderGoals, isStaff, childId
}: Props) {
  const [activeFilter, setActiveFilter] = useState<EventType | 'all'>('all')

  const events = useMemo<TimelineEvent[]>(() => {
    const list: TimelineEvent[] = []

    reports.forEach(r => {
      const MoodIcon = MOOD_ICONS[r.mood] ?? Smile
      list.push({
        id: `report-${r.id}`,
        date: r.report_date,
        type: 'report',
        title: 'Tagesbericht',
        subtitle: r.activities ? r.activities.slice(0, 60) + (r.activities.length > 60 ? '…' : '') : undefined,
        extra: r.mood,
        href: `/tagesberichte/${r.id}`,
      })
    })

    observations.forEach(o => list.push({
      id: `obs-${o.id}`,
      date: o.observation_date,
      type: 'observation',
      title: o.title ?? 'Beobachtung',
      subtitle: o.notes ? o.notes.slice(0, 60) + (o.notes.length > 60 ? '…' : '') : undefined,
    }))

    healthRecords.forEach(h => list.push({
      id: `health-${h.id}`,
      date: h.record_date,
      type: 'health',
      title: h.title ?? h.record_type,
      subtitle: h.record_type,
    }))

    attendance.forEach(a => {
      if (a.check_in_at) list.push({
        id: `att-${a.id}`,
        date: a.date,
        type: 'attendance',
        title: `${a.check_in_at?.slice(11,16) ?? ''}${a.check_out_at ? ` – ${a.check_out_at.slice(11,16)}` : ' (noch da)'}`,
        subtitle: undefined,
      })
    })

    foerderGoals.forEach(g => list.push({
      id: `goal-${g.id}`,
      date: g.created_at?.split('T')[0] ?? '',
      type: 'goal',
      title: g.title,
      subtitle: g.status === 'active' ? 'Aktiv' : 'Abgeschlossen',
    }))

    return list.filter(e => e.date).sort((a, b) => b.date.localeCompare(a.date))
  }, [reports, observations, healthRecords, attendance, foerderGoals])

  const filtered = activeFilter === 'all' ? events : events.filter(e => e.type === activeFilter)

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>()
    filtered.forEach(e => {
      const existing = map.get(e.date) ?? []
      existing.push(e)
      map.set(e.date, existing)
    })
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            activeFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Alle ({events.length})
        </button>
        {ALL_TYPES.map(t => {
          const count = events.filter(e => e.type === t).length
          if (count === 0) return null
          const cfg = TYPE_CONFIG[t]
          return (
            <button
              key={t}
              onClick={() => setActiveFilter(t)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === t ? `${cfg.bg} ${cfg.color}` : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {grouped.length === 0 ? (
        <div className="card p-8 text-center">
          <Filter size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Einträge gefunden</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dayEvents]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 sticky top-0 bg-gray-50 py-1">
                {format(parseISO(date), 'EEEE, d. MMMM yyyy', { locale: de })}
              </p>
              <div className="relative pl-5">
                {/* Vertical line */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-3">
                  {dayEvents.map(event => {
                    const cfg = TYPE_CONFIG[event.type]
                    const Icon = cfg.icon
                    const MoodIcon = event.extra ? (MOOD_ICONS[event.extra] ?? null) : null

                    const inner = (
                      <div className={`card p-3 flex items-start gap-3 border-l-2 ${cfg.border}`}>
                        <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={13} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                            {MoodIcon && (
                              <MoodIcon size={13} className={MOOD_COLORS[event.extra!] ?? 'text-gray-400'} />
                            )}
                          </div>
                          {event.subtitle && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{event.subtitle}</p>
                          )}
                          <span className={`text-[10px] font-bold ${cfg.color} mt-1 inline-block`}>{cfg.label}</span>
                        </div>
                      </div>
                    )

                    return event.href ? (
                      <Link key={event.id} href={event.href} className="block hover:opacity-90 transition-opacity">
                        {inner}
                      </Link>
                    ) : (
                      <div key={event.id}>{inner}</div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
