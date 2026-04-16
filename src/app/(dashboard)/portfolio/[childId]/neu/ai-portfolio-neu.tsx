'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

interface Vorschlag { typ: 'beobachtung' | 'aktivitaet' | 'meilenstein'; text: string }
interface Result { vorschlaege: Vorschlag[]; category: string }

const TYP_CONFIG = {
  beobachtung: { dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-800' },
  aktivitaet:  { dot: 'bg-emerald-500',bg: 'bg-emerald-50',text: 'text-emerald-800'},
  meilenstein: { dot: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-800'  },
}

export default function AiPortfolioNeu({ category }: { category: string }) {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)
  const [loadedCategory, setLoadedCategory] = useState<string | null>(null)

  const isDirty = loadedCategory !== null && loadedCategory !== category

  async function laden() {
    setLoading(true)
    try {
      const res = await fetch(`/api/ai/portfolio-vorschlaege?category=${category}`)
      const data = await res.json()
      setResult(data)
      setLoadedCategory(category)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)' }}>
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">KI-Ideen · Portfolio-Eintrag</p>
            <p className="text-[10px] text-gray-400">
              {isDirty ? '↻ Kategorie geändert – neu laden' : 'Ideen für diese Entwicklungskategorie'}
            </p>
          </div>
          {result && !isDirty && (
            <button onClick={() => setOpen(o => !o)} aria-label="KI-Analyse ein-/ausblenden" className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
            </button>
          )}
        </div>

        {(open || isDirty) && (
          <div className="px-4 pb-3">
            {(!result || isDirty) && !loading && (
              <button onClick={laden}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)' }}>
                {isDirty ? 'Neue Ideen laden' : 'Ideen anzeigen'}
              </button>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 size={14} className="animate-spin text-indigo-500" />
                <span className="text-xs text-gray-500">Lade Ideen…</span>
              </div>
            )}
            {result && !isDirty && (
              <div className="space-y-2">
                {result.vorschlaege.map((v, i) => {
                  const cfg = TYP_CONFIG[v.typ] ?? TYP_CONFIG.beobachtung
                  return (
                    <div key={i} className={`flex gap-2 items-start p-2.5 rounded-xl ${cfg.bg}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <p className={`text-xs leading-relaxed ${cfg.text}`}>{v.text}</p>
                    </div>
                  )
                })}
                <p className="text-[10px] text-gray-300 pt-1">KI-Ideen · Pädagogische Beobachtungshilfe</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
