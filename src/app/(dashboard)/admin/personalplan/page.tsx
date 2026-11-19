'use client'

import { useState } from 'react'
import {
  Users, Star, ChevronDown, ChevronUp, Clock,
  CheckCircle2, AlertTriangle, CalendarDays, Plus,
  Sun, Coffee, Moon,
} from 'lucide-react'

// ── Personalplan / Dienstplan — Mindry Kids ───────────────────────────────────
// Wochenschicht-Planung · Leiterin

type Schicht = 'frueh' | 'mitte' | 'spaet' | 'frei' | 'urlaub' | 'krank'
type Tag = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr'

interface Mitarbeiter {
  id: string
  name: string
  rolle: string
  stunden: number
  wochenplan: Record<Tag, Schicht>
  hinweis?: string
}

const SCHICHT_CFG: Record<Schicht, { label: string; zeit?: string; farbe: string; bg: string; emoji: string }> = {
  frueh:   { label: 'Früh',    zeit: '07–13',  farbe: 'text-blue-700',   bg: 'bg-blue-50',   emoji: '🌅' },
  mitte:   { label: 'Mitte',   zeit: '09–15',  farbe: 'text-indigo-700', bg: 'bg-indigo-50', emoji: '☀️' },
  spaet:   { label: 'Spät',    zeit: '12–18',  farbe: 'text-purple-700', bg: 'bg-purple-50', emoji: '🌆' },
  frei:    { label: 'Frei',    farbe: 'text-gray-500',   bg: 'bg-gray-100',   emoji: '🏠' },
  urlaub:  { label: 'Urlaub',  farbe: 'text-green-700',  bg: 'bg-green-50',   emoji: '🌴' },
  krank:   { label: 'Krank',   farbe: 'text-red-700',    bg: 'bg-red-50',     emoji: '🤒' },
}

const TAGE: Tag[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

const INIT_TEAM: Mitarbeiter[] = [
  {
    id: 'm1', name: 'Fr. Bauer', rolle: 'Gruppenleitung Bienen', stunden: 39,
    wochenplan: { Mo: 'frueh', Di: 'frueh', Mi: 'mitte', Do: 'frueh', Fr: 'frei' },
  },
  {
    id: 'm2', name: 'Fr. Klein', rolle: 'Erzieherin Schmetterlinge', stunden: 32,
    wochenplan: { Mo: 'mitte', Di: 'mitte', Mi: 'spaet', Do: 'mitte', Fr: 'mitte' },
  },
  {
    id: 'm3', name: 'Fr. Müller', rolle: 'Erzieherin Krabbelkäfer', stunden: 39,
    wochenplan: { Mo: 'frueh', Di: 'spaet', Mi: 'frueh', Do: 'mitte', Fr: 'frueh' },
  },
  {
    id: 'm4', name: 'Hr. Weber', rolle: 'Erzieher Springer', stunden: 20,
    wochenplan: { Mo: 'frei', Di: 'mitte', Mi: 'mitte', Do: 'frei', Fr: 'spaet' },
    hinweis: 'Bringt immer Hund mit — im Büro lassen',
  },
  {
    id: 'm5', name: 'Fr. Fischer', rolle: 'Praktikantin', stunden: 39,
    wochenplan: { Mo: 'frueh', Di: 'frueh', Mi: 'krank', Do: 'krank', Fr: 'krank' },
    hinweis: 'Krank gemeldet bis Fr.',
  },
]

export default function PersonalplanPage() {
  const [team, setTeam] = useState(INIT_TEAM)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  function schichtAendern(mitarbeiterId: string, tag: Tag, schicht: Schicht) {
    setTeam(prev => prev.map(m =>
      m.id === mitarbeiterId ? { ...m, wochenplan: { ...m.wochenplan, [tag]: schicht } } : m
    ))
  }

  const tagBesetzung = (tag: Tag) =>
    team.filter(m => m.wochenplan[tag] !== 'frei' && m.wochenplan[tag] !== 'urlaub' && m.wochenplan[tag] !== 'krank').length

  const kranke = team.filter(m => Object.values(m.wochenplan).some(s => s === 'krank')).length

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" /> Dienstplan
          </h1>
          <p className="text-sm text-amber-700/70 mt-0.5">KW 17 · 28. Apr. – 2. Mai 2025</p>
        </div>
        <button onClick={() => setEditMode(!editMode)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${editMode ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'}`}>
          {editMode ? 'Fertig' : 'Bearbeiten'}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Mitarbeiter',  val: team.length,                                   color: 'text-amber-700' },
          { label: 'Mo Besetzt',   val: tagBesetzung('Mo'),                             color: 'text-blue-700' },
          { label: 'Krank',        val: kranke,                                         color: kranke > 0 ? 'text-red-600' : 'text-green-600' },
          { label: 'Urlaub',       val: team.filter(m => Object.values(m.wochenplan).some(s => s === 'urlaub')).length, color: 'text-green-700' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
            <p className="text-[10px] text-amber-700/60">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Wochenübersicht Tabelle */}
      <div className="rounded-2xl border border-amber-100 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-amber-100 bg-amber-50">
                <th className="px-3 py-2 text-left text-amber-800 font-semibold w-32">Name</th>
                {TAGE.map(t => (
                  <th key={t} className="px-2 py-2 text-center text-amber-700 font-semibold">
                    <div>{t}</div>
                    <div className="text-[9px] font-normal text-amber-500">{tagBesetzung(t)} P.</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {team.map((m, idx) => (
                <tr key={m.id} className={`border-b border-amber-50 ${idx % 2 === 0 ? '' : 'bg-amber-50/30'}`}>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-amber-900 truncate">{m.name.split(' ')[1] || m.name}</p>
                    <p className="text-[10px] text-amber-700/60 truncate">{m.rolle.split(' ')[0]}</p>
                  </td>
                  {TAGE.map(t => {
                    const s = m.wochenplan[t]
                    const sCfg = SCHICHT_CFG[s]
                    return (
                      <td key={t} className="px-1 py-1.5 text-center">
                        {editMode ? (
                          <select value={s} onChange={e => schichtAendern(m.id, t, e.target.value as Schicht)}
                            className={`text-[10px] rounded-lg px-1 py-0.5 border-0 font-medium ${sCfg.bg} ${sCfg.farbe}`}>
                            {(Object.keys(SCHICHT_CFG) as Schicht[]).map(opt => (
                              <option key={opt} value={opt}>{SCHICHT_CFG[opt].label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${sCfg.bg} ${sCfg.farbe}`}>
                            {sCfg.emoji}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-3 py-2 border-t border-amber-100 flex gap-4 flex-wrap">
          {(Object.keys(SCHICHT_CFG) as Schicht[]).filter(s => SCHICHT_CFG[s].zeit).map(s => (
            <span key={s} className="text-[10px] text-amber-700/70">
              {SCHICHT_CFG[s].emoji} {SCHICHT_CFG[s].label}: {SCHICHT_CFG[s].zeit} Uhr
            </span>
          ))}
        </div>
      </div>

      {/* Einzelansichten */}
      <div className="space-y-2">
        {team.map(m => {
          const isOpen = expanded === m.id
          const kranktage = Object.values(m.wochenplan).filter(s => s === 'krank').length
          return (
            <div key={m.id} className={`rounded-2xl border overflow-hidden bg-white ${
              kranktage > 0 ? 'border-red-200' : 'border-amber-100'
            }`}>
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-amber-900">{m.name}</p>
                    {kranktage > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700">Krank {kranktage}T</span>}
                    {m.hinweis && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                  </div>
                  <p className="text-xs text-amber-700/60">{m.rolle} · {m.stunden}h/Wo</p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-100 px-4 pb-4 pt-3 space-y-2">
                  {m.hinweis && (
                    <div className="flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-100 px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-orange-800">{m.hinweis}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-5 gap-1.5">
                    {TAGE.map(t => {
                      const s = m.wochenplan[t]
                      const sCfg = SCHICHT_CFG[s]
                      return (
                        <div key={t} className={`rounded-xl px-2 py-2 text-center ${sCfg.bg}`}>
                          <p className="text-[10px] font-bold text-gray-500">{t}</p>
                          <p className="text-base">{sCfg.emoji}</p>
                          <p className={`text-[10px] font-bold ${sCfg.farbe}`}>{sCfg.label}</p>
                          {sCfg.zeit && <p className="text-[9px] text-gray-400">{sCfg.zeit}</p>}
                        </div>
                      )
                    })}
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
