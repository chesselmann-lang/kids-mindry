'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function DeletionRequestButton() {
  const [showForm, setShowForm] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/dsgvo-delete-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Fehler beim Senden')
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-xs text-green-800">
        <CheckCircle2 size={14} className="text-green-600" />
        Ihr Löschantrag wurde eingereicht. Sie erhalten eine Bestätigung.
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-3">
        <div className="flex gap-2 p-3 bg-red-50 rounded-xl text-xs text-red-700">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            Nach Bearbeitung werden Ihre Profildaten anonymisiert und alle Zuordnungen zu Kindern aufgehoben.
            Dieser Vorgang ist nicht rückgängig zu machen.
          </span>
        </div>

        <textarea
          className="input w-full text-sm resize-none"
          rows={3}
          placeholder="Begründung (optional)…"
          value={reason}
          onChange={e => setReason(e.target.value)}
        />

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(false); setError(null) }}
            className="btn-secondary flex-1 text-sm py-2"
          >
            Abbrechen
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 text-sm py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Antrag stellen
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="flex items-center gap-2 text-sm text-red-500 font-medium hover:text-red-600 transition-colors"
    >
      <Trash2 size={14} />
      Löschantrag stellen (Art. 17 DSGVO)
    </button>
  )
}
