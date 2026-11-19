'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Users, AlertTriangle, CalendarDays } from 'lucide-react'

// ── Feste & Feiern — Mindry Kids Admin ────────────────────────────────────────
// Jahresfeste · Planung · Aufgaben · KI-Planung

type FestTyp = 'jahresfest' | 'geburtstag' | 'projekt' | 'ausflug' | 'saisonal'
type FestStatus = 'geplant' | 'vorbereitung' | 'stattgefunden'

interface FestAufgabe {
  bezeichnung: string
  verantwortlich: string
  erledigt: boolean
}

interface Fest {
  id: string
  name: string
  datum: string
  typ: FestTyp
  status: FestStatus
  gruppen: string[]
  aufgaben: FestAufgabe[]
  budget?: number
  notiz?: string
}

const TYP_CFG: Record<FestTyp, { label: string; farbe: string }> = {
  jahresfest:{ label: 'Jahresfest',  farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  geburtstag:{ label: 'Geburtstag', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  projekt:   { label: 'Projekt',    farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  ausflug:   { label: 'Ausflug',    farbe: 'bg-green-50 text-green-700 border-green-200' },
  saisonal:  { label: 'Saisonal',   farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
}

const STATUS_FARBE: Record<FestStatus, string> = {
  geplant:          'text-blue-500',
  vorbereitung:     'text-orange-500',
  stattgefunden:    'text-green-600',
}

const INIT_FESTE: Fest[] = [
  {
    id: 'ff1', name: 'Sommerfest 2026', datum: '26.06.2026', typ: 'jahresfest', status: 'vorbereitung',
    gruppen: ['alle Gruppen'],
    budget: 500,
    aufgaben: [
      { bezeichnung: 'Eltern einladen (Brief)', verantwortlich: 'Fr. Schmidt', erledigt: true },
      { bezeichnung: 'Wasserspiele aufbauen', verantwortlich: 'Hr. Weber', erledigt: false },
      { bezeichnung: 'Kuchen-Backtag organisieren', verantwortlich: 'Fr. Braun', erledigt: false },
      { bezeichnung: 'Programm erstellen', verantwortlich: 'Fr. Schmidt', erledigt: true },
      { bezeichnung: 'Grillen vorbereiten', verantwortlich: 'Hr. Weber', erledigt: false },
    ],
    notiz: 'Wetterplan B: Pavillon leihen',
  },
  {
    id: 'ff2', name: 'Laternenfest', datum: '12.11.2025', typ: 'saisonal', status: 'stattgefunden',
    gruppen: ['Igel', 'Bären', 'Füchse'],
    aufgaben: [
      { bezeichnung: 'Laternen basteln', verantwortlich: 'Fr. Neumann', erledigt: true },
      { bezeichnung: 'Laternenlied einüben', verantwortlich: 'Fr. Klein', erledigt: true },
      { bezeichnung: 'Umzugroute planen', verantwortlich: 'Fr. Schmidt', erledigt: true },
    ],
    notiz: 'Sehr schön — 48 Kinder teilgenommen',
  },
  {
    id: 'ff3', name: 'Projektwoche "Wasser"', datum: '19.05.2026', typ: 'projekt', status: 'geplant',
    gruppen: ['Igel', 'Bären'],
    budget: 150,
    aufgaben: [
      { bezeichnung: 'Material einkaufen', verantwortlich: 'Fr. Braun', erledigt: false },
      { bezeichnung: 'Experimente vorbereiten', verantwortlich: 'Fr. Neumann', erledigt: false },
      { bezeichnung: 'Eltern informieren', verantwortlich: 'Fr. Schmidt', erledigt: true },
    ],
  },
]

export default function FesteFeiernPage() {
  const [expanded, setExpanded] = useState<string | null>('ff1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const naechste = INIT_FESTE.filter(f => f.status !== 'stattgefunden').length
  const offeneAufgaben = INIT_FESTE.flatMap(f => f.aufgaben).filter(a => !a.erledigt).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${INIT_FESTE.length} Feste geplant, ${naechste} noch bevorstehend. ${offeneAufgaben} Aufgaben noch offen. Wichtigste Aktion: Sommerfest Wasserstation und Grill noch nicht vorbereitet — ${Math.round((new Date('2026-06-26').getTime() - Date.now()) / 86400000)} Tage verbleiben.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-teal-500" /> Feste & Feiern
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Jahresplanung · Aufgaben · Vorbereitung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Feste',    val: INIT_FESTE.length, color: 'text-teal-700' },
          { label: 'Bevorsteh.', val: naechste, color: 'text-orange-600' },
          { label: 'Aufg. offen', val: offeneAufgaben, color: offeneAufgaben > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Festplanung</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Festplanung'}
        </button>
      )}

      <div className="space-y-2">
        {INIT_FESTE.map(f => {
          const isOpen = expanded === f.id
          const erledigt = f.aufgaben.filter(a => a.erledigt).length
          const pct = f.aufgaben.length > 0 ? Math.round(erledigt / f.aufgaben.length * 100) : 100
          const typCfg = TYP_CFG[f.typ]
          return (
            <div key={f.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : f.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900">{f.name}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${typCfg.farbe}`}>{typCfg.label}</span>
                  </div>
                  <p className="text-[9px] text-teal-500 mt-0.5">
                    <CalendarDays className="w-2.5 h-2.5 inline mr-0.5" />{f.datum}
                    <span className={` ml-2 font-semibold ${STATUS_FARBE[f.status]}`}>· {f.status === 'geplant' ? 'Geplant' : f.status === 'vorbereitung' ? 'In Vorbereitung' : 'Stattgefunden'}</span>
                  </p>
                  {f.aufgaben.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 rounded-full bg-teal-100">
                        <div className="h-full rounded-full bg-teal-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-teal-400">{erledigt}/{f.aufgaben.length} Aufg.</span>
                    </div>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div className="flex gap-3 text-[9px] text-teal-500">
                    <span><Users className="w-2.5 h-2.5 inline mr-0.5" />{f.gruppen.join(', ')}</span>
                    {f.budget && <span>Budget: {f.budget} €</span>}
                  </div>
                  <div className="space-y-1">
                    {f.aufgaben.map((a, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-start gap-1.5">
                          <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${a.erledigt ? 'text-teal-500' : 'opacity-20 text-gray-400'}`} />
                          <p className={`text-[10px] ${a.erledigt ? 'line-through opacity-50 text-teal-700' : 'text-teal-900'}`}>{a.bezeichnung}</p>
                        </div>
                        <span className="text-[9px] text-teal-400 shrink-0">{a.verantwortlich}</span>
                      </div>
                    ))}
                  </div>
                  {f.notiz && (
                    <div className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-2 py-1.5">
                      <Star className="w-2.5 h-2.5 inline mr-1" />{f.notiz}
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
