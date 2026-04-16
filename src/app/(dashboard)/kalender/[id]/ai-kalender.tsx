'use client'

import { useState } from 'react'
import { Sparkles, CalendarDays, Loader2 } from 'lucide-react'

const TYP_CONFIG: Record<string, { color: string; dot: string }> = {
  termin: { color: 'text-brand-800 bg-brand-50',  dot: 'bg-brand-400' },
  hinweis:{ color: 'text-amber-800 bg-amber-50',  dot: 'bg-amber-400' },
  info:   { color: 'text-gray-700 bg-gray-50',    dot: 'bg-gray-400' },
}

export default function AiKalender({ eventId }: { eventId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyse = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ai/kalender-analyse?eventId=${eventId}`)
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
    <div className="rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)' }}>
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)' }}>
              <CalendarDays size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">KI-Analyse</span>
            {data?.stats && (
              <div className="flex items-center gap-1.5">
                {data.stats.daysUntil > 0 && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                    In {data.stats.daysUntil} Tagen
                  </span>
                )}
                {data.stats.rsvpRequired && (
                  <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                    {data.stats.yesCount} Anmeldungen
                  </span>
                )}
              </div>
            )}
          </div>
          {!data && (
            <button
              onClick={analyse}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #22c55e)' }}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading ? 'Analysiere…' : 'Analysieren'}
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
