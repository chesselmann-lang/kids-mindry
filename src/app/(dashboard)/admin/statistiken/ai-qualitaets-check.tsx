'use client'

import { useState } from 'react'
import { ShieldCheck, Loader2, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

interface Bereich {
  name: string
  score: number
  status: 'ok' | 'warn' | 'kritisch'
  aktion: string
}

interface QualityResult {
  score: number
  level: 'sehr_gut' | 'gut' | 'ausbaufähig' | 'kritisch'
  bereiche: Bereich[]
  prioritaet: string
  naechste_schritte: string[]
  meta: { total: number; reportCoverage: number; observCoverage: number; milestoneCoverage: number }
}

const LEVEL_CONFIG = {
  sehr_gut:   { label: 'Sehr gut',     color: 'text-green-700',  bg: 'bg-green-50',  bar: 'bg-green-500' },
  gut:        { label: 'Gut',          color: 'text-blue-700',   bg: 'bg-blue-50',   bar: 'bg-blue-500' },
  ausbaufähig:{ label: 'Ausbaufähig',  color: 'text-amber-700',  bg: 'bg-amber-50',  bar: 'bg-amber-500' },
  kritisch:   { label: 'Kritisch',     color: 'text-red-700',    bg: 'bg-red-50',    bar: 'bg-red-500' },
}

const STATUS_CONFIG = {
  ok:       { icon: CheckCircle2, color: 'text-green-500' },
  warn:     { icon: AlertTriangle, color: 'text-amber-500' },
  kritisch: { icon: AlertTriangle, color: 'text-red-500' },
}

export default function AiQualitaetsCheck() {
  const [result, setResult] = useState<QualityResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)

  async function load() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/qualitaets-check')
      const data = await res.json()
      if (!res.ok || !data.score) throw new Error('failed')
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
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Qualitätsprüfung</p>
          <p className="text-xs text-white/70 mt-0.5">Dokumentationsqualität analysieren</p>
        </div>
        {loading
          ? <Loader2 size={16} className="animate-spin text-white/70 flex-shrink-0" />
          : <ShieldCheck size={16} className="text-white/70 flex-shrink-0" />
        }
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <ShieldCheck size={14} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-800">KI-Qualitätsprüfung</p>
            <p className="text-[10px] text-gray-400">{result?.meta.total ?? 0} aktive Kinder analysiert</p>
          </div>
          <button onClick={load} aria-label="Neu analysieren" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw size={13} className="text-gray-400" />
          </button>
          <button onClick={() => setOpen(false)} className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={14} className="animate-spin text-indigo-500" />
              <span className="text-xs text-gray-500">Analysiere Dokumentationsqualität…</span>
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
              {/* Score */}
              {(() => {
                const cfg = LEVEL_CONFIG[result.level] ?? LEVEL_CONFIG.gut
                return (
                  <div className={`rounded-xl p-4 ${cfg.bg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className={`text-2xl font-bold ${cfg.color}`}>{result.score}/100</p>
                        <p className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <p>Berichte: {result.meta.reportCoverage}%</p>
                        <p>Beobachtungen: {result.meta.observCoverage}%</p>
                        <p>Meilensteine: {result.meta.milestoneCoverage}%</p>
                      </div>
                    </div>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                      <div className={`h-full ${cfg.bar} transition-all`} style={{ width: `${result.score}%` }} />
                    </div>
                  </div>
                )
              })()}

              {/* Bereiche */}
              <div className="space-y-1.5">
                {result.bereiche.map((b, i) => {
                  const scfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.warn
                  const Icon = scfg.icon
                  return (
                    <div key={i} className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
                      <Icon size={12} className={`${scfg.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-gray-800">{b.name}</p>
                          <p className={`text-[11px] font-bold ${b.score >= 80 ? 'text-green-600' : b.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {b.score}%
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">{b.aktion}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Priorität */}
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Priorität</p>
                <p className="text-xs text-indigo-800">{result.prioritaet}</p>
              </div>

              {/* Nächste Schritte */}
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between text-xs text-gray-500 py-1"
              >
                <span className="font-medium">Nächste Schritte</span>
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expanded && (
                <div className="space-y-1.5">
                  {result.naechste_schritte.map((s, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-700">{s}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[9px] text-gray-400">KI-Analyse · Letzten 30/90 Tage · {new Date().toLocaleDateString('de-DE')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
