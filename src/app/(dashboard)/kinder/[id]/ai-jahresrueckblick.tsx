'use client'

import { useState } from 'react'
import { CalendarRange, Sparkles, Loader2, Copy, Check, RotateCcw, Star, TrendingUp, AlertTriangle } from 'lucide-react'

interface JahresResult {
  jahresrückblick: {
    einleitung: string
    entwicklung: string
    highlights: string[]
    staerken: string
    ausblick: string
    abschluss: string
  }
  stats: {
    anwesenheitsrate: number
    meilensteine: number
    berichte: number
    jahr: number
  }
  childName: string
  year: number
}

export default function AiJahresrueckblick({ childId }: { childId: string }) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear - 1)
  const [result, setResult] = useState<JahresResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/jahresrueckblick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, year }),
      })
      const data = await res.json()
      if (!res.ok || !data.jahresrückblick) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copyAll() {
    if (!result) return
    const jr = result.jahresrückblick
    const text = [
      `Jahresrückblick ${result.year}`,
      '',
      jr.einleitung,
      '',
      jr.entwicklung,
      '',
      jr.staerken,
      '',
      'Highlights des Jahres:',
      ...jr.highlights.map(h => `• ${h}`),
      '',
      jr.ausblick,
      '',
      jr.abschluss,
    ].join('\n')
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <CalendarRange size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Jahresrückblick</p>
          <p className="text-xs text-white/70 mt-0.5">Jahresbericht automatisch generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <CalendarRange size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Jahresrückblick</p>
              <p className="text-[10px] text-gray-400">Entwicklungsbericht für ein Kalenderjahr</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {!result && (
            <>
              {/* Jahr wählen */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Jahr</label>
                <div className="mt-1 grid grid-cols-3 gap-1.5">
                  {[currentYear - 2, currentYear - 1, currentYear].map(y => (
                    <button key={y}
                      onClick={() => setYear(y)}
                      className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
                        year === y ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={year === y ? { background: 'linear-gradient(135deg, #f59e0b, #ef4444)' } : {}}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <AlertTriangle size={12} />
                  Fehler beim Generieren. Bitte nochmal versuchen.
                </div>
              )}

              <button onClick={generate} disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere Jahresrückblick {year}…</>
                  : <><Sparkles size={12} /> Jahresrückblick {year} generieren</>
                }
              </button>
            </>
          )}

          {result && (
            <div className="space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                  <p className="text-base font-bold text-amber-700">{result.stats.anwesenheitsrate}%</p>
                  <p className="text-[9px] text-amber-600">Anwesenheit</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                  <p className="text-base font-bold text-amber-700">{result.stats.meilensteine}</p>
                  <p className="text-[9px] text-amber-600">Meilensteine</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                  <p className="text-base font-bold text-amber-700">{result.stats.berichte}</p>
                  <p className="text-[9px] text-amber-600">Berichte</p>
                </div>
              </div>

              {/* Einleitung */}
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-xs text-gray-800 leading-relaxed italic">{result.jahresrückblick.einleitung}</p>
              </div>

              {/* Entwicklung */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <TrendingUp size={10} /> Entwicklung
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">{result.jahresrückblick.entwicklung}</p>
              </div>

              {/* Highlights */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Star size={10} /> Highlights {result.year}
                </p>
                <div className="space-y-1.5">
                  {result.jahresrückblick.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 text-xs mt-0.5">✦</span>
                      <p className="text-xs text-gray-700">{h}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stärken */}
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-green-700 mb-1">Stärken</p>
                <p className="text-xs text-gray-700 leading-relaxed">{result.jahresrückblick.staerken}</p>
              </div>

              {/* Ausblick */}
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-blue-700 mb-1">Ausblick {result.year + 1}</p>
                <p className="text-xs text-gray-700 leading-relaxed">{result.jahresrückblick.ausblick}</p>
              </div>

              {/* Abschluss */}
              <p className="text-xs text-gray-500 italic text-center px-2">{result.jahresrückblick.abschluss}</p>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={copyAll}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Alles kopieren</>}
                </button>
                <button onClick={() => setResult(null)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-Jahresrückblick {result.year} · vor Weitergabe prüfen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
