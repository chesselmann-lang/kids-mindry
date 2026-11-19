'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

export type AttendanceStatus =
  | 'present'
  | 'absent_sick'
  | 'absent_vacation'
  | 'absent_other'
  | 'unknown'

export interface AttendanceUpdate {
  child_id: string
  status: AttendanceStatus
  check_in_at: string | null
  check_out_at: string | null
}

export interface UseAnwesenheitRealtimeOptions {
  date?: string // yyyy-MM-dd; defaults to today
  siteId?: string
  onUpdate?: (update: AttendanceUpdate) => void
}

export interface UseAnwesenheitRealtimeResult {
  connected: boolean
  lastUpdate: Date | null
  updates: AttendanceUpdate[]
  reconnect: () => void
}

/**
 * Subscribe to live attendance changes via Supabase Realtime.
 * Returns connection status and individual attendance updates.
 * The caller is responsible for merging updates into their own state.
 */
export function useAnwesenheitRealtime({
  date,
  siteId,
  onUpdate,
}: UseAnwesenheitRealtimeOptions = {}): UseAnwesenheitRealtimeResult {
  const supabase = createClient()
  const today = format(new Date(), 'yyyy-MM-dd')
  const targetDate = date ?? today

  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [updates, setUpdates] = useState<AttendanceUpdate[]>([])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const reconnectCountRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const subscribe = useCallback(() => {
    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const filterExpr = `date=eq.${targetDate}`
    const channel = supabase
      .channel(`anwesenheit-realtime-${targetDate}-${reconnectCountRef.current}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: filterExpr,
        },
        (payload) => {
          const row = payload.new as AttendanceUpdate | null
          if (!row || !row.child_id) return

          const update: AttendanceUpdate = {
            child_id: row.child_id,
            status: row.status ?? 'unknown',
            check_in_at: row.check_in_at ?? null,
            check_out_at: row.check_out_at ?? null,
          }

          setUpdates((prev) => {
            // Replace existing update for same child
            const idx = prev.findIndex((u) => u.child_id === update.child_id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = update
              return next
            }
            return [...prev, update]
          })
          setLastUpdate(new Date())
          onUpdate?.(update)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true)
          reconnectCountRef.current = 0
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnected(false)
          // Exponential backoff reconnect: 2s, 4s, 8s, max 30s
          const delay = Math.min(2000 * 2 ** reconnectCountRef.current, 30_000)
          reconnectCountRef.current += 1
          reconnectTimerRef.current = setTimeout(() => subscribe(), delay)
        }
      })

    channelRef.current = channel
  }, [targetDate]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    subscribe()
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [subscribe]) // eslint-disable-line react-hooks/exhaustive-deps

  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0
    subscribe()
  }, [subscribe])

  return { connected, lastUpdate, updates, reconnect }
}
