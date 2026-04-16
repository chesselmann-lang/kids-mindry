'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Maximize2, Minimize2, RefreshCw, Wifi, WifiOff, Users, UserCheck, UserX, Clock } from 'lucide-react'

type AttendanceStatus = 'present' | 'absent_sick' | 'absent_vacation' | 'absent_other' | 'unknown'

interface ChildRow {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  group_id: string | null
  groupName?: string
  groupColor?: string
  status: AttendanceStatus
  check_in_at: string | null
  check_out_at: string | null
}

interface Group {
  id: string
  name: string
  color: string
}

const statusConfig: Record<AttendanceStatus, { label: string; bg: string; border: string; dot: string }> = {
  present:         { label: 'Anwesend',  bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-400' },
  absent_sick:     { label: 'Krank',     bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-400'   },
  absent_vacation: { label: 'Urlaub',    bg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-400'  },
  absent_other:    { label: 'Abwesend',  bg: 'bg-gray-50',   border: 'border-gray-200',  dot: 'bg-gray-400'  },
  unknown:         { label: 'Unbekannt', bg: 'bg-white',     border: 'border-gray-100',  dot: 'bg-gray-200'  },
}

export default function LiveBoard({ siteId }: { siteId: string }) {
  const [children, setChildren] = useState<ChildRow[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [clock, setClock] = useState(new Date())
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  // ─── Live clock ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // ─── Load data ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const [childRes, groupRes, attRes] = await Promise.all([
      supabase.from('children').select('id, first_name, last_name, date_of_birth, group_id')
        .eq('site_id', siteId).eq('status', 'active').order('first_name'),
      supabase.from('groups').select('id, name, color').eq('site_id', siteId),
      (supabase as any).from('attendance').select('child_id, status, check_in_at, check_out_at')
        .eq('date', today),
    ])

    const groupMap: Record<string, Group> = Object.fromEntries(
      (groupRes.data ?? []).map((g: Group) => [g.id, g])
    )
    setGroups(groupRes.data ?? [])

    const attMap: Record<string, { status: AttendanceStatus; check_in_at: string | null; check_out_at: string | null }> = {}
    for (const a of (attRes.data ?? []) as any[]) {
      attMap[a.child_id] = { status: a.status, check_in_at: a.check_in_at, check_out_at: a.check_out_at }
    }

    const enriched: ChildRow[] = (childRes.data ?? []).map((c: any) => ({
      ...c,
      groupName: c.group_id ? groupMap[c.group_id]?.name : undefined,
      groupColor: c.group_id ? groupMap[c.group_id]?.color : undefined,
      status: attMap[c.id]?.status ?? 'unknown',
      check_in_at: attMap[c.id]?.check_in_at ?? null,
      check_out_at: attMap[c.id]?.check_out_at ?? null,
    }))

    setChildren(enriched)
    setLastRefresh(new Date())
    setLoading(false)
  }, [siteId, today])

  useEffect(() => { loadData() }, [loadData])

  // ─── Realtime subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('live-board-attendance')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance', filter: `date=eq.${today}` },
        (payload) => {
          const row = payload.new as any
          if (!row) return
          setChildren(prev =>
            prev.map(c =>
              c.id === row.child_id
                ? { ...c, status: row.status, check_in_at: row.check_in_at, check_out_at: row.check_out_at }
                : c
            )
          )
          setLastRefresh(new Date())
        }
      )
      .subscribe(status => setConnected(status === 'SUBSCRIBED'))

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today])

  // ─── Fullscreen ────────────────────────────────────────────────────────────
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setFullscreen(false)
    }
  }
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const filtered = groupFilter ? children.filter(c => c.group_id === groupFilter) : children
  const presentCount = filtered.filter(c => c.status === 'present').length
  const absentCount  = filtered.filter(c => c.status !== 'present' && c.status !== 'unknown').length
  const unknownCount = filtered.filter(c => c.status === 'unknown').length
  const total        = filtered.length
  const presentPct   = total > 0 ? Math.round((presentCount / total) * 100) : 0

  const sortedChildren = [...filtered].sort((a, b) => {
    const order: Record<AttendanceStatus, number> = {
      present: 0, unknown: 1, absent_sick: 2, absent_vacation: 3, absent_other: 4
    }
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
    return a.first_name.localeCompare(b.first_name)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={28} className="animate-spin text-brand-500" />
      </div>
    )
  }

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-gray-50 overflow-auto p-6' : ''}`}>
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anwesenheitstafel</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
            {format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })}
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-lg">
              {format(clock, 'HH:mm:ss')}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium ${
            connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {connected
              ? <><Wifi size={12} className="animate-pulse"/> Live</>
              : <><WifiOff size={12}/> Getrennt</>
            }
          </span>
          <button
            onClick={() => loadData()}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Manuell aktualisieren"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            title={fullscreen ? 'Vollbild beenden' : 'Vollbild'}
          >
            {fullscreen ? <Minimize2 size={16} className="text-gray-500" /> : <Maximize2 size={16} className="text-gray-500" />}
          </button>
        </div>
      </div>

      {/* ─── Stats ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-4 border-l-4 border-green-400">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-green-500" />
            <span className="text-xs text-gray-500 font-medium">Anwesend</span>
          </div>
          <p className="text-3xl font-bold text-green-600 mt-1">{presentCount}</p>
          <p className="text-xs text-gray-400">{presentPct}% der Gruppe</p>
        </div>
        <div className="card p-4 border-l-4 border-red-300">
          <div className="flex items-center gap-2">
            <UserX size={18} className="text-red-400" />
            <span className="text-xs text-gray-500 font-medium">Abwesend</span>
          </div>
          <p className="text-3xl font-bold text-red-500 mt-1">{absentCount}</p>
          <p className="text-xs text-gray-400">gemeldet</p>
        </div>
        <div className="card p-4 border-l-4 border-gray-300">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Unbekannt</span>
          </div>
          <p className="text-3xl font-bold text-gray-500 mt-1">{unknownCount}</p>
          <p className="text-xs text-gray-400">noch offen</p>
        </div>
        <div className="card p-4 border-l-4 border-brand-300">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-brand-500" />
            <span className="text-xs text-gray-500 font-medium">Gesamt</span>
          </div>
          <p className="text-3xl font-bold text-brand-600 mt-1">{total}</p>
          <p className="text-xs text-gray-400">Kinder</p>
        </div>
      </div>

      {/* ─── Progress bar ────────────────────────────────────────────────────── */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">Anwesenheitsquote heute</span>
          <span className="text-xs font-bold text-green-600">{presentPct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700"
            style={{ width: `${presentPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-green-600">{presentCount} anwesend</span>
          <span className="text-[10px] text-gray-400">{total - presentCount} fehlen noch</span>
        </div>
      </div>

      {/* ─── Group filter ────────────────────────────────────────────────────── */}
      {groups.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
          <button
            onClick={() => setGroupFilter(null)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              !groupFilter ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Alle Gruppen
          </button>
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setGroupFilter(id => id === g.id ? null : g.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                groupFilter === g.id
                  ? 'text-white border-transparent'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
              style={groupFilter === g.id ? { backgroundColor: g.color } : {}}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* ─── Children grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sortedChildren.map(child => {
          const cfg = statusConfig[child.status] ?? statusConfig.unknown
          const initials = `${child.first_name[0]}${child.last_name[0]}`
          const checkInTime = child.check_in_at
            ? format(new Date(child.check_in_at), 'HH:mm')
            : null
          const checkOutTime = child.check_out_at
            ? format(new Date(child.check_out_at), 'HH:mm')
            : null

          return (
            <div
              key={child.id}
              className={`relative rounded-2xl border-2 p-4 flex flex-col items-center text-center transition-all duration-500 ${cfg.bg} ${cfg.border}`}
            >
              {/* Status dot */}
              <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${cfg.dot} ${child.status === 'present' ? 'animate-pulse' : ''}`}/>

              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2 shadow-sm"
                style={{ backgroundColor: child.groupColor ?? '#3B6CE8' }}
              >
                {initials}
              </div>

              {/* Name */}
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {child.first_name}
              </p>
              <p className="text-xs text-gray-500 leading-tight">{child.last_name}</p>

              {/* Group */}
              {child.groupName && (
                <span
                  className="mt-1.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: (child.groupColor ?? '#3B6CE8') + '20', color: child.groupColor ?? '#3B6CE8' }}
                >
                  {child.groupName}
                </span>
              )}

              {/* Status + time */}
              <div className="mt-2">
                <span className={`text-[10px] font-semibold ${
                  child.status === 'present' ? 'text-green-700'
                  : child.status === 'unknown' ? 'text-gray-400'
                  : 'text-red-600'
                }`}>
                  {cfg.label}
                </span>
                {checkInTime && !checkOutTime && (
                  <p className="text-[9px] text-gray-400 mt-0.5">seit {checkInTime}</p>
                )}
                {checkOutTime && (
                  <p className="text-[9px] text-gray-400 mt-0.5">ab {checkOutTime}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
        <span>Zuletzt aktualisiert: {format(lastRefresh, 'HH:mm:ss')}</span>
        <span>{format(new Date(), 'EEEE, d. MMMM yyyy', { locale: de })}</span>
      </div>
    </div>
  )
}
