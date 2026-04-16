'use client'

import { useState } from 'react'
import { ShieldCheck, Loader2, RefreshCw, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'

interface Hinweis {
  typ: 'gut' | 'verbesserung' | 'achtung'
  text: string
}

interface Result {
  hinweise: Hinweis[]
  stats: { compliance: number; days: number; total: number }
  message?: string
}

const TYP_CONFIG = {
  gut:          { Icon: CheckCircle2, bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700',  dot: 'bg-green-400' },
  verbesserung: { Icon: TrendingUp,   bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  achtung:      { Icon: AlertCircle,  bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  dot: 'bg-amber-400' },
}

function ComplianceBar({ value }: { value: number }) {
  const color = value >= 90 ? 'bg-green-400' : value >= 70 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-600 w-9 text-right">{value}%</span>
    </div>
  )
}

export default function AiHygieneCompliance() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/hygiene-compliance', {
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-cyan-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Compliance-Analyse</p>
          <p className="text-xs text-gray-400 mt-0.5">Hygiene-Erfüllungsgrad der letzten 14 Tage</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-cyan-500" />
        <span className="text-sm">KI analysiert Hygiene-Daten…</span>
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
        <ShieldCheck size={16} className="text-gray-300 flex-shrink-0" />
        {result.message}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-cyan-500" />
          <span className="text-xs font-semibold text-cyan-700">
            KI-Hygiene-Analyse · {result.stats?.days ?? 0} Tage
          </span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-cyan-100 transition-colors">
          <RefreshCw size={13} className="text-cyan-500" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {result.stats && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Gesamtcompliance (14 Tage)</p>
            <ComplianceBar value={result.stats.compliance} />
          </div>
        )}

        <div className="space-y-1.5">
          {result.hinweise?.map((h, i) => {
            const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.verbesserung
            return (
              <div key={i} className={`rounded-xl p-2.5 border ${cfg.bg} ${cfg.border} flex items-start gap-2`}>
                <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1 flex-shrink-0`} />
                <p className={`text-xs ${cfg.text} leading-relaxed`}>{h.text}</p>
              </div>
            )
          })}
        </div>
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Nur für interne Nutzung</p>
      </div>
    </div>
  )
}
