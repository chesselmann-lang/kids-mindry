'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Plus, Calendar } from 'lucide-react'

interface Idee {
  monat: number
  titel: string
  typ: string
  beschreibung: string
}

const MONAT_KURZ = ['', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

const TYP_CONFIG: Record<string, { bg: string; text: string; emoji: string }> = {
  Fest:     { bg: 'bg-amber-100',  text: 'text-amber-700',  emoji: '🎉' },
  Projekt:  { bg: 'bg-teal-100',   text: 'text-teal-700',   emoji: '🎨' },
  Ausflug:  { bg: 'bg-blue-100',   text: 'text-blue-700',   emoji: '🚌' },
  Eltern:   { bg: 'bg-violet-100', text: 'text-violet-700', emoji: '👨‍👩‍👧' },
  Sport:    { bg: 'bg-green-100',  text: 'text-green-700',  emoji: '⚽' },
  Thema:    { bg: 'bg-rose-100',   text: 'text-rose-700',   emoji: '🌟' },
}

interface Props {
  year: number
  onAddIdee?: (idee: Idee) => void
}

export default function AiJahresplanungIdeen({ year, onAddIdee }: Props) {
  const [ideen, setIdeen] = useState<Idee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(true)
  const [added, setAdded] = useState<Set<number>>(new Set())

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/jahresplanung-ideen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year }),
      })
      const data = await res.json()
      if (!res.ok || !data.ideen) throw new Error('failed')
      setIdeen(data.ideen)
      setLoaded(true)
      setOpen(true)
      setAdded(new Set())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!loaded && !loading) {
    return (
      <button
        onClick={generate}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-amber-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Ideen für {year}</p>
          <p className="text-xs text-gray-400 mt-0.5">Fehlende Termine und Projekte vorschlagen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-amber-500" />
        <span className="text-sm">KI generiert Ideen für {year}…</span>
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

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">KI-Ideen für {year} · {ideen.length - added.size} verbleibend</span>
        </div>
        <button onClick={generate} aria-label="Neu generieren" className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors">
          <RefreshCw size={13} className="text-amber-500" />
        </button>
      </div>

      {open && (
        <div className="p-3 space-y-2">
          {ideen.map((idee, i) => {
            if (added.has(i)) return null
            const cfg = TYP_CONFIG[idee.typ] ?? TYP_CONFIG.Thema
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex flex-col items-center justify-center flex-shrink-0 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400">{MONAT_KURZ[idee.monat]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm">{cfg.emoji}</span>
                    <p className="text-sm font-semibold text-gray-900 truncate">{idee.titel}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text} flex-shrink-0`}>
                      {idee.typ}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pl-5 leading-relaxed">{idee.beschreibung}</p>
                </div>
                {onAddIdee && (
                  <button
                    onClick={() => {
                      onAddIdee(idee)
                      setAdded(prev => new Set([...prev, i]))
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-200 transition-colors flex-shrink-0"
                  >
                    <Plus size={11} /> Übernehmen
                  </button>
                )}
              </div>
            )
          })}
          {added.size === ideen.length && ideen.length > 0 && (
            <p className="text-xs text-center text-gray-400 py-2">Alle Ideen übernommen 🎉</p>
          )}
          <p className="text-[10px] text-gray-400 px-1 pt-1">KI-generiert · Ideen als Inspiration nutzen</p>
        </div>
      )}
    </div>
  )
}
