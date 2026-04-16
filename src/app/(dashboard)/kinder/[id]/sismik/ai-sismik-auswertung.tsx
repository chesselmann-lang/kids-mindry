'use client'

import { useState } from 'react'
import { BarChart3, Loader2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SismikBereich {
  id: string
  titel: string
  items: string[]
}

interface AuswertungItem {
  bereich: string
  bewertung: 'stark' | 'mittel' | 'foerderbereich'
  text: string
  aktivitaet: string
}

interface Result { auswertung: AuswertungItem[] }

const BEWERTUNG_CONFIG = {
  stark:          { icon: TrendingUp,   bg: 'bg-green-50',   text: 'text-green-800',  badge: 'bg-green-100 text-green-700',  label: 'Stark'           },
  mittel:         { icon: Minus,        bg: 'bg-blue-50',    text: 'text-blue-800',   badge: 'bg-blue-100 text-blue-700',    label: 'Im Aufbau'       },
  foerderbereich: { icon: TrendingDown, bg: 'bg-amber-50',   text: 'text-amber-800',  badge: 'bg-amber-100 text-amber-700',  label: 'Förderbereich'   },
}

interface Props {
  werte: Record<string, number>
  bereiche: SismikBereich[]
}

export default function AiSismikAuswertung({ werte, bereiche }: Props) {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(true)

  const filledCount = Object.keys(werte).length
  const totalItems = bereiche.reduce((s, b) => s + b.items.length, 0)
  const readyToAnalyse = filledCount >= Math.ceil(totalItems * 0.5)

  async function auswerten() {
    setLoading(true)
    try {
      const bereicheDaten = bereiche.map(b => ({
        id: b.id,
        titel: b.titel,
        items: b.items.map((item, i) => ({
          item,
          wert: werte[`${b.id}_${i}`] ?? null,
        })).filter(x => x.wert !== null),
        avg: (() => {
          const vals = b.items.map((_, i) => werte[`${b.id}_${i}`]).filter(v => v !== undefined) as number[]
          if (!vals.length) return 0
          return Math.round(vals.reduce((a, x) => a + x, 0) / vals.length * 10) / 10
        })(),
        count: b.items.filter((_, i) => werte[`${b.id}_${i}`] !== undefined).length,
      })).filter(b => b.count > 0)

      const res = await fetch('/api/ai/sismik-auswertung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bereiche: bereicheDaten }),
      })
      const data = await res.json()
      setResult(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)' }}>
            <BarChart3 size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800">KI-Auswertung · SISMIK-Ergebnisse</p>
            <p className="text-[10px] text-gray-400">
              {result
                ? 'Pädagogische Einschätzung & Förderempfehlungen'
                : filledCount > 0
                  ? `${filledCount}/${totalItems} Werte eingetragen${readyToAnalyse ? ' · Auswertung möglich' : ''}`
                  : 'Tragen Sie Beobachtungswerte ein zum Auswerten'}
            </p>
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
              <button onClick={auswerten} disabled={!readyToAnalyse}
                className={`w-full py-2 rounded-xl text-xs font-semibold text-white transition-opacity ${
                  readyToAnalyse ? 'hover:opacity-90' : 'opacity-40 cursor-not-allowed'
                }`}
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)' }}>
                {readyToAnalyse
                  ? 'Ergebnisse auswerten'
                  : `Noch ${Math.ceil(totalItems * 0.5) - filledCount} Werte fehlen`}
              </button>
            )}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-3">
                <Loader2 size={14} className="animate-spin text-emerald-500" />
                <span className="text-xs text-gray-500">Analysiere Ergebnisse…</span>
              </div>
            )}
            {result && (
              <div className="space-y-2">
                {result.auswertung.map((a, i) => {
                  const cfg = BEWERTUNG_CONFIG[a.bewertung] ?? BEWERTUNG_CONFIG.mittel
                  const Icon = cfg.icon
                  return (
                    <div key={i} className={`p-3 rounded-xl ${cfg.bg}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} className={cfg.text} />
                          <span className={`text-xs font-semibold ${cfg.text}`}>{a.bereich}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <p className={`text-xs ${cfg.text} mb-1`}>{a.text}</p>
                      <p className={`text-[11px] opacity-80 ${cfg.text}`}>💡 {a.aktivitaet}</p>
                    </div>
                  )
                })}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setResult(null)}
                    className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
                    ↺ Neu auswerten
                  </button>
                  <span className="text-[10px] text-gray-300">· KI-Pädagogik · keine Diagnose</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
