'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'

interface Hinweis {
  typ: 'info' | 'positiv' | 'achtung'
  text: string
}

const TYP_CONFIG = {
  positiv: { dot: 'bg-green-400', bg: 'bg-green-50', text: 'text-green-700' },
  info:    { dot: 'bg-blue-400',  bg: 'bg-blue-50',  text: 'text-blue-700' },
  achtung: { dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
}

export default function AiKinderTagesuebersicht() {
  const [data, setData] = useState<{ zusammenfassung: string; hinweise: Hinweis[]; stats: any } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/kinder-tagesuebersicht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const result = await res.json()
      if (!res.ok) throw new Error('failed')
      setData(result)
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-brand-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Tagesübersicht</p>
          <p className="text-xs text-gray-400 mt-0.5">Anwesenheit und Gruppeninfos analysieren</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-brand-500" />
        <span className="text-sm">KI erstellt Tagesübersicht…</span>
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

  if (!data) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-sky-50 border-b border-brand-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand-500" />
          <span className="text-xs font-semibold text-brand-700">
            KI-Tagesübersicht · {data.stats?.present ?? 0}/{data.stats?.total ?? 0} anwesend
          </span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-brand-100 transition-colors">
          <RefreshCw size={13} className="text-brand-500" />
        </button>
      </div>
      <div className="p-4 space-y-2.5">
        {data.zusammenfassung && (
          <p className="text-sm text-gray-700 leading-relaxed">{data.zusammenfassung}</p>
        )}
        {data.hinweise?.map((h: Hinweis, i: number) => {
          const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
          return (
            <div key={i} className={`rounded-xl p-2.5 border border-transparent ${cfg.bg} flex items-start gap-2`}>
              <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1 flex-shrink-0`} />
              <p className={`text-xs ${cfg.text} leading-relaxed`}>{h.text}</p>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Tägliche Momentaufnahme</p>
      </div>
    </div>
  )
}
