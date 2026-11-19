'use client'

import { useState } from 'react'
import { LayoutDashboard, ChevronDown, ChevronUp, Sparkles, Star, AlertTriangle } from 'lucide-react'

// ── Belegungsplanung — Mindry Kids Admin ─────────────────────────────────────
// Gruppen · Kapazität · Belegung · Warteliste · Buchungszeiten

type BuchungsZeit = 'halbtags' | 'ganztags' | 'verlaengert' | 'hort'
type GruppenAlter = 'krippe' | 'u3' | 'u6' | 'hort'

interface Kind {
  name: string
  alter: string
  buchung: BuchungsZeit
  seit: string
  foerderbedarf?: boolean
}

interface Gruppe {
  id: string
  name: string
  alter: GruppenAlter
  kapazitaet: number
  kinder: Kind[]
  erzieherin: string
  raum: string
  warteliste?: number
}

const ALTER_CFG: Record<GruppenAlter, { label: string; emoji: string; farbe: string }> = {
  krippe: { label: 'Krippe (0–3 J.)', emoji: '🍼', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  u3:     { label: 'U3 (2–3 J.)',    emoji: '🌱', farbe: 'bg-green-50 text-green-700 border-green-200' },
  u6:     { label: 'U6 (3–6 J.)',    emoji: '🌟', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  hort:   { label: 'Hort (6–10 J.)', emoji: '📚', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const BUCHUNG_LABEL: Record<BuchungsZeit, string> = {
  halbtags:   'HT (4 h)',
  ganztags:   'GT (8 h)',
  verlaengert:'VT (10 h)',
  hort:       'Hort',
}

const GRUPPEN: Gruppe[] = [
  {
    id: 'gr1', name: 'Schmetterlinge', alter: 'u6',
    kapazitaet: 22, erzieherin: 'Fr. Maier', raum: 'Gruppenraum 1', warteliste: 3,
    kinder: [
      { name: 'Luisa M.', alter: '4 J.', buchung: 'ganztags', seit: 'Sep 2023' },
      { name: 'Ben K.', alter: '4 J.', buchung: 'ganztags', seit: 'Sep 2022', foerderbedarf: true },
      { name: 'Mia S.', alter: '5 J.', buchung: 'verlaengert', seit: 'Aug 2021' },
      { name: 'Leon B.', alter: '3 J.', buchung: 'halbtags', seit: 'Sep 2024' },
      { name: '+18 weitere', alter: '', buchung: 'ganztags', seit: '' },
    ],
  },
  {
    id: 'gr2', name: 'Sterne', alter: 'u6',
    kapazitaet: 22, erzieherin: 'Fr. Klein', raum: 'Gruppenraum 2', warteliste: 1,
    kinder: [
      { name: 'Emma R.', alter: '4 J.', buchung: 'verlaengert', seit: 'Feb 2023' },
      { name: 'Noah T.', alter: '5 J.', buchung: 'ganztags', seit: 'Sep 2022', foerderbedarf: true },
      { name: '+19 weitere', alter: '', buchung: 'ganztags', seit: '' },
    ],
  },
  {
    id: 'gr3', name: 'Regenbogen', alter: 'u6',
    kapazitaet: 22, erzieherin: 'Fr. Hoffmann', raum: 'Gruppenraum 3', warteliste: 0,
    kinder: [
      { name: 'Sophie L.', alter: '5 J.', buchung: 'ganztags', seit: 'Sep 2021' },
      { name: 'Finn W.', alter: '5 J.', buchung: 'ganztags', seit: 'Feb 2023', foerderbedarf: true },
      { name: '+18 weitere', alter: '', buchung: 'ganztags', seit: '' },
    ],
  },
  {
    id: 'gr4', name: 'Kröten (Krippe)', alter: 'krippe',
    kapazitaet: 10, erzieherin: 'Fr. Bauer', raum: 'Krippenraum', warteliste: 5,
    kinder: [
      { name: 'Lena A.', alter: '1 J.', buchung: 'ganztags', seit: 'Jan 2026' },
      { name: 'Paul G.', alter: '2 J.', buchung: 'halbtags', seit: 'Sep 2024' },
      { name: '+8 weitere', alter: '', buchung: 'ganztags', seit: '' },
    ],
  },
]

export default function BelegungsplanungPage() {
  const [expanded, setExpanded] = useState<string | null>('gr1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gesamtKinder = GRUPPEN.reduce((s, g) => s + g.kinder.filter(k => k.alter !== '').length + (g.name.includes('+') ? 0 : 0), 0)
  const gesamtKapazitaet = GRUPPEN.reduce((s, g) => s + g.kapazitaet, 0)
  const gesamtWarteliste = GRUPPEN.reduce((s, g) => s + (g.warteliste || 0), 0)
  const foerderkinder = GRUPPEN.flatMap(g => g.kinder).filter(k => k.foerderbedarf).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${GRUPPEN.length} Gruppen, Kapazität ${gesamtKapazitaet}. ${gesamtWarteliste} Kinder auf Warteliste. Krippe ausgebucht: 5 Wartende! ${foerderkinder} Kinder mit Förderbedarf dokumentiert.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-teal-500" /> Belegungsplanung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Gruppen · Kapazitäten · Belegung · Warteliste · Buchungszeiten</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kapazität',    val: gesamtKapazitaet, color: 'text-teal-700' },
          { label: 'Warteliste',   val: gesamtWarteliste, color: gesamtWarteliste > 0 ? 'text-orange-500' : 'text-gray-400' },
          { label: 'Förderkinder', val: foerderkinder,    color: 'text-purple-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {gesamtWarteliste > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">{gesamtWarteliste} Kinder auf Warteliste — Kapazitätserweiterung prüfen.</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Belegungsübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Belegungsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {GRUPPEN.map(g => {
          const isOpen = expanded === g.id
          const aCfg = ALTER_CFG[g.alter]
          const belegung = g.kinder.length
          const auslastung = Math.round((g.kapazitaet / g.kapazitaet) * 100)
          return (
            <div key={g.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : g.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {aCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${aCfg.farbe}`}>{aCfg.label}</span>
                    {(g.warteliste || 0) > 0 && <span className="text-[8px] text-orange-500 font-semibold">⏳ {g.warteliste} Warteliste</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{g.name}</p>
                  <p className="text-[9px] text-teal-400">{g.kapazitaet} Plätze · {g.erzieherin} · {g.raum}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-teal-600">{g.kapazitaet}/{g.kapazitaet}</p>
                  <p className="text-[8px] text-teal-400">belegt</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300 ml-1" /> : <ChevronDown className="w-3 h-3 text-teal-300 ml-1" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div className="w-full bg-teal-100 rounded-full h-1.5">
                    <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <div className="space-y-1">
                    {g.kinder.slice(0, 4).map((k, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[7px] font-bold shrink-0">
                          {k.name.charAt(0)}
                        </div>
                        <p className="text-[9px] text-teal-700 flex-1">{k.name} {k.alter ? `(${k.alter})` : ''}</p>
                        <span className="text-[7px] bg-teal-50 border border-teal-100 rounded-full px-1 text-teal-500">{BUCHUNG_LABEL[k.buchung]}</span>
                        {k.foerderbedarf && <span className="text-[7px] text-purple-400">🌟</span>}
                      </div>
                    ))}
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
