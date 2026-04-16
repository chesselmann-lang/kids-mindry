'use client'

import { useState } from 'react'
import { GraduationCap, Sparkles, Loader2, Copy, Check, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Bericht {
  personalien: string
  sozialverhalten: string
  sprache: string
  motorik: string
  kognitive_entwicklung: string
  emotionale_entwicklung: string
  besonderheiten: string
  empfehlungen: string
  abschluss: string
}

interface GrundschulResult {
  bericht: Bericht
  schulfaehigkeit: 'gut' | 'bedingt' | 'foerderbedarf'
  staerken: string[]
  empfehlungen_schule: string[]
  childName: string
  childAge: number
}

const SCHULFAEHIGKEIT_CONFIG = {
  gut:          { label: 'Schulfähig',      color: 'text-green-700',  bg: 'bg-green-50',  icon: CheckCircle2 },
  bedingt:      { label: 'Bedingt bereit',  color: 'text-amber-700',  bg: 'bg-amber-50',  icon: AlertTriangle },
  foerderbedarf:{ label: 'Förderbedarf',    color: 'text-red-700',    bg: 'bg-red-50',    icon: AlertTriangle },
}

const BEREICHE: { key: keyof Bericht; label: string }[] = [
  { key: 'sozialverhalten',       label: 'Sozialverhalten' },
  { key: 'sprache',               label: 'Sprache & Kommunikation' },
  { key: 'motorik',               label: 'Motorik' },
  { key: 'kognitive_entwicklung', label: 'Kognitive Entwicklung' },
  { key: 'emotionale_entwicklung',label: 'Emotionale Entwicklung' },
  { key: 'besonderheiten',        label: 'Besonderheiten' },
  { key: 'empfehlungen',          label: 'Empfehlungen an die Schule' },
]

export default function AiGrundschulBericht({ childId }: { childId: string }) {
  const [result, setResult] = useState<GrundschulResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/grundschul-bericht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      const data = await res.json()
      if (!res.ok || !data.bericht) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!result) return
    const b = result.bericht
    const text = [
      `GRUNDSCHUL-ÜBERGANGSBERICHT`,
      `${result.childName} (${result.childAge} Jahre)`,
      `Schulfähigkeit: ${SCHULFAEHIGKEIT_CONFIG[result.schulfaehigkeit]?.label}`,
      '',
      ...BEREICHE.map(({ key, label }) => `${label}:\n${b[key]}`).join('\n\n'),
      '',
      `Stärken: ${result.staerken.join(' | ')}`,
      '',
      `Empfehlungen für die Grundschule:`,
      ...result.empfehlungen_schule.map(e => `• ${e}`),
      '',
      b.abschluss,
    ].join('\n')
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Grundschul-Übergangsbericht</p>
          <p className="text-xs text-white/70 mt-0.5">Schulübergangsbericht automatisch generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
              <GraduationCap size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Grundschul-Übergangsbericht</p>
              <p className="text-[10px] text-gray-400">Schulübergang · Entwicklungsstand · Empfehlungen</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {!result && (
            <>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-[10px] text-amber-700">
                  ⚠️ Dieser Bericht dient als Entwurf und muss vor der Weitergabe an die Grundschule von einer Fachkraft geprüft und unterzeichnet werden.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-500">
                  <AlertTriangle size={12} />
                  Fehler beim Generieren. Bitte nochmal versuchen.
                </div>
              )}

              <button onClick={generate} disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere Übergangsbericht…</>
                  : <><Sparkles size={12} /> Übergangsbericht generieren</>
                }
              </button>
            </>
          )}

          {result && (
            <div className="space-y-3">
              {/* Schulfähigkeit */}
              {(() => {
                const cfg = SCHULFAEHIGKEIT_CONFIG[result.schulfaehigkeit] ?? SCHULFAEHIGKEIT_CONFIG.gut
                const Icon = cfg.icon
                return (
                  <div className={`rounded-xl p-3 flex items-center gap-2 ${cfg.bg}`}>
                    <Icon size={14} className={cfg.color} />
                    <div>
                      <p className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</p>
                      <p className="text-[10px] text-gray-500">{result.childName} · {result.childAge} Jahre</p>
                    </div>
                  </div>
                )
              })()}

              {/* Bereiche */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {BEREICHE.map(({ key, label }) => (
                  <div key={key} className="border border-gray-100 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{result.bericht[key]}</p>
                  </div>
                ))}
              </div>

              {/* Stärken */}
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-green-700 mb-1.5">Stärken</p>
                <div className="space-y-1">
                  {result.staerken.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-green-500 text-xs">✓</span>
                      <p className="text-xs text-gray-700">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abschluss */}
              <p className="text-xs text-gray-500 italic text-center px-2">{result.bericht.abschluss}</p>

              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #059669, #0891b2)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Bericht kopieren</>}
                </button>
                <button onClick={() => setResult(null)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-Entwurf · muss vor Weitergabe geprüft und unterzeichnet werden</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
