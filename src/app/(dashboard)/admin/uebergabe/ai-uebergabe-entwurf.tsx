'use client'

import { useState } from 'react'
import { ArrowLeftRight, Sparkles, Loader2, Copy, Check, RotateCcw } from 'lucide-react'

type Shift = 'morning' | 'midday' | 'afternoon'

const SHIFT_OPTIONS: { value: Shift; label: string; zeit: string; emoji: string }[] = [
  { value: 'morning',   label: 'Frühdienst',    zeit: 'bis 12:00',    emoji: '🌅' },
  { value: 'midday',    label: 'Mittagsdienst', zeit: '12:00–15:00',  emoji: '☀️' },
  { value: 'afternoon', label: 'Spätdienst',    zeit: 'ab 15:00',     emoji: '🌇' },
]

export default function AiUebergabeEntwurf() {
  const [open, setOpen] = useState(false)
  const [shift, setShift] = useState<Shift>('morning')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/uebergabe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift }),
      })
      const data = await res.json()
      if (!res.ok || !data.text) throw new Error('failed')
      setResult(data.text)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!result) return
    navigator.clipboard.writeText(result).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentShift = SHIFT_OPTIONS.find(s => s.value === shift)!

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #14b8a6, #3b82f6)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <ArrowLeftRight size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Übergabenotiz</p>
          <p className="text-xs text-white/70 mt-0.5">Automatisch aus heutigen Daten generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #14b8a6, #3b82f6)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #3b82f6)' }}>
              <ArrowLeftRight size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Übergabenotiz</p>
              <p className="text-[10px] text-gray-400">Anwesenheit · Berichte · Vorfälle · Notizen</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {!result && (
            <>
              {/* Shift selector */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Dienst</label>
                <div className="mt-1 grid grid-cols-3 gap-1.5">
                  {SHIFT_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => setShift(opt.value)}
                      className={`py-2.5 px-2 rounded-xl text-center transition-colors ${
                        shift === opt.value ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={shift === opt.value ? { background: 'linear-gradient(135deg, #14b8a6, #3b82f6)' } : {}}>
                      <p className="text-base mb-0.5">{opt.emoji}</p>
                      <p className="text-[10px] font-semibold">{opt.label}</p>
                      <p className={`text-[9px] ${shift === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.zeit}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500">Fehler beim Generieren. Bitte nochmal versuchen.</p>}

              <button onClick={generate} disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #3b82f6)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere Übergabe…</>
                  : <><Sparkles size={12} /> {currentShift.emoji} Übergabe {currentShift.label} generieren</>
                }
              </button>
            </>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentShift.emoji}</span>
                <p className="text-xs font-semibold text-gray-700">{currentShift.label} · {currentShift.zeit}</p>
              </div>

              <div className="bg-teal-50 rounded-xl p-3.5">
                <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #14b8a6, #3b82f6)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Kopieren</>}
                </button>
                <button onClick={() => { setResult(null) }}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-generiert aus heutigen Kita-Daten · vor Weitergabe prüfen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
