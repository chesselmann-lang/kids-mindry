'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface Entwurf {
  titel: string
  zusammenfassung: string
  hauptthemen: string[]
  inhalt: string
  ausblick: string
}

interface Props {
  weekStart?: string
  groupId?: string
  onApply?: (entwurf: Entwurf) => void
}

export default function AiWochenberichtEntwurf({ weekStart, groupId, onApply }: Props) {
  const [entwurf, setEntwurf] = useState<Entwurf | null>(null)
  const [weekLabel, setWeekLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(true)

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/wochenbericht-entwurf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart, groupId }),
      })
      const data = await res.json()
      if (!res.ok || !data.entwurf) throw new Error('failed')
      setEntwurf(data.entwurf)
      setWeekLabel(data.weekLabel ?? '')
      setLoaded(true)
      setOpen(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copyText() {
    if (!entwurf) return
    const text = `${entwurf.titel}\n\n${entwurf.zusammenfassung}\n\n${entwurf.inhalt}${entwurf.ausblick ? `\n\n${entwurf.ausblick}` : ''}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!loaded && !loading) {
    return (
      <button
        onClick={generate}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-sky-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Wochenbericht Entwurf</p>
          <p className="text-xs text-gray-400 mt-0.5">Automatisch aus Tagesberichten & Aktivitäten generieren</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-sky-500" />
        <span className="text-sm">KI erstellt Wochenbericht Entwurf…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Fehler. <button onClick={generate} className="underline">Nochmal</button>
      </div>
    )
  }

  if (!entwurf) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-sky-500" />
          <span className="text-xs font-semibold text-sky-700">KI-Entwurf · {weekLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={copyText} className="p-1.5 rounded-lg hover:bg-sky-100 transition-colors" title="Kopieren">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} className="text-sky-500" />}
          </button>
          <button onClick={generate} className="p-1.5 rounded-lg hover:bg-sky-100 transition-colors" title="Neu generieren">
            <RefreshCw size={13} className="text-sky-500" />
          </button>
          <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-sky-100 transition-colors">
            {open ? <ChevronUp size={13} className="text-sky-400" /> : <ChevronDown size={13} className="text-sky-400" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-900">{entwurf.titel}</h3>

          <p className="text-sm text-gray-600 leading-relaxed">{entwurf.zusammenfassung}</p>

          {entwurf.hauptthemen?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {entwurf.hauptthemen.map((t, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full border border-sky-100 font-medium">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3 border border-gray-100">
            {entwurf.inhalt}
          </div>

          {entwurf.ausblick && (
            <p className="text-xs text-sky-600 italic">Ausblick: {entwurf.ausblick}</p>
          )}

          {onApply && (
            <button
              onClick={() => onApply(entwurf)}
              className="w-full py-2 bg-sky-100 text-sky-700 rounded-xl text-sm font-semibold hover:bg-sky-200 transition-colors"
            >
              Entwurf übernehmen
            </button>
          )}

          <p className="text-[10px] text-gray-400 pt-1">KI-generiert auf Basis der Wochendaten · Bitte vor Veröffentlichung prüfen</p>
        </div>
      )}
    </div>
  )
}
