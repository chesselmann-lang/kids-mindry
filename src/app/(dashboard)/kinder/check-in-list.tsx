'use client'

import { useState, useTransition, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, CheckCircle2, XCircle, Clock, LogIn, LogOut, Loader2, Search, X, Wifi } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Child } from '@/types/database'
import FavoriteButton from './favorite-button'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'

type AttendanceStatus = 'present' | 'absent_sick' | 'absent_vacation' | 'absent_other' | 'unknown'

const statusConfig: Record<AttendanceStatus, { label: string; color: string; icon: React.ElementType }> = {
  present:         { label: 'Anwesend',  color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  absent_sick:     { label: 'Krank',     color: 'bg-red-100 text-red-700',      icon: XCircle },
  absent_vacation: { label: 'Urlaub',    color: 'bg-blue-100 text-blue-700',    icon: XCircle },
  absent_other:    { label: 'Abwesend',  color: 'bg-gray-100 text-gray-600',    icon: XCircle },
  unknown:         { label: 'Unbekannt', color: 'bg-gray-100 text-gray-400',    icon: Clock },
}

type ChildWithGroup = Child & { groupName?: string; groupColor?: string; isFavorite?: boolean }

interface Group { id: string; name: string; color: string }

interface Props {
  children: ChildWithGroup[]
  initialAttendance: Record<string, AttendanceStatus>
  siteId: string
  today: string
  groups?: Group[]
  userId?: string
}

export default function CheckInList({ children, initialAttendance, siteId, today, groups = [], userId = '' }: Props) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(initialAttendance)
  const [pending, setPending] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [realtimeActive, setRealtimeActive] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const childIds = useRef(children.map(c => c.id))

  const handleRefresh = useCallback(async () => {
    router.refresh()
    await new Promise(r => setTimeout(r, 600))
  }, [router])

  // ─── Realtime subscription: attendance changes ─────────────────────────────
  useEffect(() => {
    childIds.current = children.map(c => c.id)
    const channel = supabase
      .channel('checkin-list-attendance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `date=eq.${today}`,
        },
        (payload) => {
          const row = payload.new as { child_id: string; status: AttendanceStatus } | null
          if (!row) return
          if (!childIds.current.includes(row.child_id)) return
          startTransition(() => {
            setAttendance(prev => ({ ...prev, [row.child_id]: row.status }))
          })
          // flash "live update" indicator
          setLastUpdate(new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
          setTimeout(() => setLastUpdate(null), 3000)
        }
      )
      .subscribe((status) => {
        setRealtimeActive(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])

  // ─── Batch: alle sichtbaren Kinder als anwesend markieren ────────────────
  const [batchPending, setBatchPending] = useState(false)
  const [batchDone, setBatchDone] = useState(false)

  async function markAllPresent() {
    const toMark = filtered.filter(c => (attendance[c.id] ?? 'unknown') !== 'present')
    if (toMark.length === 0) return
    setBatchPending(true)
    const now = new Date().toISOString()
    // Upsert in parallel batches of 10
    const chunks: ChildWithGroup[][] = []
    for (let i = 0; i < toMark.length; i += 10) chunks.push(toMark.slice(i, i + 10))
    for (const chunk of chunks) {
      await Promise.all(chunk.map(child =>
        (supabase as any).from('attendance').upsert({
          child_id: child.id, site_id: siteId, date: today,
          status: 'present', check_in_at: now,
        }, { onConflict: 'child_id,date' })
      ))
      startTransition(() => {
        setAttendance(prev => {
          const next = { ...prev }
          chunk.forEach(c => { next[c.id] = 'present' })
          return next
        })
      })
    }
    setBatchPending(false)
    setBatchDone(true)
    setTimeout(() => setBatchDone(false), 3000)
  }

  async function togglePresence(child: ChildWithGroup) {
    const current = attendance[child.id] ?? 'unknown'
    const next: AttendanceStatus = current === 'present' ? 'absent_other' : 'present'
    setPending(child.id)

    const { error } = await (supabase as any).from('attendance').upsert({
      child_id: child.id,
      site_id: siteId,
      date: today,
      status: next,
      ...(next === 'present' ? { check_in_at: new Date().toISOString() } : { check_out_at: new Date().toISOString() }),
    }, { onConflict: 'child_id,date' })

    if (!error) {
      startTransition(() => setAttendance(prev => ({ ...prev, [child.id]: next })))
    }
    setPending(null)
  }

  // Filter children and sort favorites to top
  const filtered = children
    .filter(child => {
      const q = search.trim().toLowerCase()
      const nameMatch = !q ||
        child.first_name.toLowerCase().includes(q) ||
        child.last_name.toLowerCase().includes(q)
      const groupMatch = !groupFilter || child.group_id === groupFilter
      return nameMatch && groupMatch
    })
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1
      if (!a.isFavorite && b.isFavorite) return 1
      return 0
    })

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount  = Object.values(attendance).filter(s => s !== 'present' && s !== 'unknown').length
  const unknownCount = children.length - Object.keys(attendance).filter(k => attendance[k] !== 'unknown').length

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <>
      {/* Live-Indikator */}
      <div className={`flex items-center justify-between transition-all duration-300`}>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className={`w-2 h-2 rounded-full ${realtimeActive ? 'bg-green-400 animate-pulse' : 'bg-gray-300'}`}/>
          {realtimeActive ? 'Live' : 'Verbinde…'}
          <Wifi size={11} className={realtimeActive ? 'text-green-500' : 'text-gray-300'}/>
        </span>
        {lastUpdate && (
          <span className="text-xs text-brand-600 font-medium animate-pulse">
            ↻ Aktualisiert {lastUpdate}
          </span>
        )}
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Anwesend</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{absentCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Abwesend</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{unknownCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Unbekannt</p>
        </div>
      </div>

      {/* Batch Check-in Button */}
      {unknownCount > 0 && (
        <button
          onClick={markAllPresent}
          disabled={batchPending}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            batchDone
              ? 'bg-green-100 text-green-700'
              : batchPending
              ? 'bg-gray-100 text-gray-400'
              : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 active:scale-[0.99]'
          }`}
        >
          {batchPending
            ? <><Loader2 size={15} className="animate-spin"/>Eincheckend…</>
            : batchDone
            ? <><CheckCircle2 size={15}/>Alle eingestempelt!</>
            : <><LogIn size={15}/>{groupFilter ? `Gruppe` : `Alle ${unknownCount}`} jetzt einchecken</>
          }
        </button>
      )}

      {/* Suche */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Kind suchen…"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Gruppenfilter */}
      {groups.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
          <button
            onClick={() => setGroupFilter(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !groupFilter ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alle
          </button>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setGroupFilter(gid => gid === g.id ? null : g.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                groupFilter === g.id
                  ? 'text-white border-transparent'
                  : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={groupFilter === g.id ? { backgroundColor: g.color } : {}}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Kinderliste */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <Search size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Kein Kind gefunden</p>
          {(search || groupFilter) && (
            <button
              onClick={() => { setSearch(''); setGroupFilter(null) }}
              className="text-xs text-brand-600 mt-2"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          {filtered.map((child, idx) => {
            const attStatus = attendance[child.id] ?? 'unknown'
            const cfg = statusConfig[attStatus] ?? statusConfig.unknown
            const StatusIcon = cfg.icon
            const isPresent = attStatus === 'present'
            const isPending = pending === child.id
            const age = child.date_of_birth
              ? Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
              : null

            return (
              <div
                key={child.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: child.groupColor ?? '#3B6CE8' }}
                >
                  {child.first_name[0]}{child.last_name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link href={`/kinder/${child.id}`} className="font-semibold text-sm text-gray-900 hover:text-brand-600">
                      {child.first_name} {child.last_name}
                    </Link>
                    {userId && (
                      <FavoriteButton childId={child.id} userId={userId} isFavorite={child.isFavorite ?? false} />
                    )}
                    {child.groupName && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: (child.groupColor ?? '#3B6CE8') + '20', color: child.groupColor ?? '#3B6CE8' }}
                      >
                        {child.groupName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                      <StatusIcon size={10} />
                      {cfg.label}
                    </span>
                    {age !== null && <span className="text-xs text-gray-400">{age} J.</span>}
                    {child.allergies && child.allergies.length > 0 && (
                      <span className="text-xs text-amber-600">⚠️</span>
                    )}
                  </div>
                </div>

                {/* Check-in / Check-out Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePresence(child)}
                    disabled={isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isPending
                        ? 'bg-gray-100 text-gray-400'
                        : isPresent
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                    }`}
                  >
                    {isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : isPresent ? (
                      <><LogOut size={13} />Check-out</>
                    ) : (
                      <><LogIn size={13} />Check-in</>
                    )}
                  </button>
                  <Link href={`/kinder/${child.id}`}>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
    </PullToRefresh>
  )
}
