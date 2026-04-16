'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Pin, CalendarClock, Info, Star } from 'lucide-react'

interface Highlight {
  typ: 'wichtig' | 'termin' | 'info'
  text: string
}

interface Result {
  zusammenfassung: string
  highlights: Highlight[]
  stats: { total: number; pinned: number }
  message?: string
}

const TYP_CONFIG = {
  wichtig: { Icon: Star,         bg: 'bg-yellow-50',  border: 'border-yellow-100',  text: 'text-yellow-700',  dot: 'bg-yellow-400' },
  termin:  { Icon: CalendarClock, bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  info:    { Icon: Info,          bg: 'bg-gray-50',    border: 'border-gray-200',    text: 'text-gray-600',    dot: 'bg-gray-400' },
}

export default function AiPinnwandZusammenfassung() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/pinnwand-zusammenfassung', {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-yellow-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Pinnwand-Überblick</p>
          <p className="text-xs text-gray-400 mt-0.5">Wichtigste Infos & Aktionen erkennen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-yellow-500" />
        <span className="text-sm">KI liest Pinnwand…</span>
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
        <Pin size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pin size={14} className="text-yellow-500" />
          <span className="text-xs font-semibold text-yellow-700">
            KI-Überblick · {result.stats?.total ?? 0} Beiträge
          </span>
          {(result.stats?.pinned ?? 0) > 0 && (
            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium">
              {result.stats.pinned} gepinnt
            </span>
          )}
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-yellow-100 transition-colors">
          <RefreshCw size={13} className="text-yellow-500" />
        </button>
      </div>

      <div className="p-4 space-y-2.5">
        {result.zusammenfassung && (
          <p className="text-sm text-gray-700 leading-relaxed">{result.zusammenfassung}</p>
        )}
        {result.highlights?.map((h, i) => {
          const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
          return (
            <div key={i} className={`rounded-xl p-2.5 border ${cfg.bg} ${cfg.border} flex items-start gap-2`}>
              <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1 flex-shrink-0`} />
              <p className={`text-xs ${cfg.text} leading-relaxed`}>{h.text}</p>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Tagesüberblick</p>
      </div>
    </div>
  )
}
