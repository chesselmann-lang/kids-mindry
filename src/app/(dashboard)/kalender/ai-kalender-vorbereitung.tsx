'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, ClipboardList, Bell, Info } from 'lucide-react'

interface Hinweis {
  termin: string
  datum: string
  typ: 'vorbereitung' | 'hinweis' | 'erinnerung'
  text: string
}

const TYP_CONFIG = {
  vorbereitung: { icon: ClipboardList, bg: 'bg-teal-50',   border: 'border-teal-100',   text: 'text-teal-700',   iconColor: 'text-teal-500',   label: 'Vorbereitung' },
  hinweis:      { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-100',   text: 'text-blue-700',   iconColor: 'text-blue-500',   label: 'Hinweis' },
  erinnerung:   { icon: Bell,          bg: 'bg-amber-50',  border: 'border-amber-100',  text: 'text-amber-700',  iconColor: 'text-amber-500',  label: 'Erinnerung' },
}

export default function AiKalenderVorbereitung() {
  const [hinweise, setHinweise] = useState<Hinweis[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState('')
  const [eventCount, setEventCount] = useState(0)

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/kalender-vorbereitung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error('failed')
      if (data.message) setMessage(data.message)
      setHinweise(data.hinweise ?? [])
      setEventCount(data.eventCount ?? 0)
      setLoaded(true)
    } catch {
      setError(true)
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
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-teal-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Terminvorbereitung</p>
          <p className="text-xs text-gray-400 mt-0.5">Vorbereitungshinweise für die nächsten 14 Tage</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-teal-500" />
        <span className="text-sm">KI analysiert anstehende Termine…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Fehler. <button onClick={analyse} className="underline">Nochmal</button>
      </div>
    )
  }

  if (message && hinweise.length === 0) {
    return (
      <div className="card p-4 text-sm text-gray-500 bg-gray-50 flex items-center justify-between">
        <span>{message}</span>
        <button onClick={analyse} className="p-1 hover:text-teal-600">
          <RefreshCw size={13} />
        </button>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-teal-500" />
          <span className="text-xs font-semibold text-teal-700">KI-Terminvorbereitung · {eventCount} Termine in 14 Tagen</span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-teal-100 transition-colors">
          <RefreshCw size={13} className="text-teal-500" />
        </button>
      </div>
      <div className="p-4 space-y-2.5">
        {hinweise.map((h, i) => {
          const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.hinweis
          const Icon = cfg.icon
          return (
            <div key={i} className={`rounded-xl p-3 border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-2">
                <Icon size={13} className={`${cfg.iconColor} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-xs font-semibold ${cfg.text} truncate`}>{h.termin}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-white border ${cfg.border} ${cfg.text} flex-shrink-0`}>
                      {h.datum}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{h.text}</p>
                </div>
              </div>
            </div>
          )
        })}
        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Bitte eigenständig prüfen</p>
      </div>
    </div>
  )
}
