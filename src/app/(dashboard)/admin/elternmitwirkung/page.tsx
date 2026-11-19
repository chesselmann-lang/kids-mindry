'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Star } from 'lucide-react'

// ── Elternmitwirkung — Mindry Kids Admin ──────────────────────────────────────
// Elternbeirat · Mitarbeit · Veranstaltungen · Anträge · §26 SGB VIII

type MitwirkungsTyp = 'beirat' | 'mitarbeit' | 'ausflug' | 'fest' | 'fundraising' | 'info'
type MitwirkungsStatus = 'aktiv' | 'geplant' | 'abgeschlossen' | 'gesucht'

interface Mitwirkender {
  name: string
  rolle: string
  kontakt?: string
}

interface ElternMitwirkung {
  id: string
  typ: MitwirkungsTyp
  titel: string
  datum?: string
  status: MitwirkungsStatus
  verantwortlich: string
  beschreibung: string
  mitwirkende: Mitwirkender[]
  aufgaben: { titel: string; erledigt: boolean }[]
  notiz?: string
}

const TYP_CFG: Record<MitwirkungsTyp, { label: string; emoji: string; farbe: string }> = {
  beirat:      { label: 'Elternbeirat',  emoji: '🏛️', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  mitarbeit:   { label: 'Mitarbeit',     emoji: '🤝', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  ausflug:     { label: 'Ausflug',       emoji: '🚌', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  fest:        { label: 'Fest',          emoji: '🎉', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  fundraising: { label: 'Fundraising',   emoji: '💰', farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  info:        { label: 'Info-Abend',    emoji: '📋', farbe: 'bg-gray-50 text-gray-600 border-gray-200' },
}

const STATUS_CFG: Record<MitwirkungsStatus, { label: string; farbe: string; bg: string }> = {
  aktiv:         { label: 'Aktiv',          farbe: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  geplant:       { label: 'Geplant',        farbe: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  abgeschlossen: { label: 'Abgeschlossen',  farbe: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200' },
  gesucht:       { label: 'Helfer gesucht', farbe: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
}

const MITWIRKUNGEN: ElternMitwirkung[] = [
  {
    id: 'em1', typ: 'beirat', status: 'aktiv',
    titel: 'Elternbeirat 2025/26',
    verantwortlich: 'Frau Berger (Vorsitz)',
    beschreibung: 'Gewählter Elternbeirat — monatliche Sitzungen, Interessenvertretung §26 SGB VIII.',
    mitwirkende: [
      { name: 'Sabine Berger', rolle: 'Vorsitzende', kontakt: 's.berger@email.de' },
      { name: 'Thomas Kraft',  rolle: 'Stellvertreter' },
      { name: 'Lena Müller',   rolle: 'Kassenwart' },
      { name: 'Ana Santos',    rolle: 'Schriftführerin' },
    ],
    aufgaben: [
      { titel: 'Sitzungsprotokoll April aushängen', erledigt: false },
      { titel: 'Jahresrechnung prüfen',              erledigt: true },
      { titel: 'Nächste Sitzung einladen',           erledigt: false },
    ],
    notiz: 'Nächste Sitzung: 19.05.2026 um 19:30 Uhr',
  },
  {
    id: 'em2', typ: 'fest', status: 'geplant',
    titel: 'Sommerfest Kita — 21.06.2026',
    datum: '21.06.2026',
    verantwortlich: 'Elternbeirat + Team',
    beschreibung: 'Jährliches Sommerfest mit Spielen, Grillstation und Tombola.',
    mitwirkende: [
      { name: 'Sabine Berger', rolle: 'Koordination' },
      { name: 'Familie Koch',  rolle: 'Grillstation' },
      { name: 'Familie Yıldız', rolle: 'Tombola' },
    ],
    aufgaben: [
      { titel: 'Einladungen versenden',   erledigt: true },
      { titel: 'Getränkeliste aufstellen', erledigt: false },
      { titel: 'Spielstationen planen',   erledigt: false },
      { titel: 'Tombola-Preise sammeln',   erledigt: false },
    ],
  },
  {
    id: 'em3', typ: 'mitarbeit', status: 'gesucht',
    titel: 'Helfer für Bücherflohmarkt',
    datum: '10.05.2026',
    verantwortlich: 'Frau Berger',
    beschreibung: 'Bücher und Spielzeug für soziale Projekte sammeln + verkaufen. 3 Helfer benötigt.',
    mitwirkende: [
      { name: 'Lena Müller', rolle: 'Organisatorin' },
    ],
    aufgaben: [
      { titel: 'Spenden-Sammelboxen aufstellen',  erledigt: true },
      { titel: 'Flyer verteilen',                  erledigt: false },
      { titel: '2 weitere Helfer gewinnen',        erledigt: false },
    ],
    notiz: 'Bitte über KiTa-App melden wenn Interesse!',
  },
  {
    id: 'em4', typ: 'fundraising', status: 'abgeschlossen',
    titel: 'Spendenaktion — Spielzeug für Außengelände',
    verantwortlich: 'Elternbeirat',
    beschreibung: 'Crowdfunding für neues Klettergerüst. Ziel: 2.400 €',
    mitwirkende: [
      { name: 'Thomas Kraft', rolle: 'Koordinator' },
      { name: 'Ana Santos',   rolle: 'Kommunikation' },
    ],
    aufgaben: [
      { titel: 'Fundraising-Seite einrichten', erledigt: true },
      { titel: 'Eltern informieren',           erledigt: true },
      { titel: 'Betrag überweisen',            erledigt: true },
    ],
    notiz: 'Ziel erreicht: 2.650 € gesammelt ✓',
  },
]

export default function ElternmitwirkungPage() {
  const [expanded, setExpanded] = useState<string | null>('em1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gesucht = MITWIRKUNGEN.filter(m => m.status === 'gesucht').length
  const offeneAufgaben = MITWIRKUNGEN.flatMap(m => m.aufgaben).filter(a => !a.erledigt).length
  const aktiveHelfer = new Set(MITWIRKUNGEN.filter(m => m.status !== 'abgeschlossen').flatMap(m => m.mitwirkende.map(mw => mw.name))).size

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${MITWIRKUNGEN.length} Elternmitwirkungs-Aktionen: ${aktiveHelfer} aktive Mitwirkende. ${gesucht} Aktion(en) suchen noch Helfer. Sommerfest 21.06. — Aufgaben jetzt koordinieren. Elternbeirat-Einladung für Mai noch ausstehend.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-500" /> Elternmitwirkung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Elternbeirat · Aktionen · §26 SGB VIII</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Aktionen',   val: MITWIRKUNGEN.length, color: 'text-teal-700' },
          { label: 'Helfer akt.', val: aktiveHelfer,        color: 'text-green-600' },
          { label: 'Offene Aufg.', val: offeneAufgaben,    color: offeneAufgaben > 0 ? 'text-orange-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {gesucht > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">{gesucht} Aktion sucht noch Helfer — in App ausschreiben!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Mitwirkungs-Analyse</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Mitwirkungs-Analyse'}
        </button>
      )}

      <div className="space-y-2">
        {MITWIRKUNGEN.map(m => {
          const isOpen = expanded === m.id
          const typCfg = TYP_CFG[m.typ]
          const statusCfg = STATUS_CFG[m.status]
          const erledigtCount = m.aufgaben.filter(a => a.erledigt).length
          return (
            <div key={m.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {typCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${typCfg.farbe}`}>{typCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${statusCfg.farbe}`}>{statusCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{m.titel}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {m.datum && <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{m.datum}</p>}
                    <p className="text-[9px] text-teal-400">{m.mitwirkende.length} Mitwirkende · {erledigtCount}/{m.aufgaben.length} Aufgaben</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-500">{m.beschreibung}</p>

                  {m.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{m.notiz}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Mitwirkende</p>
                    {m.mitwirkende.map((mw, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                          <span className="text-[7px] font-bold text-teal-600">{mw.name.charAt(0)}</span>
                        </div>
                        <p className="text-[9px] text-teal-900 font-medium">{mw.name}</p>
                        <span className="text-[8px] text-teal-400">{mw.rolle}</span>
                      </div>
                    ))}
                  </div>

                  {m.aufgaben.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Aufgaben</p>
                      {m.aufgaben.map((a, i) => (
                        <div key={i} className="flex items-center gap-1.5 mb-0.5">
                          <CheckCircle2 className={`w-3 h-3 shrink-0 ${a.erledigt ? 'text-green-500' : 'text-orange-300'}`} />
                          <p className={`text-[10px] text-teal-900 ${a.erledigt ? 'line-through opacity-50' : ''}`}>{a.titel}</p>
                        </div>
                      ))}
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
