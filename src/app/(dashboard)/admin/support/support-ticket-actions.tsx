'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2, CheckCircle2, ChevronDown, Lock } from 'lucide-react'

const statusOptions = [
  { value: 'open', label: 'Offen' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'waiting', label: 'Wartet auf Nutzer' },
  { value: 'resolved', label: 'Als gelöst markieren' },
  { value: 'closed', label: 'Schließen' },
]

interface Props {
  ticketId: string
  currentStatus: string
  siteId: string
  staffId: string
}

export default function SupportTicketActions({ ticketId, currentStatus, siteId, staffId }: Props) {
  const router = useRouter()
  const [reply, setReply] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [newStatus, setNewStatus] = useState(currentStatus)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!reply.trim() && newStatus === currentStatus) return
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/support/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          message: reply.trim(),
          isInternal,
          isStaffReply: true,
          newStatus: newStatus !== currentStatus ? newStatus : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Fehler beim Senden')
      }

      setSent(true)
      setReply('')
      setTimeout(() => {
        setSent(false)
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="card p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Antworten</h3>

      <textarea
        value={reply}
        onChange={e => setReply(e.target.value)}
        rows={4}
        placeholder="Antwort an den Nutzer…"
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="internal"
          checked={isInternal}
          onChange={e => setIsInternal(e.target.checked)}
          className="rounded border-gray-300 text-brand-600 focus:ring-brand-400"
        />
        <label htmlFor="internal" className="text-xs text-gray-500 flex items-center gap-1">
          <Lock size={11} />
          Interne Notiz (nicht für Nutzer sichtbar)
        </label>
      </div>

      {/* Status change */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Status ändern</label>
        <div className="relative">
          <select
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400 pr-8"
          >
            {statusOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={sending || sent || (!reply.trim() && newStatus === currentStatus)}
        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-brand-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
      >
        {sending ? (
          <><Loader2 size={15} className="animate-spin" /> Wird gesendet…</>
        ) : sent ? (
          <><CheckCircle2 size={15} /> Gespeichert!</>
        ) : (
          <><Send size={15} /> Antwort senden</>
        )}
      </button>
    </div>
  )
}
