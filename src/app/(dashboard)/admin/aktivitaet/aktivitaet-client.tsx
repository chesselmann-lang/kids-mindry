'use client'

import { useState, useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  BookOpen, Heart, AlertTriangle, Thermometer,
  ShoppingCart, CheckCircle2, Target, Filter, Activity
} from 'lucide-react'

type EventType = 'observation' | 'health' | 'incident' | 'sick' | 'order' | 'attendance' | 'goal'

interface FeedEvent {
  id: string
  type: EventType
  created_at: string
  title: string
  sub: string
  badge: string
  badgeColor: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

const TYPE_CONFIG: Record<EventType, { label: string; icon: React.ElementType; iconBg: string; iconColor: string; badgeColor: string }> = {
  observation: { label: 'Beobachtung',   icon: BookOpen,      iconBg: 'bg-teal-100',   iconColor: 'text-teal-600',   badgeColor: 'bg-teal-100 text-teal-700' },
  health:      { label: 'Gesundheit',    icon: Heart,         iconBg: 'bg-red-100',    iconColor: 'text-red-500',    badgeColor: 'bg-red-100 text-red-700' },
  incident:    { label: 'Vorfall',       icon: AlertTriangle, iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  badgeColor: 'bg-amber-100 text-amber-700' },
  sick:        { label: 'Krankmeldung',  icon: Thermometer,   iconBg: 'bg-rose-100',   iconColor: 'text-rose-600',   badgeColor: 'bg-rose-100 text-rose-700' },
  order:       { label: 'Bestellung',    icon: ShoppingCart,  iconBg: 'bg-emerald-100',iconColor: 'text-emerald-600',badgeColor: 'bg-emerald-100 text-emerald-700' },
  attendance:  { label: 'Anwesenheit',   icon: CheckCircle2,  iconBg: 'bg-green-100',  iconColor: 'text-green-600',  badgeColor: 'bg-green-100 text-green-700' },
  goal:        { label: 'Förderziel',    icon: Target,        iconBg: 'bg-brand-100',  iconColor: 'text-brand-600',  badgeColor: 'bg-brand-100 text-brand-700' },
}

interface Props {
  observations: any[]
  healthRecords: any[]
  incidents: any[]
  sickReports: any[]
  materialOrders: any[]
  attendanceToday: any[]
  foerderGoals: any[]
}

function childName(c: any) {
  if (!c) return 'Unbekannt'
  return `${c.first_name} ${c.last_name}`
}

function staffName(p: any) {
  return p?.full_name ?? 'Unbekannt'
}

function attLabel(status: string) {
  const map: Record<string, string> = {
    present: 'Eingecheckt', absent_sick: 'Krank', absent_vacation: 'Urlaub',
    absent_other: 'Abwesend', unknown: 'Status offen'
  }
  return map[status] ?? status
}

export default function AktivitaetClient({
  observations, healthRecords, incidents, sickReports,
  materialOrders, attendanceToday, foerderGoals
}: Props) {
  const [filter, setFilter] = useState<EventType | 'all'>('all')

  const allEvents = useMemo<FeedEvent[]>(() => {
    const events: FeedEvent[] = []

    observations.forEach(o => {
      const cfg = TYPE_CONFIG.observation
      events.push({
        id: `obs_${o.id}`, type: 'observation', created_at: o.created_at,
        title: `Beobachtung: ${childName(o.children)}`,
        sub: `${staffName(o.profiles)} · ${(o.content as string)?.slice(0, 60)}${(o.content?.length ?? 0) > 60 ? '…' : ''}`,
        badge: cfg.label, badgeColor: cfg.badgeColor,
        icon: cfg.icon, iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      })
    })

    healthRecords.forEach(h => {
      const cfg = TYPE_CONFIG.health
      events.push({
        id: `health_${h.id}`, type: 'health', created_at: h.created_at,
        title: `${h.record_type ?? 'Gesundheit'}: ${childName(h.children)}`,
        sub: `${staffName(h.profiles)} · ${h.description?.slice(0, 60) ?? ''}`,
        badge: cfg.label, badgeColor: cfg.badgeColor,
        icon: cfg.icon, iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      })
    })

    incidents.forEach(i => {
      const cfg = TYPE_CONFIG.incident
      const severity: Record<string, string> = { low: 'Gering', medium: 'Mittel', high: 'Hoch', critical: 'Kritisch' }
      events.push({
        id: `inc_${i.id}`, type: 'incident', created_at: i.created_at,
        title: i.title ?? `Vorfall: ${childName(i.children)}`,
        sub: `${staffName(i.profiles)} · Schwere: ${severity[i.severity] ?? i.severity}`,
        badge: cfg.label, badgeColor: cfg.badgeColor,
        icon: cfg.icon, iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      })
    })

    sickReports.forEach(s => {
      const cfg = TYPE_CONFIG.sick
      events.push({
        id: `sick_${s.id}`, type: 'sick', created_at: s.created_at,
        title: `Krankmeldung: ${staffName(s.profiles)}`,
        sub: `${s.start_date} – ${s.end_date ?? 'offen'}`,
        badge: cfg.label, badgeColor: cfg.badgeColor,
        icon: cfg.icon, iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      })
    })

    materialOrders.forEach(o => {
      const cfg = TYPE_CONFIG.order
      const statusLabel: Record<string, string> = {
        pending: 'Beantragt', approved: 'Genehmigt', ordered: 'Bestellt', received: 'Erhalten', rejected: 'Abgelehnt'
      }
      events.push({
        id: `order_${o.id}`, type: 'order', created_at: o.created_at,
        title: `${o.item_name} (${o.quantity})`,
        sub: `${staffName(o.profiles)} · ${statusLabel[o.status] ?? o.status}`,
        badge: cfg.label, badgeColor: cfg.badgeColor,
        icon: cfg.icon, iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      })
    })

    attendanceToday.forEach(a => {
      const cfg = TYPE_CONFIG.attendance
      events.push({
        id: `att_${a.id}`, type: 'attendance', created_at: a.created_at,
        title: `${attLabel(a.status)}: ${childName(a.children)}`,
        sub: staffName(a.profiles),
        badge: cfg.label, badgeColor: cfg.badgeColor,
        icon: cfg.icon, iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      })
    })

    foerderGoals.forEach(g => {
      const cfg = TYPE_CONFIG.goal
      events.push({
        id: `goal_${g.id}`, type: 'goal', created_at: g.created_at,
        title: g.title ?? `Förderziel: ${childName(g.children)}`,
        sub: `${staffName(g.profiles)} · ${g.status ?? 'aktiv'}`,
        badge: cfg.label, badgeColor: cfg.badgeColor,
        icon: cfg.icon, iconBg: cfg.iconBg, iconColor: cfg.iconColor,
      })
    })

    return events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [observations, healthRecords, incidents, sickReports, materialOrders, attendanceToday, foerderGoals])

  const displayEvents = filter === 'all' ? allEvents : allEvents.filter(e => e.type === filter)

  const filterTypes: Array<EventType | 'all'> = ['all', 'observation', 'health', 'incident', 'sick', 'order', 'attendance', 'goal']
  const filterLabels: Record<string, string> = { all: 'Alle', ...Object.fromEntries(Object.entries(TYPE_CONFIG).map(([k, v]) => [k, v.label])) }

  return (
    <div className="space-y-4">
      {/* Filter strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {filterTypes.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === t ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {filterLabels[t]}
          </button>
        ))}
      </div>

      {/* Event count */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Filter size={12} />
        <span>{displayEvents.length} Ereignisse</span>
      </div>

      {/* Event list */}
      {displayEvents.length === 0 ? (
        <div className="card p-8 text-center">
          <Activity size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Aktivitäten in diesem Zeitraum</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayEvents.map(ev => {
            const Icon = ev.icon
            const ago = formatDistanceToNow(new Date(ev.created_at), { locale: de, addSuffix: true })
            return (
              <div key={ev.id} className="card p-3 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${ev.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Icon size={15} className={ev.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ev.badgeColor}`}>
                      {ev.badge}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{ago}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{ev.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ev.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
