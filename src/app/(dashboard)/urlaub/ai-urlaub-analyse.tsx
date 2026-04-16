'use client'
import { useState } from 'react'
import { Plane, RefreshCw, Loader2 } from 'lucide-react'

const TYP_CONFIG: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  dringend: { dot: 'bg-red-500',   bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-800' },
  hinweis:  { dot: 'bg-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  info:     { dot: 'bg-blue-400',  bg: 'bg-blue-50',  border: 'border-blue-200',  text: 'text-blue-800' },
}

export default function AiUrlaubAnalyse() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function analyse() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/urlaub-analyse', { method: 'POST' })
      setData(await res.json())
    } finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl p-0.5" style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
      <div className="bg-white rounded-[14px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
              <Plane size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">KI Urlaubs-Übersicht</span>
          </div>
          {data?.stats && (
            <div className="flex gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                {data.stats.pending} ausstehend
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {data.stats.upcoming} bald
              </span>
            </div>
          )}
        </div>

        {!data && !loading && (
          <button onClick={analyse}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#06b6d4)' }}>
            Urlaub analysieren
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 size={16} className="animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">Analysiere…</span>
          </div>
        )}

        {data && !loading && (
          <div className="space-y-2">
            {(data.hinweise ?? []).map((h: any, i: number) => {
              const c = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
              return (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl border ${c.bg} ${c.border}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
                  <p className={`text-xs leading-relaxed ${c.text}`}>{h.text}</p>
                </div>
              )
            })}
            <button onClick={analyse}
              className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-gray-600 transition-colors mt-1">
              <RefreshCw size={10} /> Neu analysieren
            </button>
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-2">KI-Analyse · keine Rechtsberatung</p>
      </div>
    </div>
  )
}
