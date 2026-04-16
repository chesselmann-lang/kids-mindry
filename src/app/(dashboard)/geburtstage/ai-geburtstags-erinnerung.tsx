'use client'
import { useState } from 'react'
import { Sparkles, RefreshCw, Cake } from 'lucide-react'

type Hinweis = { typ: 'heute' | 'bald' | 'info'; text: string }
type Result = { hinweise: Hinweis[]; stats: { today: number; thisWeek: number; thisMonth: number } }

const TYP_CONFIG = {
  heute: { dot: 'bg-yellow-400', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  bald:  { dot: 'bg-orange-400', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
  info:  { dot: 'bg-blue-400',   bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800' },
}

export default function AiGeburtstagserinnerung() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function analyse() {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/ai/geburtstags-erinnerung', { method: 'POST' })
      if (!res.ok) throw new Error('Fehler')
      setResult(await res.json())
    } catch { setError('KI-Analyse fehlgeschlagen') }
    finally { setLoading(false) }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-0.5 shadow-md">
      <div className="rounded-[14px] bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Cake size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-gray-800">KI-Geburtstagserinnerung</span>
          </div>
          {result && (
            <div className="flex items-center gap-2">
              {result.stats.today > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                  🎂 {result.stats.today} heute
                </span>
              )}
              {result.stats.thisWeek > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {result.stats.thisWeek} diese Woche
                </span>
              )}
            </div>
          )}
        </div>

        {!result && !loading && (
          <button
            onClick={analyse}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles size={15} />
            Geburtstage prüfen
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
              const c = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
              return (
                <div key={i} className={`flex gap-2.5 p-2.5 rounded-xl border ${c.bg} ${c.border}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`} />
                  <p className={`text-xs leading-relaxed ${c.text}`}>{h.text}</p>
                </div>
              )
            })}
            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-gray-300">KI-generiert · nicht verbindlich</p>
              <button onClick={analyse} className="text-[10px] text-yellow-500 hover:text-yellow-700 flex items-center gap-1">
                <RefreshCw size={10} /> Neu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
