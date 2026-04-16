'use client'

import { useState } from 'react'
import { TrendingDown, Loader2, RefreshCw, BarChart2, Lightbulb, Search } from 'lucide-react'

interface Hinweis {
  typ: 'muster' | 'empfehlung' | 'hinweis'
  text: string
}

interface Result {
  hinweise: Hinweis[]
  stats: { total: number; sick: number; vacation: number; other: number }
  message?: string
}

const TYP_CONFIG = {
  muster:      { dot: 'bg-purple-400', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700' },
  empfehlung:  { dot: 'bg-green-400',  bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700' },
  hinweis:     { dot: 'bg-blue-400',   bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700' },
}

export default function AiAbwesenheitsMuster() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/abwesenheits-muster', {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
          <BarChart2 size={18} className="text-purple-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Abwesenheitsmuster</p>
          <p className="text-xs text-gray-400 mt-0.5">Trends der letzten 30 Tage erkennen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-purple-500" />
        <span className="text-sm">KI analysiert Abwesenheiten…</span>
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
        <TrendingDown size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 size={14} className="text-purple-500" />
          <span className="text-xs font-semibold text-purple-700">KI-Abwesenheitsmuster · 30 Tage</span>
          {result.stats && (
            <div className="flex items-center gap-1.5 ml-1">
              <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                {result.stats.sick}× krank
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                {result.stats.vacation}× urlaub
              </span>
            </div>
          )}
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors">
          <RefreshCw size={13} className="text-purple-500" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        {result.hinweise?.map((h, i) => {
          const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.hinweis
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
