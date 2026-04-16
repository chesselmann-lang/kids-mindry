'use client'
import { useState } from 'react'
import { Sparkles, RefreshCw, Users } from 'lucide-react'

type Hinweis = { typ: 'achtung' | 'hinweis' | 'vollständig'; text: string }
type Result = { hinweise: Hinweis[]; stats: { total: number; withContact: number; completeness: number; noContact: number } }

const TYP_CONFIG = {
  achtung:    { dot: 'bg-red-400',   bg: 'bg-red-50',   border: 'border-red-200',   text: 'text-red-800' },
  hinweis:    { dot: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800' },
  vollständig:{ dot: 'bg-green-400', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
}

export default function AiElternkontakteAnalyse() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyse() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/ai/elternkontakte-analyse', { method: 'POST' })
      if (!res.ok) throw new Error('Fehler')
      setResult(await res.json())
    } catch { setError('KI-Analyse fehlgeschlagen') }
    finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 p-0.5 shadow-md">
      <div className="rounded-[14px] bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center">
              <Users size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-800">KI-Kontaktvollständigkeit</span>
          </div>
          {result && (
            <div className="flex items-center gap-2">
              {result.stats.noContact > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {result.stats.noContact} ohne Kontakt
                </span>
              )}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${result.stats.completeness >= 90 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {result.stats.completeness}% vollständig
              </span>
            </div>
          )}
        </div>

        {!result && !loading && (
          <button
            onClick={analyse}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles size={15} />
            Kontakte analysieren
          </button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
            <RefreshCw size={14} className="animate-spin" />
            Analysiere...
          </div>
        )}

        {error && <p className="text-xs text-red-500 text-center py-2">{error}</p>}

        {result && (
          <div className="space-y-2">
            {result.hinweise.map((h, i) => {
              const c = TYP_CONFIG[h.typ] ?? TYP_CONFIG.hinweis
              return (
                <div key={i} className={`flex gap-2.5 p-2.5 rounded-xl border ${c.bg} ${c.border}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
                  <p className={`text-xs leading-relaxed ${c.text}`}>{h.text}</p>
                </div>
              )
            })}
            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-gray-300">KI-generiert · nicht verbindlich</p>
              <button onClick={analyse} className="text-[10px] text-brand-400 hover:text-brand-600 flex items-center gap-1">
                <RefreshCw size={10} /> Neu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
