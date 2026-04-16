'use client'

import { useState } from 'react'
import { BookOpen, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Hinweis { typ: 'methodik' | 'tipp' | 'info'; text: string }
interface Result { hinweise: Hinweis[] }

const TYP_CONFIG = {
  methodik: { dot: 'bg-violet-500', bg: 'bg-violet-50',  text: 'text-violet-800' },
  tipp:     { dot: 'bg-blue-500',   bg: 'bg-blue-50',    text: 'text-blue-800'   },
  info:     { dot: 'bg-gray-400',   bg: 'bg-gray-50',    text: 'text-gray-700'   },
}

export default function AiSismik() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)

  async function erklären() {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/sismik-anleitung')
      const data = await res.json()
      setResult(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}>
            <BookOpen size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">KI-Assistent · SISMIK-Anleitung</p>
            <p className="text-[10px] text-gray-400">Sprachbeobachtung methodisch korrekt durchführen</p>
          </div>
          {result && (
            <button onClick={() => setOpen(o => !o)} aria-label="KI-Analyse ein-/ausblenden" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              {open ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
          )}
        </div>

        {open && (
          <div className="px-4 pb-3">
            {!result && !loading && (
              <button onClick={erklären}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)' }}>
                SISMIK-Anleitung anzeigen
              </button>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 size={14} className="animate-spin text-violet-500" />
                <span className="text-xs text-gray-500">Lade Anleitung…</span>
              </div>
            )}
            {result && (
              <div className="space-y-2">
                {result.hinweise.map((h, i) => {
                  const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
                  return (
                    <div key={i} className={`flex gap-2 items-start p-2.5 rounded-xl ${cfg.bg}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <p className={`text-xs leading-relaxed ${cfg.text}`}>{h.text}</p>
                    </div>
                  )
                })}
                <p className="text-[10px] text-gray-300 pt-1">KI-Pädagogik · vereinfachte SISMIK-Anleitung</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
