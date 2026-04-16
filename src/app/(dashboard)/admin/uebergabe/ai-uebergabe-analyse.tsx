'use client'

import { useState } from 'react'
import { ArrowLeftRight, Loader2, RefreshCw, AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface Hinweis {
  typ: 'dringend' | 'hinweis' | 'info'
  text: string
}

interface Result {
  hinweise: Hinweis[]
  stats: { total: number; today: number; groups: number; urgent: number }
  message?: string
}

const TYP_CONFIG = {
  dringend: { dot: 'bg-red-400',    bg: 'bg-red-50',    border: 'border-red-100',    text: 'text-red-700' },
  hinweis:  { dot: 'bg-amber-400',  bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700' },
  info:     { dot: 'bg-blue-400',   bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700' },
}

export default function AiUebergabeAnalyse() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/uebergabe-analyse', {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
          <ArrowLeftRight size={18} className="text-amber-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Übergabe-Analyse</p>
          <p className="text-xs text-gray-400 mt-0.5">Muster & dringende Themen erkennen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-amber-500" />
        <span className="text-sm">KI analysiert Übergaben…</span>
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
        <ArrowLeftRight size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight size={14} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-700">KI-Übergabe-Analyse</span>
          {(result.stats?.today ?? 0) > 0 && (
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
              {result.stats.today} heute
            </span>
          )}
          {(result.stats?.urgent ?? 0) > 0 && (
            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
              {result.stats.urgent} dringend
            </span>
          )}
        </div>
        <button onClick={analyse} aria-label="Neu generieren" className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors">
          <RefreshCw size={13} className="text-amber-500" />
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
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Nur für interne Nutzung</p>
      </div>
    </div>
  )
}
