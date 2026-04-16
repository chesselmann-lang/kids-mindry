'use client'
import { useState } from 'react'
import { Mail, RefreshCw, Loader2 } from 'lucide-react'

const TYP_CONFIG: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  tipp:    { dot: 'bg-blue-500',  bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800' },
  info:    { dot: 'bg-gray-400',  bg: 'bg-gray-50',   border: 'border-gray-200',  text: 'text-gray-700' },
  positiv: { dot: 'bg-green-500', bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800' },
}

export default function AiNewsletterAnalyse() {
  const [data, setData]     = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function analyse() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/newsletter-analyse', { method: 'POST' })
      if (!res.ok) return
      setData(await res.json())
    } finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl p-0.5" style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
      <div className="bg-white rounded-[14px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
              <Mail size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">KI Newsletter-Check</span>
          </div>
          {data?.stats && (
            <div className="flex gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {data.stats.total} gesamt
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                {data.stats.last30} diesen Monat
              </span>
            </div>
          )}
        </div>

        {!data && !loading && (
          <button onClick={analyse}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
            Newsletter analysieren
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
        <p className="text-[10px] text-gray-400 mt-2">KI-Analyse · Kommunikationsübersicht</p>
      </div>
    </div>
  )
}
