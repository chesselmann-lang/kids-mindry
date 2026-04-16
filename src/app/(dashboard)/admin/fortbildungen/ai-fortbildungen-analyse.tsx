'use client'

import { useState } from 'react'
import { GraduationCap, Loader2, RefreshCw, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'

interface Hinweis {
  typ: 'positiv' | 'empfehlung' | 'achtung'
  text: string
}

interface Result {
  zusammenfassung: string
  hinweise: Hinweis[]
  stats: { total: number; recent: number; staffWithout: number; avgHours: number }
  message?: string
}

const TYP_CONFIG = {
  positiv:    { dot: 'bg-green-400',  bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700' },
  empfehlung: { dot: 'bg-indigo-400', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700' },
  achtung:    { dot: 'bg-amber-400',  bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700' },
}

export default function AiFortbildungenAnalyse() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/fortbildungen-analyse', {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Fortbildungsanalyse</p>
          <p className="text-xs text-gray-400 mt-0.5">Personalentwicklung und Abdeckung prüfen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-indigo-500" />
        <span className="text-sm">KI analysiert Fortbildungen…</span>
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
        <GraduationCap size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap size={14} className="text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700">
            KI-Fortbildungsanalyse · {result.stats?.total ?? 0} Einträge
          </span>
          {result.stats?.avgHours > 0 && (
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
              Ø {result.stats.avgHours}h/Person
            </span>
          )}
          {(result.stats?.staffWithout ?? 0) > 0 && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
              {result.stats.staffWithout} ohne Einträge
            </span>
          )}
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
          <RefreshCw size={13} className="text-indigo-500" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        {result.zusammenfassung && (
          <p className="text-sm text-gray-700 leading-relaxed">{result.zusammenfassung}</p>
        )}
        {result.hinweise?.map((h, i) => {
          const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.empfehlung
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
