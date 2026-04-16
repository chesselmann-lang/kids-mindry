'use client'

import { useState } from 'react'
import { Moon, Sparkles, Loader2, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react'

interface Result {
  highlight: string
  hinweise: string[]
  paedagogik: string
  dayLabel: string
  present: number
  sick: number
  total: number
}

export default function AiTagesAbschluss() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(true)

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/tages-abschluss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok || !data.highlight) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!result && !loading && !error) {
    return (
      <button onClick={generate}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #f97316, #7c3aed)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Moon size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Tagesabschluss</p>
          <p className="text-xs text-white/70 mt-0.5">Heutigen Tag automatisch zusammenfassen</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #f97316, #7c3aed)' }}>
        <Loader2 size={18} className="animate-spin text-white flex-shrink-0" />
        <span className="text-sm text-white">Erstelle Tagesabschluss…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 bg-red-50 border border-red-200 flex items-center gap-3">
        <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
        <p className="text-sm text-red-700 flex-1">Fehler beim Erstellen des Tagesabschlusses.</p>
        <button onClick={generate} className="text-xs text-red-600 underline">Nochmal</button>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #f97316, #7c3aed)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #7c3aed)' }}>
              <Moon size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Tagesabschluss</p>
              <p className="text-[10px] text-gray-400">
                {result.present}/{result.total} Kinder{result.sick > 0 ? ` · ${result.sick} krank` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={generate} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshCw size={13} className="text-gray-400" />
            </button>
            <button onClick={() => setOpen(o => !o)} aria-label="KI-Analyse ein-/ausblenden" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="px-4 pb-4 space-y-3">
            {/* Highlight */}
            <div className="rounded-xl px-3 py-2.5"
              style={{ background: 'linear-gradient(135deg, #fff7ed, #faf5ff)' }}>
              <p className="text-sm font-medium text-gray-800 leading-relaxed">🌟 {result.highlight}</p>
            </div>

            {/* Hinweise */}
            {result.hinweise && result.hinweise.length > 0 && (
              <div className="space-y-1.5">
                {result.hinweise.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-lg px-2.5 py-2">
                    <AlertCircle size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">{h}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pädagogik */}
            {result.paedagogik && (
              <div className="flex items-start gap-2 bg-violet-50 rounded-lg px-2.5 py-2">
                <Sparkles size={11} className="text-violet-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-violet-800 leading-relaxed">{result.paedagogik}</p>
              </div>
            )}

            <p className="text-[9px] text-gray-400">KI-generiert · {result.dayLabel}</p>
          </div>
        )}
      </div>
    </div>
  )
}
