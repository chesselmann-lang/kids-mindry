'use client'

import { useState } from 'react'
import { ClipboardList, Loader2, RefreshCw, AlertCircle, Clock, Info } from 'lucide-react'

interface Empfehlung {
  prioritaet: 'dringend' | 'bald' | 'info'
  text: string
}

interface Result {
  zusammenfassung: string
  empfehlungen: Empfehlung[]
  stats: { total: number; neu: number; inBearbeitung: number; oldestPending: number }
  message?: string
}

const PRIO_CONFIG = {
  dringend: { dot: 'bg-red-400',    bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700',    label: 'Dringend' },
  bald:     { dot: 'bg-amber-400',  bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  label: 'Bald' },
  info:     { dot: 'bg-blue-400',   bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   label: 'Info' },
}

export default function AiAnmeldungsAnalyse() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/anmeldungs-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error('failed')
      setResult(data)
      setLoaded(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!loaded && !loading) {
    return (
      <button
        onClick={analyse}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
          <ClipboardList size={18} className="text-brand-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Anmeldungs-Überblick</p>
          <p className="text-xs text-gray-400 mt-0.5">Offene Bewerbungen priorisieren</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-brand-500" />
        <span className="text-sm">KI analysiert Anmeldungen…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Fehler. <button onClick={analyse} className="underline">Nochmal</button>
      </div>
    )
  }

  if (!result) return null

  if (result.message) {
    return (
      <div className="card p-4 text-sm text-gray-500 flex items-center gap-2">
        <ClipboardList size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-indigo-50 border-b border-brand-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={14} className="text-brand-500" />
          <span className="text-xs font-semibold text-brand-700">
            KI-Anmeldungs-Überblick · {result.stats?.total ?? 0} gesamt
          </span>
          {(result.stats?.neu ?? 0) > 0 && (
            <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-medium">
              {result.stats.neu} neu
            </span>
          )}
          {(result.stats?.oldestPending ?? 0) > 14 && (
            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
              {result.stats.oldestPending} Tage offen
            </span>
          )}
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-brand-100 transition-colors">
          <RefreshCw size={13} className="text-brand-500" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        {result.zusammenfassung && (
          <p className="text-sm text-gray-700 leading-relaxed">{result.zusammenfassung}</p>
        )}
        {result.empfehlungen?.map((e, i) => {
          const cfg = PRIO_CONFIG[e.prioritaet] ?? PRIO_CONFIG.info
          return (
            <div key={i} className={`rounded-xl p-2.5 border ${cfg.bg} ${cfg.border} flex items-start gap-2`}>
              <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1 flex-shrink-0`} />
              <div className="flex-1">
                <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.text} mr-1.5`}>{cfg.label}</span>
                <span className="text-xs text-gray-700">{e.text}</span>
              </div>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Nur für interne Nutzung</p>
      </div>
    </div>
  )
}
