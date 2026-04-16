'use client'

import { useState } from 'react'
import { Mail, Sparkles, Loader2, Copy, Check, RotateCcw } from 'lucide-react'
import { format, subMonths } from 'date-fns'
import { de } from 'date-fns/locale'

function getDefaultMonth() {
  return format(subMonths(new Date(), 1), 'yyyy-MM')
}

export default function AiMonatsbrief() {
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(getDefaultMonth)
  const [result, setResult] = useState<{ text: string; monthLabel: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/monatsbrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      })
      const data = await res.json()
      if (!res.ok || !data.text) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    if (!result) return
    navigator.clipboard.writeText(result.text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const monthLabel = (() => {
    try { return format(new Date(month + '-01T12:00:00'), 'MMMM yyyy', { locale: de }) }
    catch { return month }
  })()

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Mail size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Monatsbrief</p>
          <p className="text-xs text-white/70 mt-0.5">Elternbrief aus Monatsdaten generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}>
              <Mail size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Monatsbrief</p>
              <p className="text-[10px] text-gray-400">Aus Veranstaltungen, Beobachtungen & Meilensteinen</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Month picker */}
          {!result && (
            <>
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Monat</label>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              {error && <p className="text-xs text-red-500">Fehler beim Generieren. Bitte nochmal versuchen.</p>}
              <button onClick={generate} disabled={loading || !month}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere Monatsbrief…</>
                  : <><Sparkles size={12} /> Monatsbrief für {monthLabel} generieren</>
                }
              </button>
            </>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-700">Monatsbrief {result.monthLabel}</p>
              </div>

              <div className="bg-sky-50 rounded-xl p-3.5">
                <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{result.text}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Kopieren</>}
                </button>
                <button onClick={() => { setResult(null) }}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-Entwurf · Liebe Eltern-Anrede vor dem Versenden ergänzen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
