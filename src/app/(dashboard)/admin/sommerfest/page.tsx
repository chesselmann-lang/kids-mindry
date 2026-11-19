'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Users } from 'lucide-react'

// ── Sommerfest — Mindry Kids Admin ────────────────────────────────────────────
// Planung · Aufgaben · Budget · Programm · Helfer

type AufgabenKategorie = 'planung' | 'verpflegung' | 'programm' | 'deko' | 'sicherheit' | 'kommunikation'
type ProgrammStatus = 'geplant' | 'bestaetigt' | 'entfaellt'

interface ProgrammPunkt {
  uhrzeit: string
  titel: string
  verantwortlich: string
  status: ProgrammStatus
  dauer: number
}

interface FestAufgabe {
  id: string
  kategorie: AufgabenKategorie
  titel: string
  verantwortlich: string
  frist?: string
  erledigt: boolean
  notiz?: string
}

const KAT_CFG: Record<AufgabenKategorie, { label: string; emoji: string; farbe: string }> = {
  planung:        { label: 'Planung',        emoji: '📋', farbe: 'text-indigo-600' },
  verpflegung:    { label: 'Verpflegung',    emoji: '🍔', farbe: 'text-orange-600' },
  programm:       { label: 'Programm',       emoji: '🎭', farbe: 'text-purple-600' },
  deko:           { label: 'Dekoration',     emoji: '🎉', farbe: 'text-pink-600' },
  sicherheit:     { label: 'Sicherheit',     emoji: '🛡️', farbe: 'text-red-600' },
  kommunikation:  { label: 'Kommunikation',  emoji: '📢', farbe: 'text-teal-600' },
}

const PROG_STATUS_FARBE: Record<ProgrammStatus, string> = {
  geplant:    'text-blue-600',
  bestaetigt: 'text-green-600',
  entfaellt:  'text-red-500 line-through',
}

const PROGRAMM: ProgrammPunkt[] = [
  { uhrzeit: '14:00', titel: 'Einlass & Ankommen',                         verantwortlich: 'Team',            status: 'bestaetigt', dauer: 30 },
  { uhrzeit: '14:30', titel: 'Begrüßung & Willkommensrunde',                verantwortlich: 'Fr. Keller',      status: 'bestaetigt', dauer: 15 },
  { uhrzeit: '14:45', titel: 'Kinderaufführung: Tanz & Lieder',             verantwortlich: 'Kinder Gr. 1+2',  status: 'bestaetigt', dauer: 30 },
  { uhrzeit: '15:15', titel: 'Stationen & Spiele (Eltern + Kinder)',        verantwortlich: 'Helfer-Team',     status: 'bestaetigt', dauer: 60 },
  { uhrzeit: '16:15', titel: 'Grillzeit & Kaffee & Kuchen',                 verantwortlich: 'Elternbeirat',    status: 'bestaetigt', dauer: 60 },
  { uhrzeit: '17:15', titel: 'Tombola & Verlosung',                         verantwortlich: 'Familie Kraft',   status: 'geplant',    dauer: 20 },
  { uhrzeit: '17:35', titel: 'Verabschiedung & Aufräumen',                  verantwortlich: 'Alle',            status: 'geplant',    dauer: 30 },
]

const AUFGABEN: FestAufgabe[] = [
  { id: 'sf1', kategorie: 'planung',       titel: 'Genehmigung Außengelände-Nutzung',       verantwortlich: 'Fr. Keller',    frist: '01.05.2026', erledigt: true },
  { id: 'sf2', kategorie: 'kommunikation', titel: 'Einladungsflyer gestalten + verteilen',  verantwortlich: 'Elternbeirat',  frist: '15.05.2026', erledigt: true },
  { id: 'sf3', kategorie: 'verpflegung',   titel: 'Getränkeliste erstellen + einkaufen',    verantwortlich: 'Fr. Huber',     frist: '18.06.2026', erledigt: false },
  { id: 'sf4', kategorie: 'verpflegung',   titel: 'Grillstation + Kohle organisieren',      verantwortlich: 'Familie Koch',  frist: '18.06.2026', erledigt: false },
  { id: 'sf5', kategorie: 'programm',      titel: 'Kindertanz-Aufführung proben',           verantwortlich: 'Fr. Reiter',    frist: '14.06.2026', erledigt: false },
  { id: 'sf6', kategorie: 'deko',          titel: 'Luftballons + Girlanden bestellen',      verantwortlich: 'Elternbeirat',  frist: '10.06.2026', erledigt: false },
  { id: 'sf7', kategorie: 'sicherheit',    titel: 'Erste-Hilfe-Set bereitstellen',          verantwortlich: 'Team',          frist: '20.06.2026', erledigt: false },
  { id: 'sf8', kategorie: 'planung',       titel: 'Helfer-Einteilung finalisieren',         verantwortlich: 'Fr. Keller',    frist: '10.06.2026', erledigt: false },
  { id: 'sf9', kategorie: 'kommunikation', titel: 'Tombola-Preise einsammeln',              verantwortlich: 'Familie Yıldız',frist: '15.06.2026', erledigt: false },
]

export default function SommerfestPage() {
  const [showProgramm, setShowProgramm] = useState(true)
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)
  const [filterKat, setFilterKat] = useState<AufgabenKategorie | 'alle'>('alle')

  const erledigtCount = AUFGABEN.filter(a => a.erledigt).length
  const offenCount = AUFGABEN.filter(a => !a.erledigt).length
  const gesamtMinuten = PROGRAMM.filter(p => p.status !== 'entfaellt').reduce((s, p) => s + p.dauer, 0)
  const gefilterteAufgaben = filterKat === 'alle' ? AUFGABEN : AUFGABEN.filter(a => a.kategorie === filterKat)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Sommerfest 21.06. — ${offenCount} Aufgaben noch offen. Programm: ${gesamtMinuten} Minuten geplant. Priorität: Helfer-Einteilung + Tombola-Preise vor 15.06. abschließen. Getränke + Grill rechtzeitig bestellen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-teal-500" /> Sommerfest Planung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">21. Juni 2026 · 14:00–18:00 Uhr · Außengelände</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Aufgaben',   val: AUFGABEN.length,    color: 'text-teal-700' },
          { label: 'Erledigt',   val: erledigtCount,      color: 'text-green-600' },
          { label: 'Ausstehend', val: offenCount,         color: offenCount > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Fortschrittsbalken */}
      <div className="rounded-2xl border border-teal-100 bg-white px-3 py-2.5">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide">Gesamtfortschritt</p>
          <p className="text-[9px] font-semibold text-teal-600">{erledigtCount}/{AUFGABEN.length} ({Math.round(erledigtCount/AUFGABEN.length*100)}%)</p>
        </div>
        <div className="h-2 bg-teal-100 rounded-full">
          <div className="h-full bg-teal-400 rounded-full transition-all" style={{ width: `${Math.round(erledigtCount/AUFGABEN.length*100)}%` }} />
        </div>
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

      {/* Programm */}
      <div className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
        <button onClick={() => setShowProgramm(!showProgramm)}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-teal-50/50 transition-colors">
          <p className="text-xs font-bold text-teal-900">🎭 Programmablauf ({gesamtMinuten} Min.)</p>
          {showProgramm ? <ChevronUp className="w-3.5 h-3.5 text-teal-300" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-300" />}
        </button>
        {showProgramm && (
          <div className="border-t border-teal-100 px-3 pb-2 pt-1 space-y-1.5">
            {PROGRAMM.map((p, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[9px] font-bold text-teal-500 w-10 shrink-0">{p.uhrzeit}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold text-teal-900 ${p.status === 'entfaellt' ? 'line-through text-gray-400' : ''}`}>{p.titel}</p>
                  <p className="text-[8px] text-teal-400">{p.verantwortlich} · {p.dauer} Min.</p>
                </div>
                <span className={`text-[8px] font-semibold ${PROG_STATUS_FARBE[p.status]}`}>{p.status === 'bestaetigt' ? '✓' : p.status === 'geplant' ? '○' : '✗'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aufgaben */}
      <div>
        <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-2">Aufgaben</p>
        <div className="flex gap-1 flex-wrap mb-2">
          {(['alle', ...Object.keys(KAT_CFG)] as const).map(k => (
            <button key={k} onClick={() => setFilterKat(k as AufgabenKategorie | 'alle')}
              className={`text-[8px] px-2 py-0.5 rounded-full border font-semibold transition-colors ${filterKat === k ? 'bg-teal-600 text-white border-teal-600' : 'bg-teal-50 text-teal-600 border-teal-200'}`}>
              {k === 'alle' ? 'Alle' : KAT_CFG[k as AufgabenKategorie].emoji + ' ' + KAT_CFG[k as AufgabenKategorie].label}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          {gefilterteAufgaben.map(a => (
            <div key={a.id} className={`rounded-xl border border-teal-100 bg-white px-3 py-2 flex items-start gap-2 ${a.erledigt ? 'opacity-50' : ''}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${a.erledigt ? 'text-green-500' : 'text-orange-300'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-semibold text-teal-900 ${a.erledigt ? 'line-through' : ''}`}>{a.titel}</p>
                <p className="text-[9px] text-teal-400">{KAT_CFG[a.kategorie].emoji} {KAT_CFG[a.kategorie].label} · {a.verantwortlich}{a.frist ? ` · bis ${a.frist}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
