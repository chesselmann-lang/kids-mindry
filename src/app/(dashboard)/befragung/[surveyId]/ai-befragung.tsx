'use client'

import { useState } from 'react'
import { Sparkles, BarChart2, Loader2 } from 'lucide-react'

const TYP_CONFIG: Record<string, { color: string; dot: string }> = {
  kontext:    { color: 'text-violet-800 bg-violet-50', dot: 'bg-violet-400' },
  motivation: { color: 'text-blue-800 bg-blue-50',    dot: 'bg-blue-400' },
  info:       { color: 'text-gray-700 bg-gray-50',    dot: 'bg-gray-400' },
}

export default function AiBefragung({ surveyId }: { surveyId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyse = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ai/befragung-analyse?surveyId=${surveyId}`)
      if (!res.ok) throw new Error('Fehler')
      const json = await res.json()
      setData(json)
    } catch {
      setError('Analyse konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
              <BarChart2 size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">KI-Kontext</span>
            {data?.stats && (
              <span className="text-[10px] bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                {data.stats.questionCount} Fragen
              </span>
            )}
          </div>
          {!data && (
            <button
              onClick={analyse}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading ? 'Analysiere…' : 'Kontext erklären'}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {data?.hinweise && (
          <div className="space-y-2">
            {data.hinweise.map((h: any, i: number) => {
              const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
              return (
                <div key={i} className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${cfg.color}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${cfg.dot}`} />
                  <p className="text-xs leading-relaxed">{h.text}</p>
                </div>
              )
            })}
            <p className="text-[10px] text-gray-400 mt-1">KI-generiert · Bitte kritisch prüfen</p>
          </div>
        )}
      </div>
    </div>
  )
}
