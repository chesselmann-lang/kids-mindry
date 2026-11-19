'use client'

import { useState } from 'react'
import {
  Moon, Star, ChevronDown, ChevronUp, Clock,
  Plus, CheckCircle2, AlertTriangle, Sun, Sparkles,
} from 'lucide-react'

// ── Schlafprotokoll — Mindry Kids ─────────────────────────────────────────────
// Mittagsschlaf-Erfassung · ErzieherIn · Gruppe Bienen & Schmetterlinge

type SchlafStatus = 'schlaeft' | 'ruhend' | 'nicht_geschlafen' | 'unruhig'
type Gruppe = 'Bienen' | 'Schmetterlinge'

interface Kind {
  id: string
  name: string
  gruppe: Gruppe
  alter: number
  hinweis?: string
  schlafBeginn?: string
  schlafEnde?: string
  status: SchlafStatus
  notiz?: string
}

const STATUS_CFG: Record<SchlafStatus, { label: string; emoji: string; farbe: string; bg: string }> = {
  schlaeft:         { label: 'Schläft',          emoji: '😴', farbe: 'text-blue-700',   bg: 'bg-blue-50' },
  ruhend:           { label: 'Ruht',              emoji: '🛌', farbe: 'text-teal-700',   bg: 'bg-teal-50' },
  nicht_geschlafen: { label: 'Nicht geschlafen',  emoji: '👀', farbe: 'text-orange-700', bg: 'bg-orange-50' },
  unruhig:          { label: 'Unruhig',           emoji: '😟', farbe: 'text-red-700',    bg: 'bg-red-50' },
}

const INIT_KINDER: Kind[] = [
  { id: 'k1', name: 'Mia S.',     gruppe: 'Bienen',         alter: 3, schlafBeginn: '12:30', schlafEnde: '14:00', status: 'schlaeft' },
  { id: 'k2', name: 'Leon B.',    gruppe: 'Bienen',         alter: 4, schlafBeginn: '12:35', schlafEnde: '13:45', status: 'schlaeft' },
  { id: 'k3', name: 'Emma W.',    gruppe: 'Bienen',         alter: 3, hinweis: 'Schnuller mitgeben', schlafBeginn: '12:40', status: 'schlaeft' },
  { id: 'k4', name: 'Noah K.',    gruppe: 'Bienen',         alter: 4, status: 'nicht_geschlafen', notiz: 'Liegt ruhig, Buch angeschaut' },
  { id: 'k5', name: 'Lina F.',    gruppe: 'Schmetterlinge', alter: 4, schlafBeginn: '12:30', schlafEnde: '13:30', status: 'ruhend' },
  { id: 'k6', name: 'Paul H.',    gruppe: 'Schmetterlinge', alter: 3, status: 'unruhig', notiz: 'Weint, vermisst Mama', hinweis: 'Trösten, Kuscheltier anbieten' },
  { id: 'k7', name: 'Sophie M.',  gruppe: 'Schmetterlinge', alter: 5, status: 'nicht_geschlafen' },
  { id: 'k8', name: 'Finn A.',    gruppe: 'Schmetterlinge', alter: 3, schlafBeginn: '12:45', status: 'schlaeft' },
]

export default function SchlafprotokollPage() {
  const [kinder, setKinder] = useState<Kind[]>(INIT_KINDER)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gruppeFilter, setGruppeFilter] = useState<Gruppe | 'alle'>('alle')
  const [uhrzeit] = useState('13:15')

  function statusAendern(id: string, status: SchlafStatus) {
    setKinder(prev => prev.map(k => k.id === id ? { ...k, status } : k))
  }

  function notizSpeichern(id: string, notiz: string) {
    setKinder(prev => prev.map(k => k.id === id ? { ...k, notiz } : k))
  }

  function zeitSetzen(id: string, feld: 'schlafBeginn' | 'schlafEnde', val: string) {
    setKinder(prev => prev.map(k => k.id === id ? { ...k, [feld]: val } : k))
  }

  const gefiltert = gruppeFilter === 'alle' ? kinder : kinder.filter(k => k.gruppe === gruppeFilter)
  const schlaeftAnzahl = kinder.filter(k => k.status === 'schlaeft').length
  const unruhigAnzahl  = kinder.filter(k => k.status === 'unruhig').length

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Moon className="w-6 h-6 text-amber-500" /> Schlafprotokoll
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Mittagsruhe · {uhrzeit} Uhr · Alle Gruppen</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Kinder', val: kinder.length, color: 'text-amber-700' },
          { label: 'Schlafen', val: schlaeftAnzahl, color: 'text-blue-700' },
          { label: 'Unruhig', val: unruhigAnzahl, color: unruhigAnzahl > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Ruhend', val: kinder.filter(k => k.status === 'ruhend').length, color: 'text-teal-700' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-amber-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gruppen-Filter */}
      <div className="flex gap-2">
        {(['alle', 'Bienen', 'Schmetterlinge'] as const).map(g => (
          <button key={g} onClick={() => setGruppeFilter(g)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: gruppeFilter === g ? '#f59e0b' : '#fef3c7',
              color: gruppeFilter === g ? 'white' : '#92400e',
            }}>
            {g === 'alle' ? 'Alle' : g}
          </button>
        ))}
      </div>

      {/* Kinder-Liste */}
      <div className="space-y-2">
        {gefiltert.map(k => {
          const sCfg = STATUS_CFG[k.status]
          const isOpen = expanded === k.id
          return (
            <div key={k.id} className={`rounded-2xl border overflow-hidden bg-white ${
              k.status === 'unruhig' ? 'border-red-200' :
              k.status === 'schlaeft' ? 'border-blue-200' : 'border-amber-100'
            }`}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition-colors">
                <span className="text-xl">{sCfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-amber-900">{k.name}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.farbe}`}>{sCfg.label}</span>
                    {k.hinweis && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                  </div>
                  <p className="text-xs text-amber-700/60">{k.gruppe} · {k.alter} Jahre</p>
                </div>
                <div className="text-right">
                  {k.schlafBeginn && (
                    <p className="text-xs text-blue-600 font-medium">{k.schlafBeginn}</p>
                  )}
                  {k.schlafEnde && (
                    <p className="text-[10px] text-gray-400">↑ {k.schlafEnde}</p>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-100 px-4 pb-4 pt-3 space-y-3">
                  {k.hinweis && (
                    <div className="flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-100 px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-orange-800">{k.hinweis}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mb-1.5">Status setzen</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {(Object.keys(STATUS_CFG) as SchlafStatus[]).map(s => (
                        <button key={s} onClick={() => statusAendern(k.id, s)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-xl font-medium transition-all ${
                            k.status === s ? `${STATUS_CFG[s].bg} ${STATUS_CFG[s].farbe} font-bold` : 'bg-gray-100 text-gray-500'
                          }`}>
                          {STATUS_CFG[s].emoji} {STATUS_CFG[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zeiten */}
                  <div className="grid grid-cols-2 gap-2">
                    {(['schlafBeginn', 'schlafEnde'] as const).map(feld => (
                      <div key={feld}>
                        <p className="text-[10px] text-amber-700/60 mb-1">{feld === 'schlafBeginn' ? 'Eingeschlafen' : 'Aufgewacht'}</p>
                        <input type="time" defaultValue={k[feld] ?? ''}
                          onChange={e => zeitSetzen(k.id, feld, e.target.value)}
                          className="w-full text-xs border border-amber-200 rounded-xl px-2 py-1.5 bg-white" />
                      </div>
                    ))}
                  </div>

                  {/* Notiz */}
                  <div>
                    <p className="text-[10px] text-amber-700/60 mb-1">Notiz</p>
                    <textarea defaultValue={k.notiz ?? ''}
                      onBlur={e => notizSpeichern(k.id, e.target.value)}
                      rows={2} placeholder="Beobachtungen..."
                      className="w-full text-xs border border-amber-200 rounded-xl px-3 py-2 bg-white resize-none" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tagesabschluss */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
        <Sun className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-bold text-amber-900">Mittagsruhe beenden</p>
          <p className="text-xs text-amber-700/60">Alle Kinder wecken und Protokoll abschließen</p>
        </div>
        <button className="ml-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
          Wecken
        </button>
      </div>
    </div>
  )
}
