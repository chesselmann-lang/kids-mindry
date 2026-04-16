'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const REASONS = [
  { value: 'absent_sick',     emoji: '🤒', label: 'Krank',    color: 'bg-red-50 ring-red-300 text-red-700' },
  { value: 'absent_vacation', emoji: '🏖️', label: 'Urlaub',   color: 'bg-blue-50 ring-blue-300 text-blue-700' },
  { value: 'absent_other',    emoji: '📋', label: 'Sonstiges', color: 'bg-gray-50 ring-gray-300 text-gray-700' },
]

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  absent_sick:     { label: 'Krank',     color: 'bg-red-100 text-red-700' },
  absent_vacation: { label: 'Urlaub',    color: 'bg-blue-100 text-blue-700' },
  absent_other:    { label: 'Sonstiges', color: 'bg-gray-100 text-gray-600' },
}

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
  reporterId: string
  siteId: string
  recentAbsences: any[]
  childMap: Record<string, { id: string; first_name: string; last_name: string }>
}

function getDatesInRange(from: string, to: string): string[] {
  const dates: string[] = []
  const start = new Date(from + 'T12:00:00')
  const end = new Date(to + 'T12:00:00')
  const cur = new Date(start)
  while (cur <= end) {
    const dow = cur.getDay()
    if (dow !== 0 && dow !== 6) { // skip weekends
      dates.push(cur.toISOString().split('T')[0])
    }
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

export default function AbwesenheitForm({ children, reporterId, siteId, recentAbsences, childMap }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]

  const [childId, setChildId] = useState(children.length === 1 ? children[0].id : '')
  const [reason, setReason] = useState('absent_sick')
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!childId || !reason) return
    setLoading(true)
    setError('')
    const supabase = createClient()

    const dates = getDatesInRange(dateFrom, dateTo)
    if (dates.length === 0) {
      setError('Kein gültiger Zeitraum. Bitte Datum prüfen.')
      setLoading(false)
      return
    }

    // Upsert one attendance row per working day
    const rows = dates.map(date => ({
      child_id: childId,
      site_id: siteId,
      date,
      status: reason,
      absence_reason: reason,
      absence_note: note || null,
      reported_by: reporterId,
    }))

    const { error: dbErr } = await supabase
      .from('attendance')
      .upsert(rows, { onConflict: 'child_id,date' })

    if (dbErr) {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/mein-kind'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Abwesenheit gemeldet!</h2>
          <p className="text-sm text-gray-500 mt-1">Die Erzieher wurden benachrichtigt.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mein-kind" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Abwesenheit melden</h1>
          <p className="text-sm text-gray-400">Bitte frühzeitig vor 8 Uhr melden</p>
        </div>
      </div>

      {/* Kind */}
      {children.length > 1 && (
        <div className="card p-4">
          <label className="label">Kind *</label>
          <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
            <option value="">Kind auswählen…</option>
            {children.map(c => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
            ))}
          </select>
        </div>
      )}

      {children.length === 1 && (
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
            {children[0].first_name[0]}{children[0].last_name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{children[0].first_name} {children[0].last_name}</p>
            <p className="text-xs text-gray-400">Ihr Kind</p>
          </div>
        </div>
      )}

      {/* Grund */}
      <div className="card p-4">
        <label className="label mb-3">Grund der Abwesenheit *</label>
        <div className="grid grid-cols-3 gap-2">
          {REASONS.map(r => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                reason === r.value
                  ? `ring-2 ${r.color} border-transparent`
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zeitraum */}
      <div className="card p-4 space-y-3">
        <label className="label">Zeitraum *</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Von</label>
            <input
              type="date"
              className="input-field"
              value={dateFrom}
              min={today}
              onChange={e => {
                setDateFrom(e.target.value)
                if (e.target.value > dateTo) setDateTo(e.target.value)
              }}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Bis</label>
            <input
              type="date"
              className="input-field"
              value={dateTo}
              min={dateFrom}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>
        {dateFrom !== dateTo && (
          <p className="text-xs text-brand-600 font-medium">
            📅 {getDatesInRange(dateFrom, dateTo).length} Werktag(e) eingetragen
          </p>
        )}
      </div>

      {/* Notiz */}
      <div className="card p-4">
        <label className="label">Notiz (optional)</label>
        <textarea
          className="input-field resize-none"
          rows={2}
          placeholder="z.B. Arzttermin, Fieber seit gestern…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!childId || !reason || loading}
        className="btn-primary w-full py-3 disabled:opacity-50"
      >
        {loading ? 'Wird gemeldet…' : 'Abwesenheit melden'}
      </button>

      {/* Recent absences */}
      {recentAbsences.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Letzte Meldungen</p>
          <div className="card overflow-hidden p-0">
            {recentAbsences.map((a, idx) => {
              const child = childMap[a.child_id]
              const cfg = REASON_LABELS[a.status] ?? { label: a.status, color: 'bg-gray-100 text-gray-500' }
              const d = new Date(a.date + 'T12:00:00')
              return (
                <div key={a.id} className={`flex items-center gap-3 px-4 py-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{child?.first_name} {child?.last_name}</p>
                    <p className="text-xs text-gray-400">{d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
