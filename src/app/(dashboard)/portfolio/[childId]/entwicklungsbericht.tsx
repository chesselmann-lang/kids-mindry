'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Copy, Check, BookOpen, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Abschnitt {
  bereich: string
  inhalt: string
}

interface Bericht {
  titel: string
  abschnitte: Abschnitt[]
  gesamteinschaetzung: string
  ageLabel: string
  generatedAt: string
}

const BEREICH_EMOJI: Record<string, string> = {
  Soziales: '🤝',
  Sprache: '💬',
  Motorik: '🏃',
  Kognition: '🧠',
  Kognitiv: '🧠',
  Emotional: '❤️',
  Emotionales: '❤️',
  Kreativität: '🎨',
  Allgemein: '📝',
}

interface Props {
  childId: string
  childName: string
}

export default function Entwicklungsbericht({ childId, childName }: Props) {
  const [bericht, setBericht] = useState<Bericht | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/entwicklungsbericht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      const data = await res.json()
      if (!res.ok || !data.abschnitte) throw new Error('failed')
      setBericht(data)
      setOpen(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copyText() {
    if (!bericht) return
    const text = [
      bericht.titel,
      '',
      ...bericht.abschnitte.map(a => `${a.bereich}\n${a.inhalt}`),
      '',
      'Gesamteinschätzung:',
      bericht.gesamteinschaetzung,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => bericht ? setOpen(v => !v) : generate()}
        className="w-full flex items-center justify-between p-4"
        disabled={loading}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            {loading
              ? <Loader2 size={16} className="text-emerald-600 animate-spin" />
              : <BookOpen size={16} className="text-emerald-600" />}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-900">
              {loading ? 'KI erstellt Bericht…' : 'KI-Entwicklungsbericht'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {bericht
                ? `Erstellt ${format(new Date(bericht.generatedAt), 'd. MMM yyyy, HH:mm', { locale: de })}`
                : 'Strukturierter Bericht auf Basis der letzten 3 Monate'}
            </p>
          </div>
        </div>
        {bericht && (
          <ChevronRight size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
        )}
      </button>

      {error && (
        <div className="px-4 pb-3">
          <div className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 flex items-center justify-between">
            Fehler beim Erstellen.
            <button onClick={generate} className="underline">Nochmal</button>
          </div>
        </div>
      )}

      {bericht && open && (
        <div className="border-t border-gray-50">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-700">{bericht.titel}</p>
              {bericht.ageLabel && (
                <p className="text-[10px] text-emerald-600 mt-0.5">{childName} · {bericht.ageLabel}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={copyText}
                className="p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                title="Kopieren"
              >
                {copied
                  ? <Check size={13} className="text-emerald-600" />
                  : <Copy size={13} className="text-emerald-500" />}
              </button>
              <button
                onClick={generate}
                className="p-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                title="Neu generieren"
              >
                <RefreshCw size={13} className="text-emerald-500" />
              </button>
            </div>
          </div>

          {/* Sections */}
          <div className="p-4 space-y-3.5">
            {bericht.abschnitte.map((a, i) => (
              <div key={i}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{BEREICH_EMOJI[a.bereich] ?? '📝'}</span>
                  <p className="text-xs font-semibold text-gray-700">{a.bereich}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed pl-5">{a.inhalt}</p>
              </div>
            ))}

            {/* Overall */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mt-2">
              <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Gesamteinschätzung</p>
              <p className="text-xs text-gray-700 leading-relaxed">{bericht.gesamteinschaetzung}</p>
            </div>

            <p className="text-[10px] text-gray-400 pt-1">
              KI-generiert auf Basis der letzten 90 Tage · Bitte fachlich prüfen und ggf. anpassen
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
