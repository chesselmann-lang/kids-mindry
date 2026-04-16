'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

interface Hinweis {
  typ: 'positiv' | 'hinweis' | 'warnung'
  titel: string
  text: string
  kind: string | null
}

const TYP_CONFIG = {
  positiv:  { icon: CheckCircle2,  bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700',  iconColor: 'text-green-500' },
  hinweis:  { icon: Info,           bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   iconColor: 'text-blue-500' },
  warnung:  { icon: AlertTriangle,  bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  iconColor: 'text-amber-500' },
}

export default function AiSchlafAnalyse() {
  const [hinweise, setHinweise] = useState<Hinweis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState('')

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/schlaf-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error('failed')
      if (data.message) setMessage(data.message)
      setHinweise(data.hinweise ?? [])
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Schlafanalyse</p>
          <p className="text-xs text-gray-400 mt-0.5">Schlafdaten der letzten 14 Tage analysieren</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-indigo-500" />
        <span className="text-sm">KI analysiert Schlafdaten…</span>
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

  if (message && hinweise.length === 0) {
    return (
      <div className="card p-4 text-sm text-gray-500 bg-gray-50 flex items-center justify-between">
        <span>{message}</span>
        <button onClick={analyse} className="p-1 hover:text-indigo-600">
          <RefreshCw size={13} />
        </button>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700">KI-Schlafanalyse · letzte 14 Tage</span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
          <RefreshCw size={13} className="text-indigo-500" />
        </button>
      </div>
      <div className="p-4 space-y-2.5">
        {hinweise.map((h, i) => {
          const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.hinweis
          const Icon = cfg.icon
          return (
            <div key={i} className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-2">
                <Icon size={13} className={`${cfg.iconColor} mt-0.5 flex-shrink-0`} />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-xs font-semibold ${cfg.text}`}>{h.titel}</p>
                    {h.kind && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-white border ${cfg.border} ${cfg.text}`}>
                        {h.kind}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{h.text}</p>
                </div>
              </div>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert auf Basis der Schlafdaten · Bitte eigenständig prüfen</p>
      </div>
    </div>
  )
}
