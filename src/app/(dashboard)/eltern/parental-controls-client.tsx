'use client'

/**
 * ParentalControlsClient
 * Per-child controls: screen time, KJM filter, weekly report email.
 */

import { useState } from 'react'
import { Clock, Shield, Bell, Check, Loader2, ChevronDown } from 'lucide-react'

export interface ChildControl {
  child_id: string
  child_name: string
  controls_id: string | null
  daily_limit_minutes: number
  max_age_rating: string
  weekly_report_enabled: boolean
  weekly_report_email: string
}

const AGE_RATINGS = [
  { value: '0+',  label: '0+',  desc: 'Für alle geeignet' },
  { value: '3+',  label: '3+',  desc: 'Ab 3 Jahren' },
  { value: '6+',  label: '6+',  desc: 'Ab 6 Jahren (KJM Vorschulkind)' },
  { value: '10+', label: '10+', desc: 'Ab 10 Jahren' },
  { value: '12+', label: '12+', desc: 'Ab 12 Jahren (KJM)' },
  { value: '16+', label: '16+', desc: 'Ab 16 Jahren' },
]

const TIME_PRESETS = [
  { label: '30 Min', value: 30 },
  { label: '1 Std', value: 60 },
  { label: '1,5 Std', value: 90 },
  { label: '2 Std', value: 120 },
  { label: 'Kein Limit', value: 0 },
]

function formatMinutes(m: number): string {
  if (m === 0) return 'Kein Limit'
  if (m < 60) return `${m} Min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem === 0 ? `${h} Std` : `${h} Std ${rem} Min`
}

export default function ParentalControlsClient({ children }: { children: ChildControl[] }) {
  const [controls, setControls] = useState<ChildControl[]>(children)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, string>>({})
  const [error, setError] = useState<Record<string, string>>({})

  async function save(childId: string, patch: Partial<ChildControl>) {
    setSaving(s => ({ ...s, [childId]: true }))
    setError(e => ({ ...e, [childId]: '' }))
    try {
      const current = controls.find(c => c.child_id === childId)!
      const res = await fetch('/api/parental-controls/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId, ...current, ...patch }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler beim Speichern')
      setControls(prev => prev.map(c => c.child_id === childId ? { ...c, ...patch } : c))
      setSaved(s => ({ ...s, [childId]: 'Gespeichert' }))
      setTimeout(() => setSaved(s => ({ ...s, [childId]: '' })), 2000)
    } catch (e: any) {
      setError(err => ({ ...err, [childId]: e.message }))
    }
    setSaving(s => ({ ...s, [childId]: false }))
  }

  if (controls.length === 0) {
    return (
      <div className="rounded-2xl border p-10 text-center" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <Shield size={36} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Keine Kinder verknüpft
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {controls.map(c => (
        <div
          key={c.child_id}
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          {/* Child header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
              {c.child_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{c.child_name}</p>
            {saved[c.child_id] && (
              <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                <Check size={12} /> {saved[c.child_id]}
              </span>
            )}
            {saving[c.child_id] && (
              <Loader2 size={14} className="ml-auto text-brand-600 animate-spin" />
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* Screen time */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={15} className="text-orange-500" />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Bildschirmzeit-Limit: <span className="text-orange-600">{formatMinutes(c.daily_limit_minutes)}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TIME_PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => save(c.child_id, { daily_limit_minutes: p.value })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      c.daily_limit_minutes === p.value
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-700'
                        : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                    style={c.daily_limit_minutes !== p.value ? { color: 'var(--color-text-secondary)' } : {}}
                  >
                    {p.label}
                  </button>
                ))}
                {/* Custom input */}
                <label className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800" style={{ color: 'var(--color-text-muted)' }}>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    value={c.daily_limit_minutes}
                    onChange={e => setControls(prev => prev.map(ch => ch.child_id === c.child_id ? { ...ch, daily_limit_minutes: Number(e.target.value) } : ch))}
                    onBlur={e => save(c.child_id, { daily_limit_minutes: Number(e.target.value) })}
                    className="w-14 bg-transparent text-center outline-none"
                  />
                  Min
                </label>
              </div>
            </div>

            {/* KJM filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={15} className="text-blue-500" />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Inhaltsfilter (KJM-Altersfreigabe)
                </span>
              </div>
              <div className="relative">
                <select
                  value={c.max_age_rating}
                  onChange={e => save(c.child_id, { max_age_rating: e.target.value })}
                  className="w-full appearance-none px-4 py-2.5 pr-9 rounded-xl border text-sm font-medium transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {AGE_RATINGS.map(r => (
                    <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-[11px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                Inhalte mit höherer Altersfreigabe werden für dieses Kind ausgeblendet.
                KJM = Kommission für Jugendmedienschutz.
              </p>
            </div>

            {/* Weekly report */}
            <div className="flex items-start gap-4">
              <Bell size={15} className="text-purple-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Wöchentlicher Aktivitätsbericht
                </p>
                <p className="text-xs mt-0.5 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Jeden Montag erhalten Sie eine Zusammenfassung der Lernaktivitäten der letzten Woche.
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => save(c.child_id, { weekly_report_enabled: !c.weekly_report_enabled })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${c.weekly_report_enabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${c.weekly_report_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {c.weekly_report_enabled ? 'Aktiviert' : 'Deaktiviert'}
                  </span>
                  {c.weekly_report_enabled && (
                    <input
                      type="email"
                      placeholder="E-Mail für Bericht"
                      value={c.weekly_report_email}
                      onChange={e => setControls(prev => prev.map(ch => ch.child_id === c.child_id ? { ...ch, weekly_report_email: e.target.value } : ch))}
                      onBlur={e => save(c.child_id, { weekly_report_email: e.target.value })}
                      className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg border text-xs"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error[c.child_id] && (
              <p className="text-xs text-red-600 dark:text-red-400">{error[c.child_id]}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
