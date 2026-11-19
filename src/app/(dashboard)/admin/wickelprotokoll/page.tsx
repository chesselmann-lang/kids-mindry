'use client'

import { useState } from 'react'
import {
  Heart, Star, ChevronDown, ChevronUp, Clock,
  CheckCircle2, AlertTriangle, Plus, Droplets,
} from 'lucide-react'

// ── Wickelprotokoll — Mindry Kids ─────────────────────────────────────────────
// Hygiene-Dokumentation · ErzieherIn · Krippe & U3

type WickelGrund = 'nass' | 'stuhlgang' | 'praventiv' | 'ausschlag'
type Gruppe = 'Bienen' | 'Schmetterlinge' | 'Krabbelkäfer'

interface WickelEintrag {
  uhrzeit: string
  grund: WickelGrund
  creme?: boolean
  notiz?: string
  erzieherin: string
}

interface Kind {
  id: string
  name: string
  gruppe: Gruppe
  alter: number
  hinweis?: string
  eintraege: WickelEintrag[]
}

const GRUND_CFG: Record<WickelGrund, { label: string; emoji: string; farbe: string; bg: string }> = {
  nass:       { label: 'Nass',      emoji: '💧', farbe: 'text-blue-700',   bg: 'bg-blue-50' },
  stuhlgang:  { label: 'Stuhlgang', emoji: '💩', farbe: 'text-amber-700',  bg: 'bg-amber-50' },
  praventiv:  { label: 'Präventiv', emoji: '🛡️', farbe: 'text-teal-700',   bg: 'bg-teal-50' },
  ausschlag:  { label: 'Ausschlag', emoji: '⚠️', farbe: 'text-red-700',    bg: 'bg-red-50' },
}

const INIT_KINDER: Kind[] = [
  {
    id: 'k1', name: 'Mia S.', gruppe: 'Krabbelkäfer', alter: 1,
    eintraege: [
      { uhrzeit: '08:30', grund: 'nass', erzieherin: 'Fr. Bauer', creme: false },
      { uhrzeit: '10:45', grund: 'stuhlgang', erzieherin: 'Fr. Klein', creme: true, notiz: 'Leichte Rötung, Zinkpaste aufgetragen' },
    ],
  },
  {
    id: 'k2', name: 'Leo B.', gruppe: 'Krabbelkäfer', alter: 1,
    hinweis: 'Empfindliche Haut — immer Bepanthen',
    eintraege: [
      { uhrzeit: '09:15', grund: 'nass', erzieherin: 'Fr. Bauer', creme: true },
      { uhrzeit: '11:30', grund: 'nass', erzieherin: 'Fr. Klein', creme: true },
    ],
  },
  {
    id: 'k3', name: 'Emma W.', gruppe: 'Krabbelkäfer', alter: 2,
    eintraege: [
      { uhrzeit: '08:45', grund: 'stuhlgang', erzieherin: 'Fr. Müller', creme: false },
    ],
  },
  {
    id: 'k4', name: 'Noah K.', gruppe: 'Bienen', alter: 3,
    hinweis: 'Töpfchen statt Wickel wenn möglich',
    eintraege: [],
  },
  {
    id: 'k5', name: 'Lina F.', gruppe: 'Bienen', alter: 2,
    eintraege: [
      { uhrzeit: '07:50', grund: 'praventiv', erzieherin: 'Fr. Bauer', creme: false },
    ],
  },
]

const ERZIEHERINNEN = ['Fr. Bauer', 'Fr. Klein', 'Fr. Müller', 'Hr. Weber']

export default function WickelprotokollPage() {
  const [kinder, setKinder] = useState<Kind[]>(INIT_KINDER)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gruppeFilter, setGruppeFilter] = useState<Gruppe | 'alle'>('alle')
  const [neuerGrund, setNeuerGrund] = useState<WickelGrund>('nass')
  const [neuerErzieher, setNeuerErzieher] = useState(ERZIEHERINNEN[0])
  const [neuerCreme, setNeuerCreme] = useState(false)
  const [neueNotiz, setNeueNotiz] = useState('')

  function eintragHinzufuegen(kindId: string) {
    const uhrzeit = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    const eintrag: WickelEintrag = {
      uhrzeit, grund: neuerGrund, creme: neuerCreme,
      erzieherin: neuerErzieher,
      notiz: neueNotiz.trim() || undefined,
    }
    setKinder(prev => prev.map(k =>
      k.id === kindId ? { ...k, eintraege: [...k.eintraege, eintrag] } : k
    ))
    setNeueNotiz('')
    setNeuerCreme(false)
  }

  const gefiltert = gruppeFilter === 'alle' ? kinder : kinder.filter(k => k.gruppe === gruppeFilter)
  const gesamtWickel = kinder.reduce((s, k) => s + k.eintraege.length, 0)
  const mitAusschlag = kinder.filter(k => k.eintraege.some(e => e.grund === 'ausschlag')).length

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Droplets className="w-6 h-6 text-amber-500" /> Wickelprotokoll
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Hygiene-Dokumentation · Krippe · Heute</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Gesamt heute', val: gesamtWickel, color: 'text-amber-700' },
          { label: 'Kinder',       val: kinder.length, color: 'text-amber-700' },
          { label: 'Ausschlag ⚠️', val: mitAusschlag, color: mitAusschlag > 0 ? 'text-red-600' : 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-amber-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gruppen-Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', 'Krabbelkäfer', 'Bienen', 'Schmetterlinge'] as const).map(g => (
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

      {/* Kinder */}
      <div className="space-y-2">
        {gefiltert.map(k => {
          const isOpen = expanded === k.id
          const hatAusschlag = k.eintraege.some(e => e.grund === 'ausschlag')
          return (
            <div key={k.id} className={`rounded-2xl border overflow-hidden bg-white ${
              hatAusschlag ? 'border-red-200' : k.eintraege.length === 0 ? 'border-gray-200' : 'border-amber-200'
            }`}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition-colors">
                <span className="text-xl">🍼</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-amber-900">{k.name}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{k.gruppe}</span>
                    {k.hinweis && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                    {hatAusschlag && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700">Ausschlag</span>}
                  </div>
                  <p className="text-xs text-amber-700/60">
                    {k.alter} J. · {k.eintraege.length}× gewickelt
                    {k.eintraege.length > 0 ? ` · Letztes: ${k.eintraege[k.eintraege.length - 1].uhrzeit}` : ''}
                  </p>
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

                  {/* Bisherige Einträge */}
                  {k.eintraege.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mb-1.5">Heute</p>
                      <div className="space-y-1.5">
                        {k.eintraege.map((e, i) => {
                          const gCfg = GRUND_CFG[e.grund]
                          return (
                            <div key={i} className={`flex items-start gap-2.5 rounded-xl px-3 py-2 ${gCfg.bg}`}>
                              <span className="text-base">{gCfg.emoji}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`text-xs font-semibold ${gCfg.farbe}`}>{gCfg.label}</p>
                                  <span className="text-[10px] text-gray-500">{e.uhrzeit}</span>
                                  {e.creme && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-full font-medium">Creme ✓</span>}
                                </div>
                                {e.notiz && <p className="text-xs text-gray-600 mt-0.5">{e.notiz}</p>}
                                <p className="text-[10px] text-gray-400">{e.erzieherin}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Neuer Eintrag */}
                  <div className="border-t border-amber-100 pt-3">
                    <p className="text-[10px] font-bold text-amber-700/60 uppercase tracking-wider mb-2">Neuer Eintrag</p>
                    <div className="space-y-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {(Object.keys(GRUND_CFG) as WickelGrund[]).map(g => (
                          <button key={g} onClick={() => setNeuerGrund(g)}
                            className={`text-xs px-2 py-1 rounded-xl font-medium transition-all ${
                              neuerGrund === g ? `${GRUND_CFG[g].bg} ${GRUND_CFG[g].farbe} font-bold` : 'bg-gray-100 text-gray-500'
                            }`}>
                            {GRUND_CFG[g].emoji} {GRUND_CFG[g].label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 items-center">
                        <select value={neuerErzieher} onChange={e => setNeuerErzieher(e.target.value)}
                          className="flex-1 text-xs border border-amber-200 rounded-xl px-2 py-1.5 bg-white">
                          {ERZIEHERINNEN.map(e => <option key={e}>{e}</option>)}
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-amber-700 cursor-pointer">
                          <input type="checkbox" checked={neuerCreme} onChange={e => setNeuerCreme(e.target.checked)} className="rounded" />
                          Creme
                        </label>
                      </div>
                      <input value={neueNotiz} onChange={e => setNeueNotiz(e.target.value)}
                        placeholder="Notiz (optional)"
                        className="w-full text-xs border border-amber-200 rounded-xl px-3 py-1.5 bg-white" />
                      <button onClick={() => eintragHinzufuegen(k.id)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-white bg-amber-500 hover:bg-amber-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Eintrag hinzufügen
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
