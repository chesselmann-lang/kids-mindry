'use client'

import { useState } from 'react'
import { BarChart2, Clock, Bell, Shield, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface DaySummary {
  kind: string
  lernminuten: number
  bereiche: string[]
  alerts: string[]
}

// Statische Demo-Daten — werden in Produktion aus DB geladen
const DEMO_SUMMARY: DaySummary[] = [
  {
    kind: 'Emma',
    lernminuten: 35,
    bereiche: ['Mathe', 'Deutsch'],
    alerts: [],
  },
  {
    kind: 'Leon',
    lernminuten: 58,
    bereiche: ['Englisch', 'Sachkunde'],
    alerts: ['Bildschirmlimit fast erreicht (58/60 Min)'],
  },
]

export default function ElternPanel() {
  const [screenLimit, setScreenLimit] = useState(60)
  const [saving, setSaving] = useState(false)

  async function saveLimit() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
  }

  return (
    <div className="p-4 space-y-5">
      {/* Tages-Summary */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={14} className="text-brand-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Tages-Summary</span>
        </div>
        <div className="space-y-2">
          {DEMO_SUMMARY.map(s => (
            <div key={s.kind} className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{s.kind}</span>
                <span className="text-xs font-bold text-brand-600">{s.lernminuten} Min</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {s.bereiche.map(b => (
                  <span key={b} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">{b}</span>
                ))}
              </div>
              {s.alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800">
                  <AlertTriangle size={12} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">{a}</p>
                </div>
              ))}
              {s.alerts.length === 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={11} className="text-green-500" />
                  <span className="text-[10px] text-green-600 dark:text-green-400">Kein Alert heute</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bildschirm-Limit */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-amber-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Bildschirm-Limit</span>
        </div>
        <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={screenLimit}
              onChange={e => setScreenLimit(Number(e.target.value))}
              className="flex-1 accent-brand-600"
            />
            <span className="text-sm font-bold w-16 text-right" style={{ color: 'var(--color-text-primary)' }}>{screenLimit} Min</span>
          </div>
          <button
            onClick={saveLimit}
            disabled={saving}
            className="w-full py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Gespeichert ✓' : 'Limit speichern'}
          </button>
        </div>
      </div>

      {/* Alerts konfigurieren */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bell size={14} className="text-red-500" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Alerts</span>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Limit erreicht', enabled: true },
            { label: 'Ungewöhnliche Aktivität', enabled: false },
            { label: 'Kein Lernen seit 2 Tagen', enabled: true },
          ].map(a => (
            <div key={a.label} className="flex items-center justify-between p-2.5 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{a.label}</span>
              <div className={`w-8 h-4 rounded-full transition-colors ${a.enabled ? 'bg-brand-600' : 'bg-gray-300 dark:bg-slate-600'}`}>
                <div className={`w-3 h-3 rounded-full bg-white m-0.5 transition-transform ${a.enabled ? 'translate-x-4' : ''}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link href="/eltern" className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
        Vollständiges Eltern-Dashboard <ChevronRight size={10} />
      </Link>
    </div>
  )
}
