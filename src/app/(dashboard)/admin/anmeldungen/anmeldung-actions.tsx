'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, StickyNote } from 'lucide-react'

interface Props {
  anmeldungId: string
  currentStatus: string
  currentNote: string
  staffId: string
}

const STATUS_OPTIONS = [
  { value: 'neu',            label: 'Neu',           icon: AlertCircle,  color: 'text-brand-600' },
  { value: 'in_bearbeitung', label: 'In Bearbeitung',icon: Loader2,      color: 'text-amber-600' },
  { value: 'wartend',        label: 'Auf Warteliste', icon: Clock,       color: 'text-purple-600' },
  { value: 'aufgenommen',    label: 'Aufgenommen',   icon: CheckCircle2, color: 'text-green-600' },
  { value: 'abgelehnt',      label: 'Abgelehnt',     icon: XCircle,      color: 'text-red-600' },
]

export default function AnmeldungActions({ anmeldungId, currentStatus, currentNote, staffId }: Props) {
  const [status, setStatus]   = useState(currentStatus)
  const [note, setNote]       = useState(currentNote)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/anmeldungen/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: anmeldungId, status, internal_note: note, processed_by: staffId }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Status setzen</p>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map(opt => {
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all ${
                  status === opt.value
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon size={13} className={status === opt.value ? 'text-brand-600' : 'text-gray-400'} />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5 flex items-center gap-1">
          <StickyNote size={10} /> Interne Notiz
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          placeholder="Interne Notiz (für Eltern nicht sichtbar)…"
          className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : null}
        {saved ? '✓ Gespeichert' : 'Speichern'}
      </button>
    </div>
  )
}
