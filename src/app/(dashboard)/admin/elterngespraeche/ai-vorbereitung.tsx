'use client'

import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, TrendingUp, Heart, Calendar, Star, AlertCircle, ChevronRight } from 'lucide-react'

interface Punkt {
  kategorie: string
  titel: string
  text: string
  positiv: boolean
}

const KATEGORIE_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Entwicklung:      { color: 'text-brand-700',  bg: 'bg-brand-50',  border: 'border-brand-200' },
  Soziales:         { color: 'text-green-700',   bg: 'bg-green-50',  border: 'border-green-200' },
  Gesundheit:       { color: 'text-rose-700',    bg: 'bg-rose-50',   border: 'border-rose-200' },
  Anwesenheit:      { color: 'text-amber-700',   bg: 'bg-amber-50',  border: 'border-amber-200' },
  Besonderes:       { color: 'text-violet-700',  bg: 'bg-violet-50', border: 'border-violet-200' },
  'Nächste Schritte':{ color: 'text-teal-700',   bg: 'bg-teal-50',   border: 'border-teal-200' },
}

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
}

export default function AiVorbereitung({ children }: Props) {
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [loading, setLoading] = useState(false)
  const [punkte, setPunkte] = useState<Punkt[] | null>(null)
  const [error, setError] = useState(false)

  async function generate() {
    if (!childId) return
    setLoading(true)
    setError(false)
    setPunkte(null)
    try {
      const res = await fetch('/api/ai/elterngespraech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      const data = await res.json()
      if (!res.ok || !data.punkte) throw new Error('failed')
      setPunkte(data.punkte)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const selectedChild = children.find(c => c.id === childId)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-brand-100 flex items-center justify-center">
            <Sparkles size={16} className="text-violet-600" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm text-gray-900">KI-Gesprächsvorbereitung</span>
            <p className="text-[11px] text-gray-400 mt-0.5">Automatische Gesprächspunkte aus Kita-Daten</p>
          </div>
        </div>
        <ChevronRight size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 space-y-4">
          <div className="pt-3 flex gap-3">
            <select
              className="input-field flex-1"
              value={childId}
              onChange={e => { setChildId(e.target.value); setPunkte(null) }}
            >
              <option value="">Kind auswählen…</option>
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
            <button
              onClick={generate}
              disabled={!childId || loading}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Analysiere…</>
                : <><Sparkles size={14} /> Vorbereiten</>
              }
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle size={14} />
              Fehler beim Laden der KI-Analyse. Bitte erneut versuchen.
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 py-4 text-gray-400 text-sm">
              <Loader2 size={16} className="animate-spin text-violet-500" />
              KI analysiert Daten für {selectedChild?.first_name}…
            </div>
          )}

          {punkte && punkte.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {punkte.length} Gesprächspunkte für {selectedChild?.first_name} {selectedChild?.last_name}
              </p>
              {punkte.map((p, idx) => {
                const cfg = KATEGORIE_CONFIG[p.kategorie] ?? KATEGORIE_CONFIG['Besonderes']
                return (
                  <div key={idx} className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-start gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border} flex-shrink-0`}>
                        {p.kategorie}
                      </span>
                      {p.positiv && <CheckCircle2 size={12} className="text-green-500 flex-shrink-0 mt-0.5" />}
                    </div>
                    <p className={`text-sm font-semibold mt-1.5 ${cfg.color}`}>{p.titel}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{p.text}</p>
                  </div>
                )
              })}
              <p className="text-[10px] text-gray-400 pt-1">
                KI-generiert auf Basis der letzten 30 Tage · Bitte eigenständig prüfen
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
