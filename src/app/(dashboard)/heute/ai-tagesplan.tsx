'use client'

import { useState } from 'react'
import { CalendarDays, Sparkles, Loader2, Copy, Check, RotateCcw, ChevronDown, Clock } from 'lucide-react'

type Altersgruppe = 'krippe' | 'kiga' | 'gemischt' | 'hort'
type Schwerpunkt = 'bewegung' | 'kreativ' | 'sprache' | 'natur' | 'sozial' | 'kognitiv'

interface Phase {
  zeit: string
  titel: string
  beschreibung: string
  material: string
  tipp: string
}

interface TagesplanResult {
  motto: string
  einleitung: string
  phasen: Phase[]
  materialien_gesamt: string[]
  paedagogisches_ziel: string
  wetter_alternative: string
  dayLabel: string
  saison: string
}

const ALTERSGRUPPEN: { value: Altersgruppe; label: string; emoji: string }[] = [
  { value: 'krippe',   label: 'Krippe',     emoji: '🍼' },
  { value: 'kiga',     label: 'Kindergarten',emoji: '🏠' },
  { value: 'gemischt', label: 'Gemischt',   emoji: '👶' },
  { value: 'hort',     label: 'Hort',       emoji: '📚' },
]

const SCHWERPUNKTE: { value: Schwerpunkt; label: string; emoji: string }[] = [
  { value: 'kreativ',  label: 'Kreativität', emoji: '🎨' },
  { value: 'bewegung', label: 'Bewegung',    emoji: '🏃' },
  { value: 'sprache',  label: 'Sprache',     emoji: '💬' },
  { value: 'natur',    label: 'Natur',       emoji: '🌿' },
  { value: 'sozial',   label: 'Sozial',      emoji: '🤝' },
  { value: 'kognitiv', label: 'Kognitiv',    emoji: '🧠' },
]

export default function AiTagesplan() {
  const [open, setOpen] = useState(false)
  const [altersgruppe, setAltersgruppe] = useState<Altersgruppe>('kiga')
  const [schwerpunkt, setSchwerpunkt] = useState<Schwerpunkt>('kreativ')
  const [notizen, setNotizen] = useState('')
  const [result, setResult] = useState<TagesplanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/tagesplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altersgruppe, schwerpunkt, notizen }),
      })
      const data = await res.json()
      if (!res.ok || !data.phasen) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!result) return
    const text = [
      `📅 ${result.dayLabel}`,
      `🎯 ${result.motto}`,
      '',
      result.einleitung,
      '',
      '— TAGESPLAN —',
      ...result.phasen.map(p => `${p.zeit} | ${p.titel}\n${p.beschreibung}`),
      '',
      `🎯 Pädagogisches Ziel: ${result.paedagogisches_ziel}`,
      `📦 Material: ${result.materialien_gesamt.join(', ')}`,
      `🌧️ Bei schlechtem Wetter: ${result.wetter_alternative}`,
    ].join('\n')
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #10b981, #0891b2)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <CalendarDays size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Tagesplan</p>
          <p className="text-xs text-white/70 mt-0.5">Vollständigen Tagesplan generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981, #0891b2)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #0891b2)' }}>
              <CalendarDays size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Tagesplan</p>
              <p className="text-[10px] text-gray-400">Aktivitäten · Zeiten · Materialien</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {!result && (
            <>
              {/* Altersgruppe */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Gruppe</label>
                <div className="mt-1 grid grid-cols-4 gap-1">
                  {ALTERSGRUPPEN.map(opt => (
                    <button key={opt.value} onClick={() => setAltersgruppe(opt.value)}
                      className={`py-2 rounded-xl text-center transition-colors ${altersgruppe === opt.value ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      style={altersgruppe === opt.value ? { background: 'linear-gradient(135deg, #10b981, #0891b2)' } : {}}>
                      <p className="text-sm">{opt.emoji}</p>
                      <p className="text-[9px] font-semibold mt-0.5">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schwerpunkt */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Schwerpunkt</label>
                <div className="mt-1 grid grid-cols-3 gap-1">
                  {SCHWERPUNKTE.map(opt => (
                    <button key={opt.value} onClick={() => setSchwerpunkt(opt.value)}
                      className={`py-2 rounded-xl text-center transition-colors ${schwerpunkt === opt.value ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      style={schwerpunkt === opt.value ? { background: 'linear-gradient(135deg, #10b981, #0891b2)' } : {}}>
                      <p className="text-sm">{opt.emoji}</p>
                      <p className="text-[9px] font-semibold mt-0.5">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hinweise */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Besondere Hinweise (optional)</label>
                <textarea
                  value={notizen}
                  onChange={e => setNotizen(e.target.value)}
                  placeholder="z.B. Ausflug geplant, Geburtstagskind, wenig Personal…"
                  rows={2}
                  className="mt-1 w-full text-xs px-3 py-2 rounded-xl bg-gray-100 border-0 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>

              {error && <p className="text-xs text-red-500">Fehler beim Generieren. Bitte nochmal versuchen.</p>}

              <button onClick={generate} disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10b981, #0891b2)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere Tagesplan…</>
                  : <><Sparkles size={12} /> Tagesplan für heute generieren</>
                }
              </button>
            </>
          )}

          {result && (
            <div className="space-y-3">
              {/* Motto */}
              <div className="text-center py-2">
                <p className="text-xs text-gray-400">{result.dayLabel}</p>
                <p className="text-sm font-bold text-gray-800 mt-1">🎯 {result.motto}</p>
                <p className="text-xs text-gray-500 mt-1 italic">{result.einleitung}</p>
              </div>

              {/* Phasen */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {result.phasen.map((phase, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Clock size={10} />
                        <span className="text-[10px] font-bold">{phase.zeit}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-800">{phase.titel}</p>
                    </div>
                    <p className="text-xs text-gray-600">{phase.beschreibung}</p>
                    {phase.material && (
                      <p className="text-[10px] text-gray-400 mt-1">📦 {phase.material}</p>
                    )}
                    {phase.tipp && (
                      <p className="text-[10px] text-emerald-600 mt-0.5 italic">💡 {phase.tipp}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer-Infos */}
              <div className="bg-emerald-50 rounded-xl p-3 space-y-1.5">
                <p className="text-[10px] font-bold text-emerald-700">Pädagogisches Ziel</p>
                <p className="text-xs text-gray-700">{result.paedagogisches_ziel}</p>
                <div className="border-t border-emerald-100 pt-1.5 mt-1.5">
                  <p className="text-[10px] text-gray-500">📦 Materialien: {result.materialien_gesamt.join(', ')}</p>
                </div>
                {result.wetter_alternative && (
                  <p className="text-[10px] text-gray-500">🌧️ Bei Regen: {result.wetter_alternative}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #10b981, #0891b2)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Tagesplan kopieren</>}
                </button>
                <button onClick={() => setResult(null)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-Tagesplan · {new Date().toLocaleDateString('de-DE')} · vor Nutzung prüfen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
