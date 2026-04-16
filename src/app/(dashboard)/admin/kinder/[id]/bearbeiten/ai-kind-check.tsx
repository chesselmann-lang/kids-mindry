'use client'

import { useState } from 'react'
import { ClipboardCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Hinweis { typ: 'vollstaendig' | 'fehlt' | 'tipp'; text: string }
interface Result { hinweise: Hinweis[]; stats: { completenessPercent: number; hasGroup: boolean; hasDOB: boolean; hasEmergency: boolean; hasDoctor: boolean } }

const TYP_CONFIG = {
  vollstaendig: { dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-800'  },
  fehlt:        { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-800'    },
  tipp:         { dot: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-800'  },
}

export default function AiKindCheck({ childId }: { childId: string }) {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)

  async function check() {
    setLoading(true)
    try {
      const res = await fetch(`/api/ai/kind-check?childId=${childId}`)
      const data = await res.json()
      setResult(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)' }}>
            <ClipboardCheck size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">KI-Prüfung · Datenvollständigkeit</p>
            {result && (
              <p className="text-[10px] text-gray-400">Profil {result.stats.completenessPercent}% vollständig</p>
            )}
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
              <button onClick={check}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)' }}>
                Datenvollständigkeit prüfen
              </button>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span className="text-xs text-gray-500">Prüfe…</span>
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
                <p className="text-[10px] text-gray-300 pt-1">KI-Prüfung · Vollständigkeitscheck</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
