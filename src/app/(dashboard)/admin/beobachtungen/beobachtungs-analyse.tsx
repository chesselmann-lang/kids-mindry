'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, TrendingUp, Lightbulb, AlertCircle } from 'lucide-react'

const KATEGORIE_EMOJI: Record<string, string> = {
  sprache: '🗣️', motorik: '🏃', sozial: '👥', kognition: '🧠',
  kreativitaet: '🎨', emotion: '💛', allgemein: '📝',
}

const TYP_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  thema:       { icon: TrendingUp,  bg: 'bg-brand-50',  text: 'text-brand-700',  border: 'border-brand-100' },
  empfehlung:  { icon: Lightbulb,   bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100' },
}

interface AnalyseResult {
  typ: string
  titel: string
  text: string
  kategorie: string
}

interface Props {
  observationCount: number
}

export default function BeobachtungsAnalyse({ observationCount }: Props) {
  const [results, setResults] = useState<AnalyseResult[]>([])
  const [byCategory, setByCategory] = useState<Record<string, number>>({})
  const [totalObs, setTotalObs] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/beobachtungen-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'failed')
      setResults(data.results ?? [])
      setByCategory(data.byCategory ?? {})
      setTotalObs(data.totalObservations ?? 0)
      setAnalyzed(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!analyzed && !loading) {
    return (
      <button
        onClick={analyse}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-100 to-brand-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-teal-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Muster analysieren</p>
          <p className="text-xs text-gray-400 mt-0.5">Themen & Empfehlungen aus {observationCount} Beobachtungen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-teal-500" />
        <span className="text-sm">KI analysiert Beobachtungsmuster…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        <AlertCircle size={14} />
        Analyse nicht möglich (zu wenig Daten oder Fehler).
        <button onClick={analyse} className="underline ml-1">Wiederholen</button>
      </div>
    )
  }

  // Category distribution
  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-brand-50 border-b border-teal-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-teal-600" />
          <span className="text-xs font-semibold text-teal-700">KI-Analyse · letzte 30 Tage · {totalObs} Beobachtungen</span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-teal-100 transition-colors">
          <RefreshCw size={13} className="text-teal-500" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Category bar chart */}
        {sortedCats.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Verteilung nach Bereich</p>
            {sortedCats.slice(0, 5).map(([cat, count]) => {
              const maxCount = sortedCats[0]?.[1] ?? 1
              const pct = Math.round((count / maxCount) * 100)
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="text-xs w-20 flex-shrink-0 text-gray-600">
                    {KATEGORIE_EMOJI[cat] ?? '📝'} {cat}
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* AI results */}
        <div className="space-y-2.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Muster & Empfehlungen</p>
          {results.length === 0 ? (
            <p className="text-xs text-gray-400">Keine Muster erkannt.</p>
          ) : results.map((r, i) => {
            const cfg = TYP_CONFIG[r.typ] ?? TYP_CONFIG.thema
            const Icon = cfg.icon
            return (
              <div key={i} className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-start gap-2">
                  <Icon size={13} className={`${cfg.text} mt-0.5 flex-shrink-0`} />
                  <div>
                    <p className={`text-xs font-semibold ${cfg.text} mb-0.5`}>
                      {KATEGORIE_EMOJI[r.kategorie] ?? ''} {r.titel}
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">{r.text}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-[10px] text-gray-400">KI-generiert auf Basis der letzten 30 Tage · Bitte eigenständig prüfen</p>
      </div>
    </div>
  )
}
