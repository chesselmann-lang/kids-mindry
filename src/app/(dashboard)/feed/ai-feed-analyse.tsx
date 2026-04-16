'use client'

import { useState } from 'react'
import { Megaphone, RefreshCw, Loader2 } from 'lucide-react'

const TYP_CONFIG: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  hinweis: { dot: 'bg-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-800' },
  tipp:    { dot: 'bg-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800' },
  info:    { dot: 'bg-gray-400',   bg: 'bg-gray-50',   border: 'border-gray-200',  text: 'text-gray-700' },
}

export default function AiFeedAnalyse() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/feed-analyse')
      if (!res.ok) throw new Error(await res.text())
      setData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-0.5 mb-1" style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}>
      <div className="bg-white rounded-[14px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}>
              <Megaphone size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Kommunikations-Analyse</p>
              <p className="text-[10px] text-gray-400">KI-Check der Neuigkeiten (30 Tage)</p>
            </div>
          </div>
          {data && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">{data.stats.total30} Beiträge</span>
              {data.stats.upcomingCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{data.stats.upcomingCount} Events</span>
              )}
            </div>
          )}
        </div>

        {!data && !loading && (
          <button onClick={load} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}>
            Kommunikation analysieren
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-sky-600">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Analysiere Neuigkeiten…</span>
          </div>
        )}

        {error && <p className="text-xs text-red-500 py-2">{error}</p>}

        {data && (
          <div className="space-y-2">
            {(data.hinweise as any[]).map((h: any, i: number) => {
              const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
              return (
                <div key={i} className={`flex gap-2.5 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                  <p className={`text-xs leading-relaxed ${cfg.text}`}>{h.text}</p>
                </div>
              )
            })}
            <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mt-2">
              <RefreshCw size={11} /> Aktualisieren
            </button>
            <p className="text-[10px] text-gray-300">KI-Einschätzung · Keine Rechtsberatung</p>
          </div>
        )}
      </div>
    </div>
  )
}
