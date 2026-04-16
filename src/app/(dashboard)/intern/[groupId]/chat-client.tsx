'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import { de } from 'date-fns/locale'
import { Send, Loader2 } from 'lucide-react'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles?: { full_name: string; role: string }
}

interface Props {
  groupId: string
  userId: string
  userName: string
  initialMessages: Message[]
}

function dateLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Heute'
  if (isYesterday(d)) return 'Gestern'
  return format(d, 'EEEE, d. MMMM', { locale: de })
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = [
  'bg-brand-500', 'bg-green-500', 'bg-teal-500', 'bg-purple-500',
  'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-cyan-500',
]
function avatarColor(name: string) {
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFF
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export default function ChatClient({ groupId, userId, userName, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`team_messages_${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_messages',
        filter: `group_id=eq.${groupId}`,
      }, async (payload) => {
        // Fetch full message with profile
        const { data } = await supabase
          .from('team_messages')
          .select('*, profiles:sender_id(full_name, role)')
          .eq('id', payload.new.id)
          .single()
        if (data) {
          setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev
            return [...prev, data as Message]
          })
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  async function sendMessage() {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setText('')
    const supabase = createClient()
    await supabase.from('team_messages').insert({
      group_id: groupId,
      sender_id: userId,
      content,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = []
  messages.forEach(m => {
    const date = m.created_at.split('T')[0]
    const last = groupedMessages[groupedMessages.length - 1]
    if (last?.date === date) {
      last.msgs.push(m)
    } else {
      groupedMessages.push({ date, msgs: [m] })
    }
  })

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">Noch keine Nachrichten</p>
            <p className="text-xs text-gray-300 mt-1">Schreib die erste Nachricht!</p>
          </div>
        )}
        {groupedMessages.map(({ date, msgs }) => (
          <div key={date}>
            <div className="text-center my-3">
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {dateLabel(date)}
              </span>
            </div>
            {msgs.map((msg, i) => {
              const isMe = msg.sender_id === userId
              const name = msg.profiles?.full_name ?? 'Unbekannt'
              const showAvatar = !isMe && (i === 0 || msgs[i - 1]?.sender_id !== msg.sender_id)

              return (
                <div key={msg.id} className={`flex items-end gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${showAvatar ? avatarColor(name) : 'opacity-0'}`}>
                      {getInitials(name)}
                    </div>
                  )}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && showAvatar && (
                      <p className="text-[10px] text-gray-400 ml-1 mb-0.5">{name}</p>
                    )}
                    <div className={`px-3.5 py-2 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-brand-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[9px] text-gray-400 mt-0.5 px-1`}>
                      {format(parseISO(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 flex items-end gap-2 pt-3 border-t border-gray-100 mt-2">
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nachricht schreiben…"
          rows={1}
          className="flex-1 input-field resize-none text-sm py-2.5 max-h-28 overflow-y-auto"
          style={{ height: 'auto' }}
          onInput={e => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${Math.min(el.scrollHeight, 112)}px`
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center disabled:opacity-40 hover:bg-brand-600 transition-colors"
        >
          {sending
            ? <Loader2 size={16} className="text-white animate-spin" />
            : <Send size={16} className="text-white" />}
        </button>
      </div>
    </div>
  )
}
