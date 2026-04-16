'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Lightbulb } from 'lucide-react'

interface Result {
  titel: string
  synthese: string
  stimmung: 'positiv' | 'neutral' | 'gemischt'
  empfehlung: string
  stats: { present: number; total: number; reports: number }
}

const STIMMUNG_CONFIG = {
  positiv:  { bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700',  accent: 'text-green-500',  emoji: '🌟' },
  neutral:  { bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   accent: 'text-blue-500',   emoji: '☀️' },
  gemischt: { bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  accent: 'text-amber-500',  emoji: '🌤️' },
}

export default function AiTagesjournalSynthese() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function synthesize() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/tagesjournal-synthese', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok || !data.synthese) throw new Error('failed')
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
        onClick={synthesize}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-violet-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Tagessynthese</p>
          <p className="text-xs text-gray-400 mt-0.5">Den heutigen Tag in einem Satz zusammenfassen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-violet-500" />
        <span className="text-sm">KI erstellt Tagessynthese…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Fehler. <button onClick={synthesize} className="underline">Nochmal</button>
      </div>
    )
  }

  if (!result) return null

  const cfg = STIMMUNG_CONFIG[result.stimmung] ?? STIMMUNG_CONFIG.neutral

  return (
    <div className={`card overflow-hidden border ${cfg.border}`}>
      <div className={`px-4 py-3 ${cfg.bg} border-b ${cfg.border} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span>{cfg.emoji}</span>
          <span className={`text-xs font-semibold ${cfg.text}`}>
            {result.titel} · {result.stats.present}/{result.stats.total} Kinder
          </span>
        </div>
        <button onClick={synthesize} className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
          <RefreshCw size={13} className={cfg.accent} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">{result.synthese}</p>

        {result.empfehlung && (
          <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl p-2.5">
            <Lightbulb size={13} className="text-violet-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-violet-700">{result.empfehlung}</p>
          </div>
        )}

        <p className="text-[10px] text-gray-400">KI-generiert · {result.stats.reports} Berichte ausgewertet</p>
      </div>
    </div>
  )
}
