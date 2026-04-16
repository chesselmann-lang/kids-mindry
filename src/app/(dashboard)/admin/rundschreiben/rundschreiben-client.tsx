'use client'

import { useState } from 'react'
import {
  Bell, Users, Megaphone, Loader2, CheckCircle2, ChevronDown,
  Send, Clock, AlertTriangle, MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Group { id: string; name: string; color: string }

interface Props {
  siteId: string
  staffId: string
  groups: Group[]
  parentCount: number
  pushCount: number
  recent: Array<{
    id: string
    title: string
    body: string | null
    created_at: string | null
    data: any
  }>
}

type TargetAudience = 'all' | 'parents' | string  // string = group id

export default function RundschreibenClient({
  siteId, staffId, groups, parentCount, pushCount, recent
}: Props) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [target, setTarget] = useState<TargetAudience>('parents')
  const [channel, setChannel] = useState<'push' | 'message' | 'both'>('push')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<{ recipients: number; pushSent: number; messageSent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const maxBody = 200
  const maxTitle = 80

  const targetLabel = target === 'all'
    ? 'Alle Nutzer'
    : target === 'parents'
    ? `Alle Eltern (${parentCount})`
    : `Gruppe: ${groups.find(g => g.id === target)?.name ?? '?'}`

  async function send() {
    if (!title.trim()) { setError('Bitte einen Titel eingeben.'); return }
    if (body.trim().length < 5) { setError('Bitte eine Nachricht eingeben (min. 5 Zeichen).'); return }
    setSending(true)
    setError(null)

    try {
      // Build recipient targeting
      const payload: any = {
        siteId,
        title: title.trim(),
        body: body.trim(),
        channel,
        target,
        url: '/feed',
        sourceType: 'broadcast',
        sourceId: staffId,
      }

      const res = await fetch('/api/admin/rundschreiben', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        setSent({
          recipients: data.recipients ?? 0,
          pushSent: data.pushSent ?? 0,
          messageSent: data.messageSent ?? 0,
        })
        setTitle('')
        setBody('')
      } else {
        setError(data.error ?? 'Fehler beim Senden')
      }
    } catch {
      setError('Verbindungsfehler – bitte erneut versuchen')
    }
    setSending(false)
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600">{parentCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Eltern registriert</p>
        </div>
        <div className="card p-4 text-center">
          <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Bell size={18} className="text-brand-600" />
          </div>
          <p className="text-2xl font-black text-brand-600">{pushCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">Push-Abonnenten</p>
        </div>
      </div>

      {/* Compose */}
      <div className="card p-5 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Megaphone size={18} className="text-brand-600" />
          Neue Mitteilung
        </h2>

        {/* Title */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Betreff / Titel <span className="text-gray-400 font-normal">({title.length}/{maxTitle})</span>
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value.slice(0, maxTitle))}
            placeholder="z. B. Wichtige Info: Änderung der Öffnungszeiten"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Body */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Nachricht <span className="text-gray-400 font-normal">({body.length}/{maxBody})</span>
          </label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value.slice(0, maxBody))}
            placeholder="Ihre Mitteilung an die Eltern…"
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Target */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Empfänger</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'parents', label: 'Alle Eltern' },
              { value: 'all', label: 'Alle Nutzer' },
              ...groups.map(g => ({ value: g.id, label: `Gruppe: ${g.name}` })),
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTarget(opt.value as TargetAudience)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                  target === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channel */}
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Kanal</label>
          <div className="flex gap-2">
            {[
              { value: 'push', label: '🔔 Push', desc: 'Nur Push-Benachrichtigung' },
              { value: 'message', label: '💬 Nachricht', desc: 'Nur App-Nachricht' },
              { value: 'both', label: '🚀 Beides', desc: 'Push + App-Nachricht' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setChannel(opt.value as typeof channel)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  channel === opt.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div>{opt.label}</div>
                <div className="text-[9px] font-normal text-gray-400 mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-3">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Success */}
        {sent && (
          <div className="bg-green-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700 font-semibold">
              <CheckCircle2 size={14} />
              Mitteilung erfolgreich versendet
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-green-600">{sent.recipients}</p>
                <p className="text-[10px] text-gray-500">Empfänger</p>
              </div>
              {(channel === 'push' || channel === 'both') && (
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-brand-600">{sent.pushSent}</p>
                  <p className="text-[10px] text-gray-500">Push gesendet</p>
                </div>
              )}
              {(channel === 'message' || channel === 'both') && (
                <div className="bg-white rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-purple-600">{sent.messageSent}</p>
                  <p className="text-[10px] text-gray-500">Nachrichten</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview box */}
        {(title || body) && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Vorschau</p>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{title || '(Kein Titel)'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{body || '(Kein Text)'}</p>
                  <p className="text-[10px] text-gray-300 mt-1">KitaHub · jetzt</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              An: {targetLabel} · Kanal: {channel}
            </p>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={send}
          disabled={sending || !title.trim() || body.trim().length < 5}
          className="w-full py-3.5 rounded-2xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {sending ? 'Wird gesendet…' : `An ${targetLabel} senden`}
        </button>
      </div>

      {/* Recent broadcasts */}
      {recent.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Letzte Rundschreiben</p>
          {recent.map(r => (
            <div key={r.id} className="card p-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Megaphone size={14} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                  {r.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{r.body}</p>}
                  {r.created_at && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {format(new Date(r.created_at), "d. MMM yyyy 'um' HH:mm 'Uhr'", { locale: de })}
                      {r.data?.recipients && ` · ${r.data.recipients} Empfänger`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
