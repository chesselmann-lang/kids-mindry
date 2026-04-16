'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, CheckCircle2, ChevronDown } from 'lucide-react'

const categories = [
  { value: 'question', label: '❓ Allgemeine Frage' },
  { value: 'bug', label: '🐛 Fehler / Problem' },
  { value: 'feature', label: '💡 Funktionswunsch' },
  { value: 'billing', label: '💳 Abrechnung / Gebühren' },
  { value: 'other', label: '📝 Sonstiges' },
]

const priorities = [
  { value: 'low', label: 'Niedrig – keine Eile' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Hoch – dringend' },
]

export default function NewTicketForm() {
  const router = useRouter()
  const [category, setCategory] = useState('question')
  const [priority, setPriority] = useState('normal')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/support/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, priority, subject, message }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Fehler beim Senden')
      }

      setSuccess(true)
      setTimeout(() => router.push('/support'), 2000)
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="card p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Anfrage gesendet!</h2>
        <p className="text-sm text-gray-500">Wir haben Ihre Anfrage erhalten und melden uns so bald wie möglich.</p>
        <p className="text-xs text-gray-400 mt-3">Sie werden weitergeleitet…</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Category */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Art der Anfrage</label>
        <div className="relative">
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 pr-8"
          >
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Priority */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Dringlichkeit</label>
        <div className="flex gap-2">
          {priorities.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold border-2 transition-colors ${
                priority === p.value
                  ? p.value === 'high'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : p.value === 'low'
                    ? 'border-gray-300 bg-gray-50 text-gray-600'
                    : 'border-brand-400 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Betreff <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          maxLength={200}
          placeholder="Kurze Zusammenfassung des Problems…"
          required
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />
      </div>

      {/* Message */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Nachricht <span className="text-red-400">*</span>
        </label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          maxLength={5000}
          placeholder="Beschreiben Sie Ihr Anliegen so genau wie möglich…"
          required
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">{message.length}/5000</p>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !subject.trim() || !message.trim()}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
      >
        {submitting ? (
          <><Loader2 size={15} className="animate-spin" /> Wird gesendet…</>
        ) : (
          <><Send size={15} /> Anfrage senden</>
        )}
      </button>
    </form>
  )
}
