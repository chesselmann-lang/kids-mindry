'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

const TYP_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  positiv: { icon: CheckCircle2, bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100' },
  hinweis: { icon: Info,         bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100'  },
  warnung: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700',  border: 'border-amber-100' },
}

interface Insight {
  typ: string
  titel: string
  text: string
}

export default function AiWochenanalyse() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [weekLabel, setWeekLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/wochenanalyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'failed')
      setInsights(data.insights ?? [])
      setWeekLabel(data.weekLabel ?? '')
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
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Wochenanalyse</p>
          <p className="text-xs text-gray-400 mt-0.5">Insights & Empfehlungen für die Vorwoche</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-indigo-500" />
        <span className="text-sm">KI analysiert Vorwoche…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Analyse fehlgeschlagen.
        <button onClick={analyse} className="underline">Nochmal</button>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-teal-50 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700">KI-Analyse · {weekLabel}</span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
          <RefreshCw size={13} className="text-indigo-500" />
        </button>
      </div>
      <div className="p-4 space-y-2.5">
        {insights.length === 0 ? (
          <p className="text-xs text-gray-400">Keine Auffälligkeiten diese Woche.</p>
        ) : insights.map((insight, i) => {
          const cfg = TYP_CONFIG[insight.typ] ?? TYP_CONFIG.hinweis
          const Icon = cfg.icon
          return (
            <div key={i} className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-2">
                <Icon size={13} className={`${cfg.text} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`text-xs font-semibold ${cfg.text} mb-0.5`}>{insight.titel}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{insight.text}</p>
                </div>
              </div>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert auf Basis der Vorwoche · Bitte eigenständig prüfen</p>
      </div>
    </div>
  )
}
