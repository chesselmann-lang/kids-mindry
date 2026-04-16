'use client'

import { useState } from 'react'
import { BookOpen, Sparkles, Loader2, Copy, Check, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { format, startOfWeek, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'

interface Entwurf {
  titel: string
  zusammenfassung: string
  hauptthemen: string[]
  inhalt: string
  ausblick: string
}

function getDefaultWeekStart() {
  const now = new Date()
  const dow = now.getDay()
  const useLastWeek = dow === 0 || dow === 1
  const ref = useLastWeek ? subWeeks(now, 1) : now
  return format(startOfWeek(ref, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

export default function AiWochenberichtEntwurf() {
  const [open, setOpen] = useState(false)
  const [weekStart, setWeekStart] = useState(getDefaultWeekStart)
  const [result, setResult] = useState<{ entwurf: Entwurf; weekLabel: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(true)

  async function generate() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/wochenbericht-entwurf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart }),
      })
      const data = await res.json()
      if (!res.ok || !data.entwurf) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copyAll() {
    if (!result) return
    const { entwurf, weekLabel } = result
    const text = [
      entwurf.titel,
      '',
      entwurf.zusammenfassung,
      '',
      entwurf.inhalt,
      entwurf.ausblick ? `\n${entwurf.ausblick}` : '',
    ].join('\n')
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #14b8a6)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <BookOpen size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Wochenberichtsentwurf</p>
          <p className="text-xs text-white/70 mt-0.5">Wochenbericht aus echten Kita-Daten generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #3b82f6, #14b8a6)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #14b8a6)' }}>
              <BookOpen size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Wochenberichtsentwurf</p>
              <p className="text-[10px] text-gray-400">Aus echten Anwesenheits-, Berichts- und Beobachtungsdaten</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Week picker */}
          {!result && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Wochenstart (Montag)</label>
                <input
                  type="date"
                  value={weekStart}
                  onChange={e => setWeekStart(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              {error && <p className="text-xs text-red-500">Fehler beim Generieren. Bitte nochmal versuchen.</p>}
              <button onClick={generate} disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #14b8a6)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere Wochenbericht…</>
                  : <><Sparkles size={12} /> Wochenbericht generieren</>
                }
              </button>
            </>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              {/* Title + controls */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{result.entwurf.titel}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{result.weekLabel}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setExpanded(e => !e)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    {expanded ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
                  </button>
                </div>
              </div>

              {expanded && (
                <>
                  {/* Zusammenfassung */}
                  <p className="text-xs text-gray-600 italic leading-relaxed">{result.entwurf.zusammenfassung}</p>

                  {/* Hauptthemen pills */}
                  {result.entwurf.hauptthemen?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {result.entwurf.hauptthemen.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Inhalt */}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{result.entwurf.inhalt}</p>
                  </div>

                  {/* Ausblick */}
                  {result.entwurf.ausblick && (
                    <div className="flex items-start gap-2 bg-teal-50 rounded-xl px-3 py-2.5">
                      <Sparkles size={11} className="text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-teal-800">{result.entwurf.ausblick}</p>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={copyAll}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #14b8a6)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Alles kopieren</>}
                </button>
                <button onClick={() => { setResult(null) }}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-Entwurf · vor Veröffentlichung prüfen und anpassen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
