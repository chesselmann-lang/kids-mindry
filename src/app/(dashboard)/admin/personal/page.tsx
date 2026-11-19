'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, AlertTriangle, Clock } from 'lucide-react'

// ── Personal-Übersicht — Mindry Kids ─────────────────────────────────────────
// Mitarbeiter · Qualifikationen · Dienstzeiten · Urlaubsplanung

type PersonalStatus = 'aktiv' | 'urlaub' | 'krank' | 'teilzeit'
type Qualifikation = 'erzieher' | 'heilp_erzieh' | 'sozialp' | 'kinderpfleger' | 'fsk' | 'leitung'
type Gruppe = 'Bienen' | 'Schmetterlinge' | 'Drachen' | 'Leitung' | 'Küche'

interface PersonalMitglied {
  id: string
  name: string
  rolle: string
  qualifikation: Qualifikation
  gruppe: Gruppe
  status: PersonalStatus
  stunden: number
  urlaubstageGesamt: number
  urlaubstageGenommen: number
  eintritt: string
  kuerzel: string
  ersthelfer: boolean
  besonderheiten?: string
}

const STATUS_CFG: Record<PersonalStatus, { label: string; farbe: string; bg: string; emoji: string }> = {
  aktiv:    { label: 'Aktiv',     farbe: 'text-green-700',  bg: 'bg-green-50',  emoji: '✅' },
  urlaub:   { label: 'Urlaub',    farbe: 'text-blue-700',   bg: 'bg-blue-50',   emoji: '🏖️' },
  krank:    { label: 'Krank',     farbe: 'text-red-700',    bg: 'bg-red-50',    emoji: '🤒' },
  teilzeit: { label: 'Teilzeit',  farbe: 'text-orange-700', bg: 'bg-orange-50', emoji: '⏱️' },
}

const QUAL_CFG: Record<Qualifikation, { label: string }> = {
  erzieher:      { label: 'staatl. Erzieher/in' },
  heilp_erzieh:  { label: 'Heilpäd. Erzieher/in' },
  sozialp:       { label: 'Sozialpäd. Assistenz' },
  kinderpfleger: { label: 'Kinderpfleger/in' },
  fsk:           { label: 'Fachkraft Soz.wesen' },
  leitung:       { label: 'Kitaleitung' },
}

const INIT_PERSONAL: PersonalMitglied[] = [
  {
    id: 'p1', name: 'Sandra Jung', kuerzel: 'SJ', rolle: 'Kitaleitung', qualifikation: 'leitung', gruppe: 'Leitung',
    status: 'aktiv', stunden: 39, urlaubstageGesamt: 30, urlaubstageGenommen: 8, eintritt: 'Sep. 2018', ersthelfer: true,
  },
  {
    id: 'p2', name: 'Maria Klein', kuerzel: 'MK', rolle: 'Gruppenleitung Bienen', qualifikation: 'erzieher', gruppe: 'Bienen',
    status: 'aktiv', stunden: 39, urlaubstageGesamt: 28, urlaubstageGenommen: 12, eintritt: 'Aug. 2020', ersthelfer: true,
  },
  {
    id: 'p3', name: 'Lisa Peters', kuerzel: 'LP', rolle: 'Erzieherin', qualifikation: 'erzieher', gruppe: 'Bienen',
    status: 'urlaub', stunden: 30, urlaubstageGesamt: 28, urlaubstageGenommen: 20, eintritt: 'Jan. 2021', ersthelfer: false,
    besonderheiten: 'Urlaub 28. Apr.–9. Mai',
  },
  {
    id: 'p4', name: 'Anna Weber', kuerzel: 'AW', rolle: 'Gruppenleitung Schmetterlinge', qualifikation: 'heilp_erzieh', gruppe: 'Schmetterlinge',
    status: 'aktiv', stunden: 39, urlaubstageGesamt: 30, urlaubstageGenommen: 5, eintritt: 'Mär. 2019', ersthelfer: true,
  },
  {
    id: 'p5', name: 'Tom Bauer', kuerzel: 'TB', rolle: 'Erzieher', qualifikation: 'sozialp', gruppe: 'Schmetterlinge',
    status: 'krank', stunden: 39, urlaubstageGesamt: 28, urlaubstageGenommen: 3, eintritt: 'Sep. 2022', ersthelfer: false,
    besonderheiten: 'Krank ab Mo, 22. Apr. — Vertretung durch Springer',
  },
  {
    id: 'p6', name: 'Julia Richter', kuerzel: 'JR', rolle: 'Gruppenleitung Drachen', qualifikation: 'erzieher', gruppe: 'Drachen',
    status: 'aktiv', stunden: 39, urlaubstageGesamt: 28, urlaubstageGenommen: 7, eintritt: 'Aug. 2021', ersthelfer: false,
  },
  {
    id: 'p7', name: 'Petra Koch', kuerzel: 'PK', rolle: 'Kinderpflegerin', qualifikation: 'kinderpfleger', gruppe: 'Drachen',
    status: 'teilzeit', stunden: 20, urlaubstageGesamt: 20, urlaubstageGenommen: 2, eintritt: 'Jan. 2023', ersthelfer: false,
    besonderheiten: 'Mo–Mi 07:30–12:30',
  },
  {
    id: 'p8', name: 'Gabi Schreiber', kuerzel: 'GS', rolle: 'Köchin', qualifikation: 'fsk', gruppe: 'Küche',
    status: 'aktiv', stunden: 30, urlaubstageGesamt: 26, urlaubstageGenommen: 4, eintritt: 'Sep. 2017', ersthelfer: false,
  },
]

export default function PersonalPage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterGruppe, setFilterGruppe] = useState<Gruppe | 'alle'>('alle')
  const [kiText, setKiText] = useState<string | null>(null)
  const [kiLaedt, setKiLaedt] = useState(false)

  const gefiltert = filterGruppe === 'alle' ? INIT_PERSONAL : INIT_PERSONAL.filter(p => p.gruppe === filterGruppe)
  const krank = INIT_PERSONAL.filter(p => p.status === 'krank').length
  const urlaub = INIT_PERSONAL.filter(p => p.status === 'urlaub').length
  const ersthelfer = INIT_PERSONAL.filter(p => p.ersthelfer).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Personal-Übersicht: ${INIT_PERSONAL.length} Mitarbeiter. ${krank} krank (${INIT_PERSONAL.filter(p=>p.status==='krank').map(p=>p.kuerzel).join(', ')}), ${urlaub} im Urlaub (${INIT_PERSONAL.filter(p=>p.status==='urlaub').map(p=>p.kuerzel).join(', ')}). ${ersthelfer} Ersthelfer im Haus. Achtung: Bienen-Gruppe aktuell unterbesetzt (LP + TB fehlen) — Springer-Einsatz prüfen! Urlaub Lisa Peters: 28.4.–9.5.`)
      setKiLaedt(false)
    }, 900)
  }

  const gruppen: Gruppe[] = ['Bienen', 'Schmetterlinge', 'Drachen', 'Küche', 'Leitung']

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> Personal-Übersicht
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Mitarbeiter · Qualifikationen · Urlaub</p>
      </div>

      {(krank > 0 || urlaub > 0) && (
        <div className="rounded-xl flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-xs text-orange-800">{krank > 0 ? `${krank} krank` : ''}{krank > 0 && urlaub > 0 ? ', ' : ''}{urlaub > 0 ? `${urlaub} im Urlaub` : ''} — Besetzung prüfen!</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Gesamt',    val: INIT_PERSONAL.length, color: 'text-amber-700' },
          { label: 'Aktiv',     val: INIT_PERSONAL.filter(p=>p.status==='aktiv'||p.status==='teilzeit').length, color: 'text-green-700' },
          { label: 'Fehlen',    val: krank + urlaub,       color: (krank+urlaub) > 0 ? 'text-red-600' : 'text-gray-500' },
          { label: 'Ersthelfer',val: ersthelfer,            color: 'text-blue-700' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[9px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Gruppen-Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', ...gruppen] as const).map(g => (
          <button key={g} onClick={() => setFilterGruppe(g)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterGruppe === g ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {g === 'alle' ? 'Alle' : g}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(p => {
          const sCfg = STATUS_CFG[p.status]
          const isOpen = expanded === p.id
          const urlaubRest = p.urlaubstageGesamt - p.urlaubstageGenommen
          return (
            <div key={p.id} className="rounded-2xl border border-amber-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-amber-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                  {p.kuerzel}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{p.name}</p>
                  <p className="text-[9px] text-amber-600">{p.rolle} · {p.gruppe} · {p.stunden}h/Wo</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {p.ersthelfer && <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 rounded-full border border-blue-200">EH</span>}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.farbe}`}>{sCfg.emoji} {sCfg.label}</span>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-300" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-100 px-3 pb-3 pt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-2">
                      <p className="text-[9px] text-amber-600">Qualifikation</p>
                      <p className="text-[10px] font-semibold text-amber-900">{QUAL_CFG[p.qualifikation].label}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-2">
                      <p className="text-[9px] text-amber-600">Urlaubstage</p>
                      <p className="text-[10px] font-semibold text-amber-900">{p.urlaubstageGenommen}/{p.urlaubstageGesamt} (<span className={urlaubRest < 5 ? 'text-red-600' : 'text-green-700'}>{urlaubRest} Rest</span>)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-amber-600">
                    <Clock className="w-2.5 h-2.5" /> Seit {p.eintritt}
                  </div>
                  {p.besonderheiten && (
                    <p className="text-[10px] text-orange-800 bg-orange-50 rounded-lg px-2.5 py-1.5 border border-orange-200">⚠️ {p.besonderheiten}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {kiText ? (
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
          <p className="text-[10px] font-bold flex items-center gap-1 mb-1 text-amber-700"><Sparkles className="w-3 h-3" /> KI-Personalübersicht</p>
          <p className="text-xs leading-relaxed text-amber-900">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Personalübersicht'}
        </button>
      )}
    </div>
  )
}
