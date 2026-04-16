'use client'

import { useState } from 'react'
import { Newspaper, Sparkles, Loader2, Copy, Check, RotateCcw, ChevronDown } from 'lucide-react'

interface Group { id: string; name: string; color?: string }

export default function AiGruppenNewsletter({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false)
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '')
  const [weekOffset, setWeekOffset] = useState(1)
  const [result, setResult] = useState<{ text: string; weekLabel: string; groupName: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  const selectedGroup = groups.find(g => g.id === groupId)

  async function generate() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/gruppen-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, weekOffset }),
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

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Newspaper size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Gruppen-Wochenbrief</p>
          <p className="text-xs text-white/70 mt-0.5">Elternbrief automatisch generieren</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
              <Newspaper size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Gruppen-Wochenbrief</p>
              <p className="text-[10px] text-gray-400">Wochenrückblick für Eltern</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {!result && (
            <>
              {/* Gruppe auswählen */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Gruppe</label>
                <div className="mt-1 relative">
                  <select
                    value={groupId}
                    onChange={e => setGroupId(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 pr-8 rounded-xl bg-gray-100 border-0 text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Woche */}
              <div>
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Woche</label>
                <div className="mt-1 grid grid-cols-2 gap-1.5">
                  {[
                    { value: 1, label: 'Letzte Woche' },
                    { value: 2, label: 'Vorletzte Woche' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setWeekOffset(opt.value)}
                      className={`py-2 px-3 rounded-xl text-[11px] font-semibold transition-colors ${
                        weekOffset === opt.value ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={weekOffset === opt.value ? { background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs text-red-500">Fehler beim Generieren. Bitte nochmal versuchen.</p>}

              <button onClick={generate} disabled={loading || !groupId}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                {loading
                  ? <><Loader2 size={12} className="animate-spin" /> Generiere Wochenbrief…</>
                  : <><Sparkles size={12} /> Wochenbrief für {selectedGroup?.name ?? 'Gruppe'} generieren</>
                }
              </button>
            </>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-sky-500" />
                <p className="text-xs font-semibold text-gray-700">{result.groupName} · {result.weekLabel}</p>
              </div>

              <div className="bg-sky-50 rounded-xl p-3.5">
                <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{result.text}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={copy}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                  {copied ? <><Check size={12} /> Kopiert</> : <><Copy size={12} /> Kopieren</>}
                </button>
                <button onClick={() => setResult(null)}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Neu
                </button>
              </div>
              <p className="text-[9px] text-gray-400">KI-generiert · vor Versand an Eltern prüfen und anpassen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
