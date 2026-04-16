'use client'

import { useState } from 'react'
import { FileText, Sparkles, Loader2, Copy, Check, RotateCcw, Plus, X } from 'lucide-react'

const TYP_OPTIONS = ['Elternabend', 'Dienstbesprechung', 'Trägerkonferenz', 'Ausschusssitzung', 'Sonstiges']

export default function AiProtokollEntwurf() {
  const [open, setOpen] = useState(false)
  const [titel, setTitel] = useState('')
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0])
  const [typ, setTyp] = useState('Elternabend')
  const [agendapunkte, setAgendapunkte] = useState<string[]>([''])
  const [result, setResult] = useState<{ inhalt: string; datumFormatted: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  function addAgendapunkt() {
    setAgendapunkte(a => [...a, ''])
  }

  function removeAgendapunkt(i: number) {
    setAgendapunkte(a => a.filter((_, idx) => idx !== i))
  }

  function updateAgendapunkt(i: number, val: string) {
    setAgendapunkte(a => a.map((item, idx) => idx === i ? val : item))
  }

  async function generate() {
    const filledAgenda = agendapunkte.filter(a => a.trim())
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/protokoll-entwurf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titel: titel.trim() || typ,
          meetingDate,
          typ,
          agendapunkte: filledAgenda,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.inhalt) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!result) return
    navigator.clipboard.writeText(result.inhalt).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Render markdown-like protocol text
  function renderInhalt(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <p key={i} className="text-xs font-bold text-gray-900 mt-3 mb-1">{line.slice(3)}</p>
      if (line.startsWith('# '))  return <p key={i} className="text-sm font-bold text-gray-900 mb-1">{line.slice(2)}</p>
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="text-xs font-semibold text-gray-800 mt-2">{line.slice(2, -2)}</p>
      if (line.startsWith('- ')) return <p key={i} className="text-xs text-gray-700 ml-3">• {line.slice(2)}</p>
      if (line.trim() === '') return <div key={i} className="h-1" />
      return <p key={i} className="text-xs text-gray-700 leading-relaxed">{line}</p>
    })
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <FileText size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Protokollentwurf</p>
          <p className="text-xs text-white/70 mt-0.5">Vollständiges Protokoll automatisch erstellen</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
              <FileText size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Protokollentwurf</p>
              <p className="text-[10px] text-gray-400">Protokoll aus Agenda automatisch generieren</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {!result && (
            <>
              {/* Typ */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sitzungsart</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {TYP_OPTIONS.map(t => (
                    <button key={t} onClick={() => setTyp(t)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                        typ === t ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={typ === t ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)' } : {}}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Titel + Datum */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Thema (optional)</label>
                  <input value={titel} onChange={e => setTitel(e.target.value)}
                    placeholder={typ}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Datum</label>
                  <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>

              {/* Agendapunkte */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Agendapunkte</label>
                <div className="mt-1 space-y-1.5">
                  {agendapunkte.map((punkt, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <span className="text-[10px] text-gray-400 w-4 text-right flex-shrink-0">{i + 1}.</span>
                      <input value={punkt} onChange={e => updateAgendapunkt(i, e.target.value)}
                        placeholder={`Agendapunkt ${i + 1}…`}
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      {agendapunkte.length > 1 && (
                        <button onClick={() => removeAgendapunkt(i)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addAgendapunkt}
                    className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors mt-1">
                    <Plus size={11} /> Punkt hinzufügen
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-red-500">Fehler beim Generieren. Bitte nochmal versuchen.</p>}

              <button onClick={generate} disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Erstelle Protokollentwurf…</>
                  : <><Sparkles size={12} /> Protokollentwurf generieren</>
                }
              </button>
            </>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">{typ} · {result.datumFormatted}</p>
              </div>

              <div className="bg-indigo-50 rounded-xl p-3.5 max-h-80 overflow-y-auto">
                {renderInhalt(result.inhalt)}
              </div>

              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Kopieren</>}
                </button>
                <button onClick={() => { setResult(null) }}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-Entwurf · Inhalte prüfen und ergänzen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
