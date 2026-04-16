'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

interface Tipp {
  titel: string
  tipp: string
  prioritaet: 'hoch' | 'mittel' | 'niedrig'
}

const PRIO_CONFIG = {
  hoch:     { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-100',   dot: 'bg-rose-500' },
  mittel:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-100',  dot: 'bg-amber-500' },
  niedrig:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100',   dot: 'bg-blue-400' },
}

interface Props {
  processId: string
  childName: string
  phase: number
}

export default function AiEingewoehnungTipps({ processId, childName, phase }: Props) {
  const [tipps, setTipps] = useState<Tipp[] | null>(null)
  const [phaseDesc, setPhaseDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/eingewoehnung-tipps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processId }),
      })
      const data = await res.json()
      if (!res.ok || !data.tipps) throw new Error('failed')
      setTipps(data.tipps)
      setPhaseDesc(data.phaseDesc ?? '')
      setOpen(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-2 rounded-xl border border-violet-100 overflow-hidden">
      <button
        onClick={() => tipps ? setOpen(v => !v) : load()}
        disabled={loading}
        className="w-full flex items-center justify-between px-3 py-2 bg-violet-50 hover:bg-violet-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {loading
            ? <Loader2 size={13} className="text-violet-500 animate-spin" />
            : <Sparkles size={13} className="text-violet-500" />}
          <span className="text-xs font-semibold text-violet-700">
            {loading ? 'KI analysiert…' : 'KI-Tipps für Phase ' + phase}
          </span>
        </div>
        {tipps && (open ? <ChevronUp size={12} className="text-violet-400" /> : <ChevronDown size={12} className="text-violet-400" />)}
      </button>

      {error && (
        <div className="px-3 py-2 bg-red-50 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle size={12} />
          Fehler. <button onClick={load} className="underline">Nochmal</button>
        </div>
      )}

      {tipps && open && (
        <div className="p-3 space-y-2 bg-white">
          {phaseDesc && (
            <p className="text-[10px] text-violet-600 font-medium mb-2">{phaseDesc}</p>
          )}
          {tipps.map((t, i) => {
            const cfg = PRIO_CONFIG[t.prioritaet] ?? PRIO_CONFIG.mittel
            return (
              <div key={i} className={`rounded-xl p-2.5 border ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                  <p className={`text-[11px] font-semibold ${cfg.text}`}>{t.titel}</p>
                </div>
                <p className="text-xs text-gray-700 pl-3 leading-relaxed">{t.tipp}</p>
              </div>
            )
          })}
          <p className="text-[10px] text-gray-400 pt-1">KI-generiert für {childName} · Phase {phase}</p>
        </div>
      )}
    </div>
  )
}
