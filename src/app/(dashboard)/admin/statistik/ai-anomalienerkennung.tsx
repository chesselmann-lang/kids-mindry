'use client'

import { useState, useEffect } from 'react'
import { Zap, Loader2, AlertTriangle, Info, CheckCircle2, RefreshCw } from 'lucide-react'

interface Insight { type: 'warning' | 'info' | 'success'; title: string; text: string }

const TYPE_CONFIG = {
  warning: { icon: AlertTriangle, bg: 'bg-red-50',    border: 'border-red-100',   text: 'text-red-800',   title: 'text-red-900',  iconColor: 'text-red-500'   },
  info:    { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-100',  text: 'text-blue-800',  title: 'text-blue-900', iconColor: 'text-blue-500'  },
  success: { icon: CheckCircle2,  bg: 'bg-green-50',  border: 'border-green-100', text: 'text-green-800', title: 'text-green-900',iconColor: 'text-green-500' },
}

export default function AiAnomalienerkennung() {
  const [insights, setInsights] = useState<Insight[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(true)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/anomalien')
      const data = await res.json()
      if (!res.ok || !data.insights) throw new Error('failed')
      setInsights(data.insights)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
            <Zap size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-800">KI-Anomalieerkennung</p>
            <p className="text-[10px] text-gray-400">Auffälligkeiten der letzten 30 Tage</p>
          </div>
          {insights && (
            <button onClick={load} aria-label="Neu analysieren" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw size={13} className="text-gray-400" />
            </button>
          )}
        </div>

        <div className="px-4 pb-3">
          {!insights && !loading && !error && (
            <button onClick={load}
              className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)' }}>
              Anomalien erkennen
            </button>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 py-3">
              <Loader2 size={14} className="animate-spin text-red-500" />
              <span className="text-xs text-gray-500">Analysiere 30-Tage-Verlauf…</span>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 py-2 flex items-center gap-2">
              <AlertTriangle size={12} className="flex-shrink-0" />
              Fehler beim Analysieren.
              <button onClick={load} className="underline">Nochmal</button>
            </div>
          )}

          {insights && insights.length === 0 && (
            <div className="flex items-center gap-2 py-2 bg-green-50 rounded-xl px-3">
              <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
              <p className="text-xs text-green-700">Keine Auffälligkeiten erkannt – alles im Normbereich.</p>
            </div>
          )}

          {insights && insights.length > 0 && (
            <div className="space-y-2">
              {insights.map((insight, i) => {
                const cfg = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.info
                const Icon = cfg.icon
                return (
                  <div key={i} className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={12} className={cfg.iconColor} />
                      <p className={`text-[11px] font-bold ${cfg.title}`}>{insight.title}</p>
                    </div>
                    <p className={`text-xs leading-relaxed ${cfg.text}`}>{insight.text}</p>
                  </div>
                )
              })}
              <p className="text-[9px] text-gray-400 pt-1">KI-Analyse · 30-Tage-Verlauf · {new Date().toLocaleDateString('de-DE')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
