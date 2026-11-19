'use client'

import { useState } from 'react'
import {
  Sparkles, Play, AlertCircle, CheckCircle2, TrendingUp,
  TrendingDown, ChevronDown, ChevronUp, RefreshCw, Award,
  AlertTriangle, Shield, Eye, FileText, Lightbulb
} from 'lucide-react'

interface DimScore {
  vollstaendigkeit: number
  konkretheit: number
  entwicklungsbezug: number
  handlungsempfehlung: number
  dsgvo_konformitaet: number
}

interface AuditBeobachtung {
  id: string
  gesamt_score: number
  text: string
  datum: string
  verbesserungsvorschlag: string
  scores: DimScore
}

interface AuditResult {
  auditId: string
  datum: string
  anzahl: number
  fehler: number
  gesamt_score: number
  dimensionen: DimScore
  schwachste: AuditBeobachtung[]
  staerkste: AuditBeobachtung[]
  alle: AuditBeobachtung[]
}

const DIM_LABELS: Record<keyof DimScore, { label: string; icon: string }> = {
  vollstaendigkeit: { label: 'Vollständigkeit', icon: '📋' },
  konkretheit: { label: 'Konkretheit', icon: '🎯' },
  entwicklungsbezug: { label: 'Entwicklungsbezug', icon: '🌱' },
  handlungsempfehlung: { label: 'Handlungsempfehlung', icon: '💡' },
  dsgvo_konformitaet: { label: 'DSGVO-Konformität', icon: '🔒' },
}

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  const color = value >= 7 ? 'bg-green-500' : value >= 5 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-6 text-right ${
        value >= 7 ? 'text-green-600' : value >= 5 ? 'text-amber-600' : 'text-red-500'
      }`}>{value}</span>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 7 ? 'bg-green-100 text-green-700 border-green-200'
    : score >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-600 border-red-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {score.toFixed(1)}/10
    </span>
  )
}

function BeobachtungCard({ obs, expanded = false }: { obs: AuditBeobachtung; expanded?: boolean }) {
  const [open, setOpen] = useState(expanded)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <ScoreBadge score={obs.gesamt_score} />
          <span className="text-sm text-gray-700 truncate">{obs.text}</span>
        </div>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <span className="text-xs text-gray-400">{obs.datum?.split('T')[0]}</span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          {/* Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(DIM_LABELS) as (keyof DimScore)[]).map(dim => (
              <div key={dim}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">
                    {DIM_LABELS[dim].icon} {DIM_LABELS[dim].label}
                  </span>
                </div>
                <ScoreBar value={obs.scores[dim]} />
              </div>
            ))}
          </div>

          {/* Verbesserungsvorschlag */}
          {obs.verbesserungsvorschlag && (
            <div className="flex gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Lightbulb size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-700 mb-0.5">KI-Empfehlung</p>
                <p className="text-xs text-blue-800">{obs.verbesserungsvorschlag}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function QualitaetsDashboard() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'uebersicht' | 'schwach' | 'alle'>('uebersicht')

  async function startAudit() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai/beobachtungs-audit', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Audit fehlgeschlagen')
      setResult(data)
      setActiveTab('uebersicht')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const dims = result?.dimensionen

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={24} className="text-purple-600" />
            KI-Qualitätssicherung
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            KI prüft Beobachtungen der letzten 30 Tage auf Qualität, Vollständigkeit und DSGVO-Konformität
          </p>
        </div>
        <button
          onClick={startAudit}
          disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {loading
            ? <><RefreshCw size={16} className="animate-spin" /> Analysiere…</>
            : <><Play size={16} /> Audit starten</>}
        </button>
      </div>

      {/* ─── Intro (no result yet) ────────────────────────────────────── */}
      {!result && !loading && !error && (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={32} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Qualitäts-Audit bereit</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Claude Haiku prüft bis zu 50 Beobachtungen der letzten 30 Tage auf 5 Qualitätsdimensionen.
            Der Audit dauert ca. 30–60 Sekunden.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.values(DIM_LABELS).map(({ label, icon }) => (
              <span key={label} className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                {icon} {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Loading ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <Sparkles size={36} className="text-purple-600 animate-pulse" />
          <div>
            <p className="text-center font-semibold text-gray-800">KI-Audit läuft…</p>
            <p className="text-center text-sm text-gray-500 mt-1">
              Claude analysiert Beobachtungen — bitte kurz warten (30–60 Sek.)
            </p>
          </div>
          <div className="w-48 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* ─── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div className="card p-6 border-red-200 bg-red-50 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Audit fehlgeschlagen</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
            <button onClick={startAudit} className="mt-3 text-sm text-red-700 underline hover:no-underline">
              Erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* ─── Result ──────────────────────────────────────────────────── */}
      {result && (
        <>
          {/* Score summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-5 md:col-span-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Gesamt-Score</p>
              <p className="text-5xl font-bold text-purple-600">{result.gesamt_score}</p>
              <p className="text-xs text-gray-400 mt-1">von 10 Punkten</p>
            </div>
            <div className="card p-5">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Analysiert</p>
              <p className="text-4xl font-bold text-gray-800">{result.anzahl}</p>
              <p className="text-xs text-gray-400 mt-1">Beobachtungen</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={14} className="text-green-500" />
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Stark (≥7)</p>
              </div>
              <p className="text-4xl font-bold text-green-600">
                {result.alle.filter(r => r.gesamt_score >= 7).length}
              </p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-500" />
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Verbesserbar (&lt;5)</p>
              </div>
              <p className="text-4xl font-bold text-amber-600">
                {result.alle.filter(r => r.gesamt_score < 5).length}
              </p>
            </div>
          </div>

          {/* Dimensionen */}
          {dims && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-600" />
                Qualitätsprofil nach Dimension
              </h3>
              <div className="space-y-3">
                {(Object.keys(DIM_LABELS) as (keyof DimScore)[]).map(dim => (
                  <div key={dim} className="flex items-center gap-3">
                    <span className="text-sm w-44 text-gray-600 flex-shrink-0">
                      {DIM_LABELS[dim].icon} {DIM_LABELS[dim].label}
                    </span>
                    <div className="flex-1">
                      <ScoreBar value={dims[dim]} />
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">Ø {dims[dim]}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {([
              { key: 'uebersicht', label: 'Übersicht', icon: <Eye size={14} /> },
              { key: 'schwach', label: `Verbesserungsbedarf (${result.schwachste.length})`, icon: <AlertTriangle size={14} /> },
              { key: 'alle', label: `Alle (${result.alle.length})`, icon: <FileText size={14} /> },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white border border-b-white border-gray-200 text-purple-700 -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'uebersicht' && (
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Award size={16} className="text-green-600" />
                  Top 5 Beobachtungen
                </h3>
                <div className="space-y-2">
                  {result.staerkste.map(obs => (
                    <div key={obs.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <ScoreBadge score={obs.gesamt_score} />
                      <span className="text-sm text-gray-700 flex-1 truncate">{obs.text}</span>
                      <span className="text-xs text-gray-400">{obs.datum?.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  Größter Verbesserungsbedarf
                </h3>
                <div className="space-y-2">
                  {result.schwachste.slice(0, 3).map(obs => (
                    <BeobachtungCard key={obs.id} obs={obs} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schwach' && (
            <div className="space-y-2">
              {result.schwachste.map(obs => (
                <BeobachtungCard key={obs.id} obs={obs} />
              ))}
              {result.alle.filter(r => r.gesamt_score < 5 && !result.schwachste.find(s => s.id === r.id)).map(obs => (
                <BeobachtungCard key={obs.id} obs={obs} />
              ))}
            </div>
          )}

          {activeTab === 'alle' && (
            <div className="space-y-2">
              {[...result.alle]
                .sort((a, b) => a.gesamt_score - b.gesamt_score)
                .map(obs => (
                  <BeobachtungCard key={obs.id} obs={obs} />
                ))}
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            Audit-ID: {result.auditId} · {new Date(result.datum).toLocaleString('de-DE')}
            {result.fehler > 0 && ` · ${result.fehler} Fehler ignoriert`}
          </p>
        </>
      )}
    </div>
  )
}
