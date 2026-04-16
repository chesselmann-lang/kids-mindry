'use client'

import { useState } from 'react'
import { Radar, Loader2, RefreshCw, AlertTriangle, Star, Lightbulb } from 'lucide-react'

interface BereichResult {
  domain: string
  label: string
  abdeckung: number
  status: 'gut' | 'ausbaufähig' | 'unterversorgt'
  empfehlung: string
}

interface RadarResult {
  bereiche: BereichResult[]
  gesamtbild: string
  schwerpunkt_monat: string
  aktivitaets_ideen: string[]
  hinweis_eltern: string
  meta: { total: number; sismikCount: number }
}

const STATUS_CONFIG = {
  gut:          { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  dot: '🟢' },
  ausbaufähig:  { bar: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50',  dot: '🟡' },
  unterversorgt:{ bar: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    dot: '🔴' },
}

const DOMAIN_EMOJI: Record<string, string> = {
  social: '🤝', language: '💬', motor: '🏃', cognitive: '🧠', creative: '🎨', emotional: '❤️'
}

export default function AiFoerderbedarfRadar() {
  const [result, setResult] = useState<RadarResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/foerderbedarf-radar')
      const data = await res.json()
      if (!res.ok || !data.bereiche) throw new Error('failed')
      setResult(data)
      setOpen(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={load}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Radar size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Förderbedarf-Radar</p>
          <p className="text-xs text-white/70 mt-0.5">Entwicklungsbedarfe der Gruppe erkennen</p>
        </div>
        {loading
          ? <Loader2 size={16} className="animate-spin text-white/70 flex-shrink-0" />
          : <Radar size={16} className="text-white/70 flex-shrink-0" />
        }
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            <Radar size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-800">KI-Förderbedarf-Radar</p>
            <p className="text-[10px] text-gray-400">{result?.meta.total ?? 0} Kinder · letzten 3 Monate</p>
          </div>
          <button onClick={load} aria-label="Neu analysieren" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw size={13} className="text-gray-400" />
          </button>
          <button onClick={() => setOpen(false)} className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin text-purple-500" />
              <span className="text-xs text-gray-500">Analysiere Entwicklungsbereiche…</span>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 flex items-center gap-2 py-2">
              <AlertTriangle size={12} />
              Fehler beim Analysieren.
              <button onClick={load} className="underline">Nochmal</button>
            </div>
          )}

          {result && (
            <>
              {/* Gesamtbild */}
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-xs text-gray-700">{result.gesamtbild}</p>
              </div>

              {/* Bereiche */}
              <div className="space-y-2">
                {result.bereiche.map((b, i) => {
                  const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.ausbaufähig
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{DOMAIN_EMOJI[b.domain] ?? '📊'}</span>
                          <p className="text-[11px] font-semibold text-gray-800">{b.label}</p>
                          <span className="text-[10px]">{cfg.dot}</span>
                        </div>
                        <p className={`text-[11px] font-bold ${cfg.text}`}>{b.abdeckung}%</p>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div className={`h-full ${cfg.bar} transition-all`} style={{ width: `${b.abdeckung}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-500 pl-6">{b.empfehlung}</p>
                    </div>
                  )
                })}
              </div>

              {/* Monatsschwerpunkt */}
              <div className="rounded-xl p-3" style={{ background: 'linear-gradient(135deg, #f3e8ff, #fce7f3)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Star size={12} className="text-purple-600" />
                  <p className="text-[10px] font-bold text-purple-700">Monatsschwerpunkt</p>
                </div>
                <p className="text-xs text-gray-800">{result.schwerpunkt_monat}</p>
              </div>

              {/* Aktivitätsideen */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb size={12} className="text-amber-500" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Aktivitätsideen</p>
                </div>
                <div className="space-y-1.5">
                  {result.aktivitaets_ideen.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-purple-400 text-xs mt-0.5">✦</span>
                      <p className="text-xs text-gray-700">{a}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eltern-Hinweis */}
              <div className="bg-pink-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-pink-700 mb-1">Tipp für Eltern</p>
                <p className="text-xs text-gray-700">{result.hinweis_eltern}</p>
              </div>

              <p className="text-[9px] text-gray-400">KI-Analyse · letzten 3 Monate · {new Date().toLocaleDateString('de-DE')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
