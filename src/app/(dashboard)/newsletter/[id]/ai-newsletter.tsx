'use client'

import { useState } from 'react'
import { Sparkles, Mail, Loader2 } from 'lucide-react'

const TYP_CONFIG: Record<string, { color: string; dot: string }> = {
  wichtig: { color: 'text-red-800 bg-red-50',    dot: 'bg-red-400' },
  info:    { color: 'text-blue-800 bg-blue-50',  dot: 'bg-blue-400' },
  tipp:    { color: 'text-green-800 bg-green-50',dot: 'bg-green-400' },
}

export default function AiNewsletter({ newsletterId }: { newsletterId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyse = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ai/newsletter-analyse?newsletterId=${newsletterId}`)
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
    <div className="rounded-2xl p-[2px]" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
      <div className="bg-white rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
              <Mail size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">KI-Zusammenfassung</span>
            {data?.stats && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
                  {data.stats.wordCount} Wörter
                </span>
                {data.stats.hasAttachment && (
                  <span className="text-[10px] bg-pink-100 text-pink-700 font-semibold px-2 py-0.5 rounded-full">
                    📎 Anhang
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
              style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading ? 'Analysiere…' : 'Zusammenfassen'}
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
