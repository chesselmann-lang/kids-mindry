'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Sun, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react'

interface AbschlussData {
  highlight: string
  hinweise: string[]
  paedagogik: string
  dayLabel: string
  present: number
  sick: number
  total: number
}

export default function TagesAbschluss() {
  const [data, setData] = useState<AbschlussData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/tages-abschluss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const d = await res.json()
      if (!res.ok || !d.highlight) throw new Error('failed')
      setData(d)
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
        onClick={generate}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
          <Sun size={18} className="text-orange-500" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">Tages-Abschluss</p>
          <p className="text-xs text-gray-400 mt-0.5">KI-Zusammenfassung des heutigen Tages</p>
        </div>
        <Sparkles size={14} className="text-orange-400 flex-shrink-0" />
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-orange-400" />
        <span className="text-sm">KI erstellt Tages-Abschluss…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Fehler beim Erstellen.
        <button onClick={generate} className="underline">Nochmal</button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sun size={14} className="text-orange-500" />
          <span className="text-xs font-semibold text-orange-700">Tages-Abschluss</span>
          <span className="text-[10px] text-orange-500 font-medium">
            {data.present}/{data.total} Kinder · {data.sick > 0 ? `${data.sick} krank` : 'keine Krankmeldungen'}
          </span>
        </div>
        <button onClick={generate} className="p-1.5 rounded-lg hover:bg-orange-100 transition-colors">
          <RefreshCw size={13} className="text-orange-400" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Highlight */}
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sun size={12} className="text-amber-600" />
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{data.highlight}</p>
        </div>

        {/* Hinweise */}
        {data.hinweise?.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1.5">
            <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle size={10} /> Hinweise für morgen
            </p>
            {data.hinweise.map((h, i) => (
              <p key={i} className="text-xs text-gray-700 leading-relaxed pl-1">• {h}</p>
            ))}
          </div>
        )}

        {/* Pädagogik */}
        {data.paedagogik && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb size={12} className="text-teal-600" />
            </div>
            <p className="text-xs text-gray-600 italic leading-relaxed">{data.paedagogik}</p>
          </div>
        )}

        <p className="text-[10px] text-gray-400">KI-generiert auf Basis heutiger Daten · {data.dayLabel}</p>
      </div>
    </div>
  )
}
