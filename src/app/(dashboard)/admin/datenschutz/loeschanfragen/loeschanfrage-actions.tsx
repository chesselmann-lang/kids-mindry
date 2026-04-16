'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  requestId: string
  userName: string
}

export default function LoeschanfrageActions({ requestId, userName }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function approve() {
    if (!window.confirm(
      `ACHTUNG: Die Daten von "${userName}" werden unwiderruflich anonymisiert.\n\n` +
      `Der Supabase Auth-Account muss anschließend manuell im Dashboard gelöscht werden.\n\n` +
      `Fortfahren?`
    )) return

    setLoading('approve')
    setError(null)
    const res = await fetch('/api/dsgvo-delete-request', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Fehler beim Verarbeiten')
    } else {
      setDone('approved')
      router.refresh()
    }
    setLoading(null)
  }

  async function reject() {
    setLoading('reject')
    setError(null)
    const res = await fetch('/api/dsgvo-delete-request/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, reason: rejectionReason.trim() }),
    })
    if (res.ok) {
      setDone('rejected')
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Fehler')
    }
    setLoading(null)
    setShowRejectForm(false)
  }

  if (done === 'approved') {
    return (
      <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
        <CheckCircle2 size={16} />
        Daten anonymisiert — Auth-Account bitte im Supabase-Dashboard löschen
      </div>
    )
  }
  if (done === 'rejected') {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <XCircle size={16} />
        Abgelehnt
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-xs">
          <AlertTriangle size={12} /> {error}
        </div>
      )}

      {showRejectForm ? (
        <div className="space-y-2">
          <textarea
            className="input w-full text-sm resize-none"
            rows={2}
            placeholder="Begründung für Ablehnung (optional)…"
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowRejectForm(false)}
              className="btn-secondary flex-1 text-xs py-2"
            >
              Abbrechen
            </button>
            <button
              onClick={reject}
              disabled={loading === 'reject'}
              className="flex-1 text-xs py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading === 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Ablehnen bestätigen
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setShowRejectForm(true)}
            className="flex-1 text-xs py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors flex items-center justify-center gap-1.5"
          >
            <XCircle size={12} />
            Ablehnen
          </button>
          <button
            onClick={approve}
            disabled={loading === 'approve'}
            className="flex-1 text-xs py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading === 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Löschen bestätigen
          </button>
        </div>
      )}
    </div>
  )
}
