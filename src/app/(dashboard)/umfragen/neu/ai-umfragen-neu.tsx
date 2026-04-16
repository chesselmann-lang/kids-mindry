'use client'

import { useState } from 'react'
import { BarChart2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Vorschlag { typ: 'zufriedenheit' | 'ernaehrung' | 'programm' | 'kommunikation' | 'sicherheit'; text: string; fragenbeispiel: string }
interface Result { vorschlaege: Vorschlag[] }

const TYP_CONFIG = {
  zufriedenheit: { dot: 'bg-brand-500', bg: 'bg-brand-50', text: 'text-brand-800' },
  ernaehrung:    { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-800' },
  programm:      { dot: 'bg-violet-500',bg: 'bg-violet-50',text: 'text-violet-800'},
  kommunikation: { dot: 'bg-blue-500',  bg: 'bg-blue-50',  text: 'text-blue-800'  },
  sicherheit:    { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-800' },
}

export default function AiUmfragenNeu() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)

  async function laden() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/umfragen-vorschlaege')
      const data = await res.json()
      setResult(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}>
            <BarChart2 size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">KI-Ideen · Umfrage erstellen</p>
            <p className="text-[10px] text-gray-400">Themenvorschläge und Fragenbeispiele</p>
          </div>
          {result && (
            <button onClick={() => setOpen(o => !o)} aria-label="KI-Analyse ein-/ausblenden" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
            </button>
          )}
        </div>

        {open && (
          <div className="px-4 pb-3">
            {!result && !loading && (
              <button onClick={laden}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}>
                Umfrage-Ideen anzeigen
              </button>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 size={14} className="animate-spin text-violet-500" />
                <span className="text-xs text-gray-500">Lade Ideen…</span>
              </div>
            )}
            {result && (
              <div className="space-y-2">
                {result.vorschlaege.map((v, i) => {
                  const cfg = TYP_CONFIG[v.typ] ?? TYP_CONFIG.zufriedenheit
                  return (
                    <div key={i} className={`p-2.5 rounded-xl ${cfg.bg}`}>
                      <div className="flex gap-2 items-start">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                        <div>
                          <p className={`text-xs font-semibold ${cfg.text}`}>{v.text}</p>
                          <p className={`text-[11px] mt-0.5 opacity-80 ${cfg.text}`}>z.B.: {v.fragenbeispiel}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <p className="text-[10px] text-gray-300 pt-1">KI-Ideen · Umfragen sinnvoll gestalten</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
