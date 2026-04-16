'use client'

import { useState } from 'react'
import { Heart, Sparkles, Loader2, Star, Lightbulb, TrendingUp, ArrowRight, RefreshCw } from 'lucide-react'

const GRADIENT = 'linear-gradient(135deg, #f472b6, #a855f7)'

const STIMMUNG_CONFIG = {
  positiv:      { label: 'Gute Woche ✨',  bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-400' },
  ausgeglichen: { label: 'Ruhige Woche',   bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  beobachten:   { label: 'Im Blick',       bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400' },
}

interface FeedResult {
  zusammenfassung: string
  highlights: string[]
  entwicklungsnotiz: string
  tipp_fuer_eltern: string
  naechste_woche_ausblick: string
  stimmungstrend: 'positiv' | 'ausgeglichen' | 'beobachten'
  childName: string
  weekLabel: string
  presentDays: number
  sickDays: number
  newMilestones: number
}

export default function AiElternFeed() {
  const [data, setData] = useState<FeedResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/eltern-entwicklungs-feed')
      if (!res.ok) throw new Error((await res.json()).error ?? 'Fehler')
      setData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl p-0.5" style={{ background: GRADIENT }}>
      <div className="bg-white rounded-[14px] p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: GRADIENT }}
            >
              <Heart size={15} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Wochenbericht für Sie</p>
              <p className="text-[10px] text-gray-400">
                {data ? `Woche ${data.weekLabel}` : 'KI-Entwicklungsfeed · Letzte 7 Tage'}
              </p>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-1.5">
              {data.presentDays > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  {data.presentDays}d dabei
                </span>
              )}
              {data.newMilestones > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {data.newMilestones} ⭐
                </span>
              )}
            </div>
          )}
        </div>

        {/* Leerer Zustand */}
        {!data && !loading && !error && (
          <button
            onClick={load}
            aria-label="Wochenbericht abrufen"
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: GRADIENT }}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={14} />
              Wochenbericht anzeigen
            </span>
          </button>
        )}

        {/* Laden */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-5 text-gray-400">
            <Loader2 size={18} className="animate-spin text-pink-400" />
            <span className="text-sm">Erstelle Ihren Wochenbericht…</span>
          </div>
        )}

        {/* Fehler */}
        {error && !loading && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-600 mb-1.5">{error}</p>
            <button onClick={load} className="text-xs font-semibold text-red-500 hover:text-red-700">
              Erneut versuchen
            </button>
          </div>
        )}

        {/* Ergebnis */}
        {data && !loading && (
          <div className="space-y-3">
            {/* Stimmungstrend */}
            {(() => {
              const cfg = STIMMUNG_CONFIG[data.stimmungstrend] ?? STIMMUNG_CONFIG.ausgeglichen
              return (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cfg.bg}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                </div>
              )
            })()}

            {/* Zusammenfassung */}
            <div className="bg-pink-50 rounded-xl p-3">
              <p className="text-xs text-gray-800 leading-relaxed">{data.zusammenfassung}</p>
            </div>

            {/* Highlights */}
            {data.highlights?.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <Star size={9} />
                  Highlights der Woche
                </p>
                <div className="space-y-1">
                  {data.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight size={11} className="text-pink-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700">{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entwicklungsnotiz */}
            <div className="border border-purple-100 rounded-xl p-3">
              <p className="text-[10px] font-bold text-purple-600 mb-1 flex items-center gap-1">
                <TrendingUp size={10} />
                Entwicklung
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">{data.entwicklungsnotiz}</p>
            </div>

            {/* Tipp für Eltern */}
            <div className="bg-amber-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-amber-600 mb-1 flex items-center gap-1">
                <Lightbulb size={10} />
                Tipp für Sie zuhause
              </p>
              <p className="text-xs text-gray-700 leading-relaxed">{data.tipp_fuer_eltern}</p>
            </div>

            {/* Ausblick */}
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-gray-400 italic">🌟 {data.naechste_woche_ausblick}</p>
            </div>

            {/* Refresh */}
            <button
              onClick={load}
              aria-label="Wochenbericht aktualisieren"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw size={11} />
              Aktualisieren
            </button>

            <p className="text-[9px] text-gray-300">KI-generierter Entwicklungsbericht · Keine medizinische Diagnose</p>
          </div>
        )}
      </div>
    </div>
  )
}
