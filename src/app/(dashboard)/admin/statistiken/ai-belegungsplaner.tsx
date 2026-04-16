'use client'

import { useState } from 'react'
import { LayoutGrid, Loader2, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, Users } from 'lucide-react'

interface GruppeResult {
  name: string
  auslastung: number
  status: 'unterbelegt' | 'optimal' | 'voll' | 'überbelegt'
  empfehlung: string
}

interface BelegungResult {
  gesamtauslastung: number
  status: 'kritisch' | 'niedrig' | 'optimal' | 'ausgelastet' | 'überbelegt'
  gruppen: GruppeResult[]
  freie_plaetze: number
  warteliste_empfehlung: string
  massnahmen: string[]
  prognose: string
  meta: { totalCapacity: number; totalEnrolled: number; totalWaitlist: number; leavingSoon: number; monthLabel: string }
}

const STATUS_CONFIG = {
  optimal:     { color: 'text-green-700',  bg: 'bg-green-50',  bar: 'bg-green-500',  label: 'Optimal' },
  ausgelastet: { color: 'text-amber-700',  bg: 'bg-amber-50',  bar: 'bg-amber-500',  label: 'Ausgelastet' },
  niedrig:     { color: 'text-blue-700',   bg: 'bg-blue-50',   bar: 'bg-blue-500',   label: 'Niedrig' },
  kritisch:    { color: 'text-red-700',    bg: 'bg-red-50',    bar: 'bg-red-500',    label: 'Kritisch' },
  überbelegt:  { color: 'text-red-700',    bg: 'bg-red-50',    bar: 'bg-red-600',    label: 'Überbelegt' },
}

const GRUPPE_STATUS = {
  unterbelegt: { color: 'text-blue-600',  dot: 'bg-blue-400' },
  optimal:     { color: 'text-green-600', dot: 'bg-green-500' },
  voll:        { color: 'text-amber-600', dot: 'bg-amber-500' },
  überbelegt:  { color: 'text-red-600',   dot: 'bg-red-500' },
}

export default function AiBelegungsplaner() {
  const [result, setResult] = useState<BelegungResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/belegungsplaner')
      const data = await res.json()
      if (!res.ok || !data.gruppen) throw new Error('failed')
      setResult(data)
      setOpen(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={load}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <LayoutGrid size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Belegungsplaner</p>
          <p className="text-xs text-white/70 mt-0.5">Kapazitäten & Auslastung analysieren</p>
        </div>
        {loading
          ? <Loader2 size={16} className="animate-spin text-white/70 flex-shrink-0" />
          : <TrendingUp size={16} className="text-white/70 flex-shrink-0" />
        }
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0891b2, #0e7490)' }}>
            <LayoutGrid size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-800">KI-Belegungsplaner</p>
            <p className="text-[10px] text-gray-400">{result?.meta.monthLabel}</p>
          </div>
          <button onClick={load} aria-label="Neu analysieren" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw size={13} className="text-gray-400" />
          </button>
          <button onClick={() => setOpen(false)} className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin text-cyan-600" />
              <span className="text-xs text-gray-500">Analysiere Belegung…</span>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 flex items-center gap-2 py-2">
              <AlertTriangle size={12} />
              Fehler beim Analysieren.
              <button onClick={load} className="underline">Nochmal</button>
            </div>
          )}

          {result && (
            <>
              {/* Gesamt-Score */}
              {(() => {
                const cfg = STATUS_CONFIG[result.status] ?? STATUS_CONFIG.optimal
                return (
                  <div className={`rounded-xl p-4 ${cfg.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className={`text-3xl font-bold ${cfg.color}`}>{result.gesamtauslastung}%</p>
                        <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end mb-1">
                          <Users size={12} className="text-gray-400" />
                          <p className="text-xs text-gray-600">{result.meta.totalEnrolled} / {result.meta.totalCapacity} Plätze</p>
                        </div>
                        <p className="text-[10px] text-gray-500">{result.freie_plaetze} frei · {result.meta.totalWaitlist} Warteliste</p>
                        {result.meta.leavingSoon > 0 && (
                          <p className="text-[10px] text-amber-600">{result.meta.leavingSoon} gehen bald</p>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                      <div className={`h-full ${cfg.bar} transition-all`} style={{ width: `${Math.min(100, result.gesamtauslastung)}%` }} />
                    </div>
                  </div>
                )
              })()}

              {/* Gruppen */}
              <div className="space-y-2">
                {result.gruppen.map((g, i) => {
                  const scfg = GRUPPE_STATUS[g.status] ?? GRUPPE_STATUS.optimal
                  return (
                    <div key={i} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${scfg.dot}`} />
                          <p className="text-[11px] font-semibold text-gray-800">{g.name}</p>
                        </div>
                        <p className={`text-[11px] font-bold ${scfg.color}`}>{g.auslastung}%</p>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full transition-all ${g.auslastung >= 85 ? 'bg-amber-500' : g.auslastung >= 60 ? 'bg-green-500' : 'bg-blue-400'}`}
                          style={{ width: `${Math.min(100, g.auslastung)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-500">{g.empfehlung}</p>
                    </div>
                  )
                })}
              </div>

              {/* Warteliste */}
              <div className="bg-cyan-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-cyan-700 mb-1">Warteliste-Empfehlung</p>
                <p className="text-xs text-gray-700">{result.warteliste_empfehlung}</p>
              </div>

              {/* Maßnahmen */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Empfohlene Maßnahmen</p>
                {result.massnahmen.map((m, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-gray-700">{m}</p>
                  </div>
                ))}
              </div>

              {/* Prognose */}
              <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                <TrendingUp size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600 italic">{result.prognose}</p>
              </div>

              <p className="text-[9px] text-gray-400">KI-Belegungsanalyse · {new Date().toLocaleDateString('de-DE')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
