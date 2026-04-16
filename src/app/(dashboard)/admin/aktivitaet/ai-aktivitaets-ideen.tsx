'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, ChevronDown, ChevronUp, Clock, Package } from 'lucide-react'

interface Idee {
  titel: string
  bereich: string
  dauer: string
  material: string
  beschreibung: string
}

const BEREICH_CONFIG: Record<string, { bg: string; text: string; emoji: string }> = {
  Motorik:     { bg: 'bg-blue-100',   text: 'text-blue-700',   emoji: '🏃' },
  Kreativität: { bg: 'bg-rose-100',   text: 'text-rose-700',   emoji: '🎨' },
  Sprache:     { bg: 'bg-green-100',  text: 'text-green-700',  emoji: '💬' },
  Natur:       { bg: 'bg-teal-100',   text: 'text-teal-700',   emoji: '🌿' },
  Soziales:    { bg: 'bg-purple-100', text: 'text-purple-700', emoji: '🤝' },
  Kognition:   { bg: 'bg-amber-100',  text: 'text-amber-700',  emoji: '🧠' },
}

const BEREICHE = [
  { value: '', label: 'Alle Bereiche' },
  { value: 'drinnen', label: '🏠 Drinnen' },
  { value: 'draussen', label: '🌳 Draußen' },
  { value: 'kreativ', label: '🎨 Kreativ' },
  { value: 'bewegung', label: '🏃 Bewegung' },
]

export default function AiAktivitaetsIdeen() {
  const [ideen, setIdeen] = useState<Idee[]>([])
  const [season, setSeason] = useState('')
  const [monthName, setMonthName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(true)
  const [bereich, setBereich] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/aktivitaets-ideen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bereich: bereich || undefined }),
      })
      const data = await res.json()
      if (!res.ok || !data.ideen) throw new Error('failed')
      setIdeen(data.ideen)
      setSeason(data.season ?? '')
      setMonthName(data.monthName ?? '')
      setLoaded(true)
      setOpen(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => loaded ? setOpen(v => !v) : generate()}
        className="w-full flex items-center justify-between p-4"
        disabled={loading}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center">
            {loading
              ? <Loader2 size={16} className="text-teal-600 animate-spin" />
              : <Sparkles size={16} className="text-teal-600" />}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-900">
              {loading ? 'KI denkt nach…' : 'KI-Aktivitäts-Ideen'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {loaded
                ? `${ideen.length} Ideen für ${season}/${monthName}`
                : 'Saisonale Aktivitätsvorschläge für eure Gruppe'}
            </p>
          </div>
        </div>
        {loaded && (
          open
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {error && (
        <div className="px-4 pb-3">
          <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">
            Fehler. <button onClick={generate} className="underline">Nochmal</button>
          </p>
        </div>
      )}

      {!loaded && !loading && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <div className="flex gap-2 flex-wrap">
            {BEREICHE.map(b => (
              <button
                key={b.value}
                onClick={() => setBereich(b.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  bereich === b.value
                    ? 'bg-teal-100 text-teal-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <button
            onClick={generate}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Sparkles size={14} /> Ideen generieren
          </button>
        </div>
      )}

      {loaded && open && (
        <div className="border-t border-gray-50">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-teal-50 to-green-50">
            <span className="text-xs text-teal-700 font-semibold">{season} · {monthName}</span>
            <button onClick={generate} aria-label="Neue Ideen generieren" className="p-1 rounded-lg hover:bg-teal-100 transition-colors">
              <RefreshCw size={12} className="text-teal-500" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            {ideen.map((idee, i) => {
              const cfg = BEREICH_CONFIG[idee.bereich] ?? { bg: 'bg-gray-100', text: 'text-gray-700', emoji: '📝' }
              const isOpen = expanded === i
              return (
                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-base flex-shrink-0">{cfg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{idee.titel}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>
                          {idee.bereich}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={9} /> {idee.dauer}
                        </span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={13} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 bg-gray-50 border-t border-gray-100 space-y-2">
                      <p className="text-xs text-gray-700 leading-relaxed pt-2">{idee.beschreibung}</p>
                      {idee.material && idee.material !== '–' && (
                        <div className="flex items-start gap-1.5">
                          <Package size={11} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-[11px] text-gray-500">{idee.material}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            <p className="text-[10px] text-gray-400 pt-1 px-1">KI-generiert · saisonal angepasst · bitte eigenständig prüfen</p>
          </div>
        </div>
      )}
    </div>
  )
}
