'use client'

import { useState, useRef, useCallback } from 'react'
import { Send, AlertCircle, ChevronDown, ChevronUp, ImagePlus, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const QUICK_REPLIES_STAFF = [
  'Kind ist gut angekommen ✓',
  'Vielen Dank für die Info!',
  'Bitte kurz melden.',
  'Wir kümmern uns darum.',
  'Alles klar, bis morgen!',
  'Guten Morgen! 👋',
]

const QUICK_REPLIES_PARENT = [
  'Vielen Dank! 🙏',
  'Guten Morgen! 👋',
  'Wir kommen heute etwas später.',
  'Alles klar, bis morgen!',
  'Danke für die schnelle Antwort!',
  'Verstanden, danke!',
]

interface Props {
  conversationId: string
  currentUserId: string
  isStaff?: boolean
  senderName?: string
}

export default function MessageInput({ conversationId, currentUserId, isStaff = false, senderName = '' }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showAbsence, setShowAbsence] = useState(false)
  const [absenceType, setAbsenceType] = useState<'sick' | 'vacation' | 'other'>('sick')
  const [absenceNote, setAbsenceNote] = useState('')
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [attachments, setAttachments] = useState<{ url: string; name: string; preview: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const supabase = createClient()
  const quickReplies = isStaff ? QUICK_REPLIES_STAFF : QUICK_REPLIES_PARENT

  // Broadcast typing presence
  const broadcastTyping = useCallback(() => {
    if (!typingChannelRef.current) {
      typingChannelRef.current = supabase
        .channel(`typing:${conversationId}`, { config: { presence: { key: currentUserId } } })
        .subscribe()
    }
    typingChannelRef.current.track({ userId: currentUserId, name: senderName, ts: Date.now() })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      typingChannelRef.current?.untrack()
    }, 3000)
  }, [conversationId, currentUserId, senderName])

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    const path = `messages/${conversationId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const { data, error } = await supabase.storage.from('portfolio').upload(path, file, { contentType: file.type })
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(data.path)
      const preview = URL.createObjectURL(file)
      setAttachments(prev => [...prev, { url: publicUrl, name: file.name, preview }])
    }
    setUploading(false)
  }

  async function sendMessage(body: string, type: 'text' | 'absence_report' = 'text', meta: Record<string, unknown> = {}) {
    if (!body.trim() && attachments.length === 0) return
    setSending(true)
    const fullMeta: Record<string, unknown> = { ...meta }
    if (attachments.length > 0) {
      fullMeta.attachments = attachments.map(a => ({ url: a.url, name: a.name, type: 'image' }))
    }
    const msgBody = body || (attachments.length > 0 ? '📷 Bild' : '')
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: msgBody,
      type,
      meta: fullMeta,
    })
    setSending(false)

    // Trigger push notifications (fire-and-forget, best effort)
    fetch(`/api/conversations/${conversationId}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageBody: msgBody, senderName }),
    }).catch(() => {/* non-fatal */})
  }

  async function handleSend() {
    if (!text.trim() && attachments.length === 0) return
    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingChannelRef.current?.untrack()
    await sendMessage(text.trim())
    setText('')
    setAttachments([])
  }

  async function handleAbsence() {
    const labels = { sick: 'krank', vacation: 'im Urlaub', other: 'abwesend' }
    const body = `Mein Kind ist heute ${labels[absenceType]}.${absenceNote ? ' ' + absenceNote : ''}`
    await sendMessage(body, 'absence_report', { absenceType, note: absenceNote })
    setShowAbsence(false)
    setAbsenceNote('')
  }

  function applyQuickReply(reply: string) {
    setText(reply)
    setShowQuickReplies(false)
    // Focus textarea after selection
    const ta = document.querySelector<HTMLTextAreaElement>('textarea[data-msg-input]')
    if (ta) { ta.focus(); ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 128) + 'px' }
  }

  if (showAbsence) {
    return (
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-500" />
          <span className="font-semibold text-sm text-gray-900">Abwesenheit melden</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['sick', 'vacation', 'other'] as const).map(t => (
            <button
              key={t}
              onClick={() => setAbsenceType(t)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                absenceType === t
                  ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'sick' ? '🤒 Krank' : t === 'vacation' ? '✈️ Urlaub' : '📝 Sonstiges'}
            </button>
          ))}
        </div>
        <textarea
          className="input w-full resize-none text-sm"
          rows={2}
          placeholder="Zusätzliche Notiz (optional)"
          value={absenceNote}
          onChange={e => setAbsenceNote(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={() => setShowAbsence(false)} className="btn-secondary flex-1">
            Abbrechen
          </button>
          <button onClick={handleAbsence} disabled={sending} className="btn-primary flex-1 disabled:opacity-50">
            {sending ? 'Sende…' : 'Abwesenheit melden'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100 pt-3 space-y-2">
      {/* Schnellantworten */}
      <div className="flex items-center justify-between">
        {!isStaff && (
          <button
            onClick={() => setShowAbsence(true)}
            className="text-xs text-amber-600 font-medium flex items-center gap-1.5 hover:text-amber-700 transition-colors"
          >
            <AlertCircle size={13} />
            Abwesenheit melden
          </button>
        )}
        {isStaff && <span />}
        <button
          onClick={() => setShowQuickReplies(v => !v)}
          className="text-xs text-gray-400 font-medium flex items-center gap-1 hover:text-gray-600 transition-colors ml-auto"
        >
          Schnellantworten
          {showQuickReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {showQuickReplies && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
          {quickReplies.map(reply => (
            <button
              key={reply}
              onClick={() => applyQuickReply(reply)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Abwesenheit für Staff (klein) */}
      {isStaff && (
        <button
          onClick={() => setShowAbsence(true)}
          className="text-xs text-amber-600 font-medium flex items-center gap-1.5 hover:text-amber-700 transition-colors"
        >
          <AlertCircle size={13} />
          Abwesenheit melden
        </button>
      )}

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {attachments.map((a, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.preview} alt={a.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center"
              >
                <X size={9} className="text-white" />
              </button>
            </div>
          ))}
          {uploading && (
            <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
              <Loader2 size={18} className="text-brand-400 animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Texteingabe */}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            Array.from(e.target.files ?? []).forEach(uploadFile)
            e.target.value = ''
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-xl text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors flex-shrink-0 disabled:opacity-40"
          title="Bild anhängen"
        >
          <ImagePlus size={20} />
        </button>
        <textarea
          data-msg-input
          className="input flex-1 resize-none text-sm min-h-[42px] max-h-32"
          rows={1}
          placeholder="Nachricht schreiben…"
          value={text}
          onChange={e => { setText(e.target.value); if (e.target.value.trim()) broadcastTyping() }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          style={{ height: 'auto' }}
          onInput={e => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 128) + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || sending || uploading}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-40 flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
