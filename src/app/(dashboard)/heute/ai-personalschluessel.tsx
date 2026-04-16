'use client'

import { useState } from 'react'
import { Users, Sparkles, Loader2, RotateCcw, AlertTriangle, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'

interface PersonalschluesselResult {
  status: 'ok' | 'kritisch' | 'warnung'
  schluessel: string
  benoetigtes_personal: number
  verfuegbares_personal: number
  compliance: boolean
  bewertung: string
  massnahmen: string[]
  hinweis: string
  meta: {
    presentCount: number
    staffCount: number
    totalActiveChildren: number
    absentStaff: number
  }
}

const STATUS_CONFIG = {
  ok:       { label: 'Konform',   color: 'text-green-700',  bg: 'bg-green-50',  icon: CheckCircle2 },
  warnung:  { label: 'Warnung',   color: 'text-amber-700',  bg: 'bg-amber-50',  icon: AlertTriangle },
  kritisch: { label: 'Kritisch',  color: 'text-red-700',    bg: 'bg-red-50',    icon: XCircle },
}

export default function AiPersonalschluessel() {
  const [result, setResult] = useState<PersonalschluesselResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)

  async function check() {
    setLoading(true)
    setError(false)
    setResult(null)
    try {
      const res = await fetch('/api/ai/personalschluessel')
      const data = await res.json()
      if (!res.ok || !data.status) throw new Error('failed')
      setResult(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); check() }}
        className="w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">KI-Personalschlüssel</p>
          <p className="text-xs text-white/70 mt-0.5">Betreuungsschlüssel & Compliance live prüfen</p>
        </div>
        <Sparkles size={16} className="text-white/70 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
      <div className="m-0.5 rounded-[14px] bg-white">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
              <ShieldCheck size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">KI-Personalschlüssel</p>
              <p className="text-[10px] text-gray-400">Betreuungsschlüssel · Compliance · Maßnahmen</p>
            </div>
          </div>
          <button onClick={() => { setOpen(false); setResult(null) }} aria-label="Widget schließen" className="text-[10px] text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
              <Loader2 size={14} className="animate-spin" />
              Analysiere Personalschlüssel…
            </div>
          )}

          {error && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertTriangle size={12} />
                Fehler beim Laden. Bitte nochmal versuchen.
              </div>
              <button onClick={check}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
                <RotateCcw size={12} /> Nochmal versuchen
              </button>
            </div>
          )}

          {result && (() => {
            const cfg = STATUS_CONFIG[result.status] ?? STATUS_CONFIG.ok
            const Icon = cfg.icon
            return (
              <div className="space-y-3">
                {/* Status badge */}
                <div className={`rounded-xl p-3 flex items-center gap-3 ${cfg.bg}`}>
                  <Icon size={20} className={cfg.color} />
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                    <p className="text-[10px] text-gray-500">Betreuungsschlüssel 1:{result.schluessel}</p>
                  </div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-lg ${result.compliance ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {result.compliance ? '✓ Konform' : '✗ Nicht konform'}
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold text-gray-800">{result.meta.presentCount}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Kinder anwesend</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <p className="text-lg font-bold text-gray-800">{result.verfuegbares_personal}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Personal verfügbar</p>
                  </div>
                  <div className={`rounded-xl p-2.5 text-center ${result.verfuegbares_personal >= result.benoetigtes_personal ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className={`text-lg font-bold ${result.verfuegbares_personal >= result.benoetigtes_personal ? 'text-green-700' : 'text-red-700'}`}>
                      {result.benoetigtes_personal}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Mindest-Personal</p>
                  </div>
                </div>

                {/* Bewertung */}
                <div className="border border-gray-100 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">KI-Bewertung</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{result.bewertung}</p>
                </div>

                {/* Maßnahmen */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-blue-700 mb-1.5">Maßnahmen</p>
                  <div className="space-y-1">
                    {result.massnahmen.map((m, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-500 text-xs font-bold">{i + 1}.</span>
                        <p className="text-xs text-gray-700">{m}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rechtlicher Hinweis */}
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-amber-700 mb-1">⚠️ Rechtlicher Hinweis</p>
                  <p className="text-xs text-amber-800">{result.hinweis}</p>
                </div>

                {result.meta.absentStaff > 0 && (
                  <p className="text-[10px] text-gray-400 text-center">
                    {result.meta.absentStaff} Mitarbeiter heute abwesend · Gesamt {result.meta.totalActiveChildren} aktive Kinder
                  </p>
                )}

                <button onClick={check}
                  className="w-full flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
                  <RotateCcw size={11} /> Aktualisieren
                </button>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
