'use client'

import { useState } from 'react'
import { MessageCircle, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

const TEMPLATES = [
  { label: '📅 Terminerinnerung', text: '📅 KitaHub: Erinnerung – [Titel] findet statt am [Datum]. Weitere Infos in der App.' },
  { label: '🚨 Notfall-Nachricht', text: '🚨 Wichtige Mitteilung der Kita: [Nachricht]. Bitte melden Sie sich umgehend.' },
  { label: '💶 Zahlungserinnerung', text: '💶 KitaHub: Erinnerung – die Zahlung "[Titel]" (€[Betrag]) ist fällig. Jetzt bezahlen in der App.' },
  { label: '✅ Schließung', text: '✅ KitaHub: Die Einrichtung ist am [Datum] geschlossen. Bitte beachten Sie dies bei der Planung.' },
]

export default function WhatsAppAdmin() {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent?: number; failed?: number; error?: string } | null>(null)

  async function handleSend() {
    if (!message.trim()) return
    setSending(true); setResult(null)

    const res = await fetch('/api/whatsapp/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, target: 'all' }),
    })
    const data = await res.json()
    setResult(data)
    setSending(false)
    if (!data.error) setMessage('')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
          <MessageCircle size={20} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">WhatsApp Broadcast</h2>
          <p className="text-xs text-gray-400">An alle Eltern der Einrichtung senden</p>
        </div>
      </div>

      {/* Templates */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Vorlagen</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map(t => (
            <button
              key={t.label}
              onClick={() => setMessage(t.text)}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nachricht</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Nachricht an alle Eltern…"
          className="input mt-1 w-full resize-none"
        />
        <p className="text-xs text-gray-400 text-right mt-1">{message.length}/1000</p>
      </div>

      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
          result.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {result.error
            ? <><AlertCircle size={16} /> {result.error}</>
            : <><CheckCircle2 size={16} /> {result.sent} gesendet, {result.failed} fehlgeschlagen</>
          }
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending || !message.trim()}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {sending ? 'Wird gesendet…' : 'An alle Eltern senden'}
      </button>
    </div>
  )
}
