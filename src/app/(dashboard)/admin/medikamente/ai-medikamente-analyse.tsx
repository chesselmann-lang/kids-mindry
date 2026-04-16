'use client'

import { useState } from 'react'
import { Pill, Loader2, RefreshCw, ShieldCheck, AlertTriangle, Info } from 'lucide-react'

interface Hinweis {
  typ: 'sicherheit' | 'compliance' | 'info'
  text: string
}

interface Result {
  hinweise: Hinweis[]
  stats: { total: number; withConsent: number; withoutConsent: number; children: number }
  message?: string
}

const TYP_CONFIG = {
  sicherheit: { dot: 'bg-red-400',    bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700' },
  compliance: { dot: 'bg-amber-400',  bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700' },
  info:       { dot: 'bg-blue-400',   bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700' },
}

export default function AiMedikamenteAnalyse() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/medikamente-analyse', {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
          <Pill size={18} className="text-purple-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Medikamenten-Analyse</p>
          <p className="text-xs text-gray-400 mt-0.5">Sicherheit & Compliance der letzten 30 Tage</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-purple-500" />
        <span className="text-sm">KI analysiert Medikamenten-Protokoll…</span>
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
        <Pill size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill size={14} className="text-purple-500" />
          <span className="text-xs font-semibold text-purple-700">KI-Medikamenten-Analyse · 30 Tage</span>
          {result.stats && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">
                {result.stats.total} Gaben
              </span>
              {result.stats.withoutConsent > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                  {result.stats.withoutConsent} ohne Einw.
                </span>
              )}
            </div>
          )}
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors">
          <RefreshCw size={13} className="text-purple-500" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        {result.hinweise?.map((h, i) => {
          const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
          return (
            <div key={i} className={`rounded-xl p-2.5 border ${cfg.bg} ${cfg.border} flex items-start gap-2`}>
              <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1 flex-shrink-0`} />
              <p className={`text-xs ${cfg.text} leading-relaxed`}>{h.text}</p>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Nur für interne Nutzung · Nicht für medizinische Entscheidungen</p>
      </div>
    </div>
  )
}
