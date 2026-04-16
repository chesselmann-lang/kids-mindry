'use client'
import { useState } from 'react'
import { Sparkles, ShieldCheck } from 'lucide-react'

type Hinweis = { typ: 'wichtig' | 'hinweis' | 'info'; text: string }

const TYP_CONFIG = {
  wichtig: { dot: 'bg-red-400',    badge: 'bg-red-50 text-red-800',     label: 'Wichtig' },
  hinweis: { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-800', label: 'Hinweis' },
  info:    { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-800', label: 'Info' },
}

export default function AiEinwilligungen() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ hinweise: Hinweis[]; stats: any } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function analyse() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/ai/einwilligungen-analyse')
      if (!res.ok) throw new Error('Fehler beim Laden')
      setResult(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-0.5" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
      <div className="bg-white rounded-[14px] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
              <ShieldCheck size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">KI-Datenschutz-Check</span>
          </div>
          {result && (
            <div className="flex gap-1.5">
              {result.stats.withConsent > 0 && (
                <span className="text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  {result.stats.withConsent} erteilt
                </span>
              )}
              {result.stats.withoutConsent > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                  {result.stats.withoutConsent} ausstehend
                </span>
              )}
            </div>
          )}
        </div>

        {!result && !loading && (
          <button onClick={analyse}
            className="w-full py-2 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
            <Sparkles size={14} />
            Einwilligungen prüfen
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4">
            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
            <span className="text-xs text-gray-400">Prüfung läuft…</span>
          </div>
        )}

        {error && <p className="text-xs text-red-500 text-center py-2">{error}</p>}

        {result && (
          <div className="space-y-2">
            {result.hinweise.map((h, i) => {
              const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
              return (
                <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${cfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mr-1.5 ${cfg.badge}`}>{cfg.label}</span>
                    <span className="text-xs text-gray-700">{h.text}</span>
                  </div>
                </div>
              )
            })}
            <p className="text-[10px] text-gray-400 text-right pt-1">KI-Analyse · Kein Rechtsrat</p>
          </div>
        )}
      </div>
    </div>
  )
}
