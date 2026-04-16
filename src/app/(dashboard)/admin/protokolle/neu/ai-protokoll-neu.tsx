'use client'

import { useState } from 'react'
import { ClipboardList, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Hinweis { typ: 'struktur' | 'inhalt' | 'formulierung' | 'tipp'; text: string }
interface Result { hinweise: Hinweis[] }

const TYP_CONFIG = {
  struktur:    { dot: 'bg-violet-500', bg: 'bg-violet-50', text: 'text-violet-800' },
  inhalt:      { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-800'   },
  formulierung:{ dot: 'bg-teal-500',   bg: 'bg-teal-50',   text: 'text-teal-800'   },
  tipp:        { dot: 'bg-gray-400',   bg: 'bg-gray-50',   text: 'text-gray-700'   },
}

export default function AiProtokollNeu() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)

  async function laden() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/protokoll-hilfe')
      const data = await res.json()
      setResult(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' }}>
            <ClipboardList size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">KI-Schreibhilfe · Protokoll</p>
            <p className="text-[10px] text-gray-400">Struktur und Formulierungen für Sitzungsprotokolle</p>
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
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' }}>
                Protokoll-Hilfe anzeigen
              </button>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 size={14} className="animate-spin text-violet-500" />
                <span className="text-xs text-gray-500">Lade Schreibhilfe…</span>
              </div>
            )}
            {result && (
              <div className="space-y-2">
                {result.hinweise.map((h, i) => {
                  const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.tipp
                  return (
                    <div key={i} className={`flex gap-2 items-start p-2.5 rounded-xl ${cfg.bg}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <p className={`text-xs leading-relaxed ${cfg.text}`}>{h.text}</p>
                    </div>
                  )
                })}
                <p className="text-[10px] text-gray-300 pt-1">KI-Schreibhilfe · Protokoll-Best-Practices</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
