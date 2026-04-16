'use client'

import { useState } from 'react'
import { TrendingDown, Sparkles, Loader2, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface WochentagPrognose {
  tag: string
  erwartung: number
  hinweis: string
}

interface AbwesenheitsPrognoseResult {
  prognose_gesamt: string
  erwartete_anwesenheit: number
  risiko: 'niedrig' | 'mittel' | 'hoch'
  wochentage: WochentagPrognose[]
  empfehlungen: string[]
  personalplanung: string
  meta: {
    totalChildren: number
    plannedCount: number
    weekdayRates: Record<string, number>
  }
}

const RISIKO_CONFIG = {
  niedrig: { label: 'Niedriges Risiko', color: 'text-green-700', bg: 'bg-green-50', bar: 'bg-green-500' },
  mittel:  { label: 'Mittleres Risiko', color: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-500' },
  hoch:    { label: 'Hohes Risiko',     color: 'text-red-700',   bg: 'bg-red-50',   bar: 'bg-red-500' },
}

const TAG_KURZ: Record<string, string> = {
  Montag: 'Mo', Dienstag: 'Di', Mittwoch: 'Mi', Donnerstag: 'Do', Freitag: 'Fr'
}

export default function AiAbwesenheitsPrognose() {
  const [result, setResult] = useState<AbwesenheitsPrognoseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/abwesenheits-prognose')
      const data = await res.json()
      if (!res.ok || !data.prognose_gesamt) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); load() }}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <TrendingDown size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Abwesenheitsprognose</p>
          <p className="text-xs text-white/70 mt-0.5">Anwesenheit für nächste 2 Wochen vorhersagen</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
              <TrendingDown size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Abwesenheitsprognose</p>
              <p className="text-[10px] text-gray-400">Nächste 2 Wochen · Wochentag-Muster · Empfehlungen</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              Analysiere historische Daten…
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertTriangle size={12} />
                Fehler beim Laden. Bitte nochmal versuchen.
              </div>
              <button onClick={load}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}>
                <RotateCcw size={12} /> Nochmal versuchen
              </button>
            </div>
          )}

          {result && (() => {
            const cfg = RISIKO_CONFIG[result.risiko] ?? RISIKO_CONFIG.mittel
            return (
              <div className="space-y-3">
                {/* Gesamtanwesenheit */}
                <div className={`rounded-xl p-3 ${cfg.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</p>
                    <span className={`text-2xl font-bold ${cfg.color}`}>{result.erwartete_anwesenheit}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${result.erwartete_anwesenheit}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5">{result.prognose_gesamt}</p>
                </div>

                {/* Wochentage */}
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Prognose nach Wochentag</p>
                  <div className="space-y-2">
                    {result.wochentage.map((wt) => (
                      <div key={wt.tag}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-medium text-gray-600 w-6">{TAG_KURZ[wt.tag] ?? wt.tag}</span>
                          <div className="flex-1 mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${wt.erwartung}%`,
                                background: wt.erwartung >= 80 ? '#22c55e' : wt.erwartung >= 65 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-700 w-8 text-right">{wt.erwartung}%</span>
                        </div>
                        {wt.hinweis && (
                          <p className="text-[9px] text-gray-400 ml-8 leading-relaxed">{wt.hinweis}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personalplanung */}
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-purple-700 mb-1">👥 Personalplanung</p>
                  <p className="text-xs text-gray-700">{result.personalplanung}</p>
                </div>

                {/* Empfehlungen */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">Empfehlungen</p>
                  <div className="space-y-1">
                    {result.empfehlungen.map((e, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-purple-500 text-xs">→</span>
                        <p className="text-xs text-gray-700">{e}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[9px] text-gray-400">
                    {result.meta.totalChildren} Kinder · {result.meta.plannedCount} geplante Abwesenheiten
                  </p>
                  <button onClick={load}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                    <RotateCcw size={10} /> Neu
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
