'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, CheckCircle2, Info, AlertTriangle } from 'lucide-react'

interface Bewertung {
  typ: 'positiv' | 'hinweis' | 'warnung'
  titel: string
  text: string
}

const TYP_CONFIG = {
  positiv:  { icon: CheckCircle2,  bg: 'bg-green-50',  border: 'border-green-100',  text: 'text-green-700',  iconColor: 'text-green-500' },
  hinweis:  { icon: Info,           bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   iconColor: 'text-blue-500' },
  warnung:  { icon: AlertTriangle,  bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  iconColor: 'text-amber-500' },
}

interface Props {
  weekStart: string
  isStaff: boolean
}

export default function AiSpeiseplanAnalyse({ weekStart, isStaff }: Props) {
  const [bewertung, setBewertung] = useState<Bewertung[]>([])
  const [weekLabel, setWeekLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  if (!isStaff) return null

  async function analyse() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/speiseplan-analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekStart }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'failed')
      setBewertung(data.bewertung ?? [])
      setWeekLabel(data.weekLabel ?? '')
      setLoaded(true)
    } catch (e: any) {
      setError(e.message ?? 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  if (!loaded && !loading) {
    return (
      <button
        onClick={analyse}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-lime-100 to-green-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-lime-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Speiseplan-Analyse</p>
          <p className="text-xs text-gray-400 mt-0.5">Ernährungsbalance & Allergiehinweise prüfen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-lime-500" />
        <span className="text-sm">KI analysiert Speiseplan…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-amber-700 bg-amber-50 border border-amber-200">
        {error === 'Kein Speiseplan für diese Woche gefunden.' ? (
          'Kein Speiseplan für diese Woche eingetragen – erst Mahlzeiten hinzufügen.'
        ) : (
          <span>Fehler. <button onClick={analyse} className="underline">Nochmal</button></span>
        )}
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-lime-50 to-green-50 border-b border-lime-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-lime-600" />
          <span className="text-xs font-semibold text-lime-700">KI-Analyse · {weekLabel}</span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-lime-100 transition-colors">
          <RefreshCw size={13} className="text-lime-500" />
        </button>
      </div>
      <div className="p-4 space-y-2.5">
        {bewertung.length === 0 ? (
          <p className="text-xs text-gray-400">Keine Auffälligkeiten.</p>
        ) : bewertung.map((b, i) => {
          const cfg = TYP_CONFIG[b.typ] ?? TYP_CONFIG.hinweis
          const Icon = cfg.icon
          return (
            <div key={i} className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-2">
                <Icon size={13} className={`${cfg.iconColor} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className={`text-xs font-semibold ${cfg.text} mb-0.5`}>{b.titel}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{b.text}</p>
                </div>
              </div>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Ernährungsberatung nicht ersetzt</p>
      </div>
    </div>
  )
}
