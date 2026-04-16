'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, TrendingUp, Lightbulb } from 'lucide-react'

interface Bereich {
  bereich: string
  einschaetzung: 'positiv' | 'neutral' | 'aufmerksamkeit'
  text: string
}

interface Result {
  kurzbild: string
  bereiche: Bereich[]
  empfehlung: string
  childName: string
}

const EINSCHAETZUNG_CONFIG = {
  positiv:        { dot: 'bg-green-400',  text: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-100' },
  neutral:        { dot: 'bg-blue-400',   text: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  aufmerksamkeit: { dot: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-100' },
}

interface Props {
  childId: string
  childName: string
  isStaff: boolean
}

export default function AiKindVerlaufAnalyse({ childId, childName, isStaff }: Props) {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!isStaff) return null

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/kind-verlauf-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      const data = await res.json()
      if (!res.ok || !data.kurzbild) throw new Error('failed')
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-emerald-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Verlaufsanalyse</p>
          <p className="text-xs text-gray-400 mt-0.5">{childName}s Entwicklung zusammenfassen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-emerald-500" />
        <span className="text-sm">KI analysiert {childName}s Verlauf…</span>
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

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">KI-Verlaufsanalyse · {childName}</span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
          <RefreshCw size={13} className="text-emerald-500" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">{result.kurzbild}</p>

        {result.bereiche?.length > 0 && (
          <div className="space-y-1.5">
            {result.bereiche.map((b, i) => {
              const cfg = EINSCHAETZUNG_CONFIG[b.einschaetzung] ?? EINSCHAETZUNG_CONFIG.neutral
              return (
                <div key={i} className={`rounded-xl p-2.5 border ${cfg.bg} ${cfg.border} flex items-start gap-2`}>
                  <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1.5 flex-shrink-0`} />
                  <div>
                    <span className={`text-[11px] font-bold ${cfg.text}`}>{b.bereich} · </span>
                    <span className="text-xs text-gray-700">{b.text}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {result.empfehlung && (
          <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl p-2.5">
            <Lightbulb size={13} className="text-violet-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-violet-700">{result.empfehlung}</p>
          </div>
        )}

        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Nur für interne Nutzung · Bitte eigenständig prüfen</p>
      </div>
    </div>
  )
}
