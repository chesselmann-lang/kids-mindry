'use client'

import { useState } from 'react'
import { CalendarCheck, ChevronDown, ChevronUp, Sparkles, Clock, Star, AlertTriangle } from 'lucide-react'

// ── Dienstplan — Mindry Kids Admin ────────────────────────────────────────────
// Schichtplanung · Urlaub · Springer · Personalabdeckung

type SchichtTyp = 'frueh' | 'mitte' | 'spaet' | 'ganztag' | 'springer' | 'frei' | 'urlaub' | 'krank'
type Wochentag = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr'

interface DienstSlot {
  person: string
  schicht: SchichtTyp
  von?: string
  bis?: string
}

interface Woche {
  kw: number
  vonBis: string
  tage: Partial<Record<Wochentag, DienstSlot[]>>
  notiz?: string
}

const SCHICHT_CFG: Record<SchichtTyp, { label: string; farbe: string; bg: string }> = {
  frueh:   { label: 'F',       farbe: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-200' },
  mitte:   { label: 'M',       farbe: 'text-blue-700',   bg: 'bg-blue-100 border-blue-200' },
  spaet:   { label: 'S',       farbe: 'text-purple-700', bg: 'bg-purple-100 border-purple-200' },
  ganztag: { label: 'G',       farbe: 'text-teal-700',   bg: 'bg-teal-100 border-teal-200' },
  springer:{ label: 'SPR',     farbe: 'text-indigo-700', bg: 'bg-indigo-100 border-indigo-200' },
  frei:    { label: '—',       farbe: 'text-gray-400',   bg: 'bg-gray-50 border-gray-100' },
  urlaub:  { label: 'U',       farbe: 'text-green-700',  bg: 'bg-green-100 border-green-200' },
  krank:   { label: 'K',       farbe: 'text-red-700',    bg: 'bg-red-100 border-red-200' },
}

const PERSONAL = ['Fr. Maier', 'Fr. Schmidt', 'Hr. Keller', 'Fr. Hofer', 'Fr. Braun']
const TAGE: Wochentag[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

const WOCHEN: Woche[] = [
  {
    kw: 17, vonBis: '20.–24.04.2026',
    notiz: 'Fr. Braun krank Mo+Di → Springer eingeteilt.',
    tage: {
      Mo: [
        { person: 'Fr. Maier',   schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Fr. Schmidt', schicht: 'mitte',    von: '09:00', bis: '15:00' },
        { person: 'Hr. Keller',  schicht: 'spaet',    von: '12:00', bis: '18:00' },
        { person: 'Fr. Hofer',   schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Fr. Braun',   schicht: 'krank' },
      ],
      Di: [
        { person: 'Fr. Maier',   schicht: 'mitte',    von: '09:00', bis: '15:00' },
        { person: 'Fr. Schmidt', schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Hr. Keller',  schicht: 'ganztag',  von: '07:00', bis: '17:00' },
        { person: 'Fr. Hofer',   schicht: 'spaet',    von: '12:00', bis: '18:00' },
        { person: 'Fr. Braun',   schicht: 'krank' },
      ],
      Mi: [
        { person: 'Fr. Maier',   schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Fr. Schmidt', schicht: 'springer' },
        { person: 'Hr. Keller',  schicht: 'frei' },
        { person: 'Fr. Hofer',   schicht: 'ganztag',  von: '07:00', bis: '17:00' },
        { person: 'Fr. Braun',   schicht: 'mitte',    von: '09:00', bis: '15:00' },
      ],
      Do: [
        { person: 'Fr. Maier',   schicht: 'frei' },
        { person: 'Fr. Schmidt', schicht: 'spaet',    von: '12:00', bis: '18:00' },
        { person: 'Hr. Keller',  schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Fr. Hofer',   schicht: 'mitte',    von: '09:00', bis: '15:00' },
        { person: 'Fr. Braun',   schicht: 'urlaub' },
      ],
      Fr: [
        { person: 'Fr. Maier',   schicht: 'ganztag',  von: '07:00', bis: '17:00' },
        { person: 'Fr. Schmidt', schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Hr. Keller',  schicht: 'mitte',    von: '09:00', bis: '15:00' },
        { person: 'Fr. Hofer',   schicht: 'frei' },
        { person: 'Fr. Braun',   schicht: 'urlaub' },
      ],
    },
  },
  {
    kw: 18, vonBis: '27.04.–01.05.2026',
    notiz: '01.05. Feiertag — Kita geschlossen.',
    tage: {
      Mo: [
        { person: 'Fr. Maier',   schicht: 'mitte',    von: '09:00', bis: '15:00' },
        { person: 'Fr. Schmidt', schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Hr. Keller',  schicht: 'spaet',    von: '12:00', bis: '18:00' },
        { person: 'Fr. Hofer',   schicht: 'frueh',    von: '07:00', bis: '13:00' },
        { person: 'Fr. Braun',   schicht: 'mitte',    von: '09:00', bis: '15:00' },
      ],
      Fr: [
        { person: 'Fr. Maier',   schicht: 'frei' },
        { person: 'Fr. Schmidt', schicht: 'frei' },
        { person: 'Hr. Keller',  schicht: 'frei' },
        { person: 'Fr. Hofer',   schicht: 'frei' },
        { person: 'Fr. Braun',   schicht: 'frei' },
      ],
    },
  },
]

export default function DienstplanPage() {
  const [expanded, setExpanded] = useState<string | null>('kw17')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const kranke = WOCHEN.flatMap(w => Object.values(w.tage)).flat().filter(s => s.schicht === 'krank').length
  const springer = WOCHEN.flatMap(w => Object.values(w.tage)).flat().filter(s => s.schicht === 'springer').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${WOCHEN.length} Wochen geplant. ${kranke} Krank-Einträge, ${springer} Springer-Einsätze. KW 17: Fr. Braun krank Mo+Di. 01.05. Feiertag — KW 18 Fr. komplett frei. Personaldecke kritisch bei Ausfällen!`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-teal-500" /> Dienstplan
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Schichtplanung · Urlaub · Krankmeldungen · Springer</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Wochen',   val: WOCHEN.length, color: 'text-teal-700' },
          { label: 'Krank',    val: kranke,        color: kranke > 0 ? 'text-red-500' : 'text-gray-400' },
          { label: 'Springer', val: springer,      color: springer > 0 ? 'text-indigo-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kranke > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-semibold">{kranke} Krank-Einträge — Springer oder Vertretung prüfen!</p>
        </div>
      )}

      <div className="flex gap-2 text-[8px] flex-wrap">
        {(Object.entries(SCHICHT_CFG) as [SchichtTyp, typeof SCHICHT_CFG[SchichtTyp]][]).map(([k, v]) => (
          <span key={k} className={`px-1.5 py-0.5 rounded border font-bold ${v.bg} ${v.farbe}`}>{v.label} = {k}</span>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Dienstplan</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Dienstplan'}
        </button>
      )}

      <div className="space-y-2">
        {WOCHEN.map(w => {
          const kwKey = `kw${w.kw}`
          const isOpen = expanded === kwKey
          return (
            <div key={kwKey} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : kwKey)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-teal-700">KW{w.kw}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-teal-900">KW {w.kw} — {w.vonBis}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{PERSONAL.length} Mitarbeiter · {Object.keys(w.tage).length} Tage geplant</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[8px]">
                      <thead>
                        <tr>
                          <th className="text-left text-teal-400 font-semibold pb-1 pr-2">Person</th>
                          {TAGE.map(t => <th key={t} className="text-center text-teal-400 font-semibold pb-1 px-0.5">{t}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {PERSONAL.map(p => (
                          <tr key={p}>
                            <td className="text-[8px] text-teal-700 font-semibold pr-2 py-0.5 truncate max-w-[60px]">{p.split(' ')[1]}</td>
                            {TAGE.map(tag => {
                              const slot = (w.tage[tag] ?? []).find(s => s.person === p)
                              const schicht = slot?.schicht ?? 'frei'
                              const cfg = SCHICHT_CFG[schicht]
                              return (
                                <td key={tag} className="px-0.5 py-0.5 text-center">
                                  <span className={`inline-block px-1 py-0.5 rounded border text-[7px] font-bold ${cfg.bg} ${cfg.farbe}`}>{cfg.label}</span>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {w.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{w.notiz}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
