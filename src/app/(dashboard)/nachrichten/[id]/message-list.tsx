'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { de } from 'date-fns/locale'
import { ArrowDown, CheckCheck } from 'lucide-react'
import type { Message } from '@/types/database'

interface Props {
  initialMessages: Message[]
  conversationId: string
  currentUserId: string
  senderProfiles: Record<string, string>
  otherUserIds?: string[]
}

function formatMsgTime(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d)) return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Gestern ' + format(d, 'HH:mm')
  return format(d, 'dd.MM. HH:mm', { locale: de })
}

function dateSeparator(dateStr: string) {
  const d = new Date(dateStr)
  if (isToday(d)) return 'Heute'
  if (isYesterday(d)) return 'Gestern'
  return format(d, 'EEEE, d. MMMM', { locale: de })
}

export default function MessageList({ initialMessages, conversationId, currentUserId, senderProfiles, otherUserIds = [] }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [profiles, setProfiles] = useState<Record<string, string>>(senderProfiles)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [unreadSinceScroll, setUnreadSinceScroll] = useState(0)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)
  const supabase = createClient()

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distFromBottom < 80
    isAtBottomRef.current = atBottom
    setShowScrollBtn(!atBottom)
    if (atBottom) setUnreadSinceScroll(0)
  }, [])

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowScrollBtn(false)
    setUnreadSinceScroll(0)
  }, [])

  // Auto-scroll only if already at bottom
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    } else {
      // Count new messages since user scrolled up
      setUnreadSinceScroll(prev => prev + 1)
    }
  }, [messages])

  // Realtime-Subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message
          // Sender-Profil nachladen wenn noch nicht bekannt
          if (!profiles[newMsg.sender_id]) {
            const { data: profile } = await (supabase as any)
              .from('profiles')
              .select('id, full_name')
              .eq('id', newMsg.sender_id)
              .single()
            if (profile) {
              setProfiles(prev => ({ ...prev, [profile.id]: profile.full_name ?? 'Unbekannt' }))
            }
          }
          setMessages(prev => [...prev, newMsg])

          // Als gelesen markieren
          await (supabase as any)
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', currentUserId)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, currentUserId])

  // ─── Typing indicator: subscribe to presence channel ─────────────────────
  useEffect(() => {
    const typingChannel = supabase
      .channel(`typing:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState<{ userId: string; name: string; ts: number }>()
        const now = Date.now()
        const names = Object.values(state)
          .flat()
          .filter(p => p.userId !== currentUserId && now - p.ts < 5000)
          .map(p => p.name || 'Jemand')
        setTypingUsers(names)
      })
      .subscribe()

    return () => { supabase.removeChannel(typingChannel) }
  }, [conversationId, currentUserId])

  // ─── Read receipts: watch other participants' last_read_at ────────────────
  useEffect(() => {
    if (otherUserIds.length === 0) return

    // Initial load
    const loadOtherRead = async () => {
      const { data } = await (supabase as any)
        .from('conversation_participants')
        .select('last_read_at')
        .eq('conversation_id', conversationId)
        .in('user_id', otherUserIds)
        .order('last_read_at', { ascending: false })
        .limit(1)
        .single()
      if (data?.last_read_at) setOtherLastReadAt(data.last_read_at)
    }
    loadOtherRead()

    // Realtime updates on conversation_participants
    const readChannel = supabase
      .channel(`read-receipts:${conversationId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversation_participants',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const row = payload.new as { user_id: string; last_read_at: string }
        if (otherUserIds.includes(row.user_id) && row.last_read_at) {
          setOtherLastReadAt(prev => (!prev || row.last_read_at > prev) ? row.last_read_at : prev)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(readChannel) }
  }, [conversationId, otherUserIds.join(',')])

  // Datum-Trennlinien einbauen
  const items: ({ type: 'separator'; label: string; key: string } | { type: 'message'; msg: Message })[] = []
  let lastDate = ''
  for (const msg of messages) {
    const d = new Date(msg.created_at)
    const dayKey = format(d, 'yyyy-MM-dd')
    if (dayKey !== lastDate) {
      items.push({ type: 'separator', label: dateSeparator(msg.created_at), key: dayKey })
      lastDate = dayKey
    }
    items.push({ type: 'message', msg })
  }

  return (
    <div className="relative flex-1 overflow-hidden">
    {/* Scroll-to-bottom floating button */}
    {showScrollBtn && (
      <button
        onClick={scrollToBottom}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-brand-700 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <ArrowDown size={13} />
        {unreadSinceScroll > 0 ? `${unreadSinceScroll} neue` : 'Nach unten'}
      </button>
    )}
    <div ref={containerRef} onScroll={handleScroll} className="h-full overflow-y-auto py-4 space-y-1">
      {items.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-400">Noch keine Nachrichten. Schreib etwas!</p>
        </div>
      )}

      {items.map((item) => {
        if (item.type === 'separator') {
          return (
            <div key={item.key} className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">{item.label}</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
          )
        }

        const { msg } = item
        const isMe = msg.sender_id === currentUserId
        const senderName = profiles[msg.sender_id] ?? 'Unbekannt'

        return (
          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-1`}>
            <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
              {!isMe && (
                <span className="text-[10px] text-gray-400 px-1">{senderName}</span>
              )}
              {/* Image attachments */}
              {(msg as any).meta?.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                  {((msg as any).meta.attachments as { url: string; name: string }[]).map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                      className="block rounded-2xl overflow-hidden border border-white/20 hover:opacity-90 transition-opacity">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={att.url} alt={att.name} className="max-w-[200px] max-h-48 object-cover rounded-2xl" />
                    </a>
                  ))}
                </div>
              )}
              {/* Text body (skip if only attachment placeholder) */}
              {msg.body && msg.body !== '📷 Bild' && (
              <div className={`
                px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${isMe
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                }
                ${msg.type === 'absence_report' ? 'border-2 border-amber-300' : ''}
              `}>
                {msg.type === 'absence_report' && (
                  <div className="text-xs font-semibold mb-1 opacity-75">🤒 Abwesenheit</div>
                )}
                {msg.type === 'system' ? (
                  <span className="italic opacity-75">{msg.body}</span>
                ) : (
                  msg.body
                )}
              </div>
              )}
              <span className={`text-[10px] px-1 flex items-center gap-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                {formatMsgTime(msg.created_at)}
                {isMe && otherLastReadAt && msg.created_at <= otherLastReadAt && (
                  <CheckCheck size={11} className="text-brand-500 flex-shrink-0" title="Gelesen" />
                )}
              </span>
            </div>
          </div>
        )
      })}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-gray-400">
            {typingUsers.join(', ')} schreibt gerade…
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
    </div>
  )
}
