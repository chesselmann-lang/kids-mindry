'use client'

import { useState } from 'react'
import { Baby, Loader2, RefreshCw, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react'

interface Hinweis {
  typ: 'gut' | 'aufmerksamkeit' | 'empfehlung'
  text: string
}

interface Result {
  zusammenfassung: string
  hinweise: Hinweis[]
  stats: { active: number; completed: number; total: number }
  message?: string
}

const TYP_CONFIG = {
  gut:            { dot: 'bg-green-400', bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700' },
  aufmerksamkeit: { dot: 'bg-amber-400', bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700' },
  empfehlung:     { dot: 'bg-pink-400',  bg: 'bg-pink-50',   border: 'border-pink-100',   text: 'text-pink-700' },
}

export default function AiEingewoehnungUeberblick() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/eingewoehnung-ueberblick', {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center flex-shrink-0">
          <Baby size={18} className="text-pink-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Eingewöhnungs-Überblick</p>
          <p className="text-xs text-gray-400 mt-0.5">Aktive Prozesse und Unterstützungsbedarf</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-pink-500" />
        <span className="text-sm">KI analysiert Eingewöhnungen…</span>
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
        <Baby size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Baby size={14} className="text-pink-500" />
          <span className="text-xs font-semibold text-pink-700">KI-Eingewöhnungs-Überblick</span>
          {result.stats && (
            <div className="flex items-center gap-1.5 ml-1">
              {result.stats.active > 0 && (
                <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-medium">
                  {result.stats.active} aktiv
                </span>
              )}
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                {result.stats.completed} abgeschlossen
              </span>
            </div>
          )}
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-pink-100 transition-colors">
          <RefreshCw size={13} className="text-pink-500" />
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
