'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Loader2, AlertTriangle, Info, CheckCircle2, RefreshCw } from 'lucide-react'

interface Insight {
  type: 'warning' | 'info' | 'success'
  title: string
  text: string
}

const TYPE_CONFIG = {
  warning: { icon: AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-200', color: 'text-amber-700', iconColor: 'text-amber-500' },
  info:    { icon: Info,          bg: 'bg-sky-50',   border: 'border-sky-200',   color: 'text-sky-700',   iconColor: 'text-sky-500' },
  success: { icon: CheckCircle2,  bg: 'bg-green-50', border: 'border-green-200', color: 'text-green-700', iconColor: 'text-green-500' },
}

export default function AiInsightsWidget() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/anomalien')
      if (!res.ok) throw new Error('failed')
      const data = await res.json()
      setInsights(Array.isArray(data.insights) ? data.insights : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-violet-500 flex-shrink-0" />
        <span className="text-sm">KI analysiert Daten…</span>
      </div>
    )
  }

  if (error || insights.length === 0) return null

  return (
    <div className="space-y-2">
      {insights.map((ins, idx) => {
        const cfg = TYPE_CONFIG[ins.type] ?? TYPE_CONFIG.info
        const Icon = cfg.icon
        return (
          <div key={idx} className={`card p-4 flex gap-3 ${cfg.bg} border ${cfg.border}`}>
            <Icon size={16} className={`${cfg.iconColor} flex-shrink-0 mt-0.5`} />
            <div>
              <p className={`text-sm font-semibold ${cfg.color}`}>{ins.title}</p>
              <p className={`text-xs mt-0.5 ${cfg.color} opacity-80`}>{ins.text}</p>
            </div>
          </div>
        )
      })}
      <button
        onClick={load}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600 transition-colors"
      >
        <RefreshCw size={10} /> Neu analysieren
      </button>
    </div>
  )
}
