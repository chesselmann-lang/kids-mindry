'use client'

import { useState } from 'react'
import { PenLine, Sparkles, Loader2, Copy, Check, RotateCcw } from 'lucide-react'

type Ton = 'informell' | 'formell' | 'dringend'

const TON_OPTIONS: { value: Ton; label: string; desc: string }[] = [
  { value: 'informell', label: 'Herzlich',  desc: 'Warm & persönlich'   },
  { value: 'formell',   label: 'Formell',   desc: 'Sachlich & professionell' },
  { value: 'dringend',  label: 'Dringend',  desc: 'Klar & direkt'      },
]

export default function AiElternNachricht() {
  const [open, setOpen] = useState(false)
  const [thema, setThema] = useState('')
  const [ton, setTon] = useState<Ton>('informell')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    if (!thema.trim()) return
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/eltern-nachricht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thema: thema.trim(), tonalitaet: ton }),
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

  function reset() {
    setResult(null)
    setThema('')
    setError(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <PenLine size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Elternnachricht</p>
          <p className="text-xs text-white/70 mt-0.5">Nachrichtenentwurf für Eltern generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
              <PenLine size={14} className="text-white" />
            </div>
            <p className="text-xs font-semibold text-gray-800">KI-Elternnachricht</p>
          </div>
          <button onClick={() => setOpen(false)} className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Topic input */}
          {!result && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Thema / Anlass</label>
                <textarea
                  rows={2}
                  value={thema}
                  onChange={e => setThema(e.target.value)}
                  placeholder="z. B. Ausflug nächsten Freitag, Bitte Gummistiefel mitbringen…"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>

              {/* Tone selector */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Tonalität</label>
                <div className="mt-1 grid grid-cols-3 gap-1">
                  {TON_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => setTon(opt.value)}
                      className={`py-2 px-2 rounded-xl text-center transition-colors ${
                        ton === opt.value
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={ton === opt.value ? { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' } : {}}>
                      <p className="text-[10px] font-semibold">{opt.label}</p>
                      <p className={`text-[9px] mt-0.5 ${ton === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500">Fehler beim Generieren. Bitte nochmal versuchen.</p>}

              <button onClick={generate} disabled={loading || !thema.trim()}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere…</>
                  : <><Sparkles size={12} /> Nachricht generieren</>
                }
              </button>
            </>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="bg-violet-50 rounded-xl p-3">
                <p className="text-xs text-violet-900 leading-relaxed whitespace-pre-wrap">{result}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Kopieren</>}
                </button>
                <button onClick={reset}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-Entwurf · vor dem Senden prüfen und anpassen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
