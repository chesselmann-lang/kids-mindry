'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star, AlertTriangle, CalendarDays } from 'lucide-react'

// ── Elternbeirat — Mindry Kids ────────────────────────────────────────────────
// Protokolle · Beschlüsse · Termine · Kommunikation

type SitzungsStatus = 'geplant' | 'abgehalten' | 'abgesagt'
type BeschlussStatus = 'offen' | 'in_umsetzung' | 'umgesetzt' | 'abgelehnt'

interface Beschluss {
  text: string
  status: BeschlussStatus
  verantwortlich: string
}

interface Sitzung {
  id: string
  datum: string
  uhrzeit: string
  status: SitzungsStatus
  teilnehmer: number
  vorsitz: string
  tagesordnung: string[]
  beschluesse?: Beschluss[]
  naechsteSitzung?: string
  notiz?: string
}

const BESCHLUSS_CFG: Record<BeschlussStatus, { label: string; farbe: string }> = {
  offen:        { label: 'Offen',          farbe: 'text-orange-600' },
  in_umsetzung: { label: 'In Umsetzung',   farbe: 'text-blue-600' },
  umgesetzt:    { label: 'Umgesetzt',      farbe: 'text-green-600' },
  abgelehnt:    { label: 'Abgelehnt',      farbe: 'text-gray-500' },
}

const STATUS_CFG: Record<SitzungsStatus, { label: string; farbe: string; bg: string }> = {
  geplant:   { label: 'Geplant',   farbe: 'text-blue-700',  bg: 'bg-blue-50' },
  abgehalten:{ label: 'Abgehalten',farbe: 'text-green-700', bg: 'bg-green-50' },
  abgesagt:  { label: 'Abgesagt', farbe: 'text-gray-500',  bg: 'bg-gray-50' },
}

const INIT_SITZUNGEN: Sitzung[] = [
  {
    id: 's1', datum: 'Mi 14.05.2025', uhrzeit: '19:00', status: 'geplant',
    teilnehmer: 0, vorsitz: 'Frau Hofer (Elternbeiratsvorsitzende)',
    tagesordnung: [
      'Begrüßung & Feststellung der Beschlussfähigkeit',
      'Protokoll der letzten Sitzung',
      'Berichte: Träger, Kitaleitung, Elternbeirat',
      'Sommerfest-Planung 24.06.',
      'Budget 2025/26 — Wünsche ans Trägerwerk',
      'Verschiedenes & Fragen',
    ],
    naechsteSitzung: 'Di 14.10.2025',
    notiz: 'Einladung bereits verschickt — 12 Eltern zugesagt',
  },
  {
    id: 's2', datum: 'Di 11.03.2025', uhrzeit: '19:00', status: 'abgehalten',
    teilnehmer: 9, vorsitz: 'Frau Hofer',
    tagesordnung: [
      'Bericht Kitaleitung: Personalentwicklung',
      'Frühlingsausstellung — Rückmeldungen',
      'Elternbefragung 2025 Auswertung',
      'Anschaffungswünsche (Spielgeräte Außengelände)',
    ],
    beschluesse: [
      { text: 'Klettergerüst für Außengelände anschaffen (Budget: 2.500 €)', status: 'in_umsetzung', verantwortlich: 'Frau Weber (Leitung)' },
      { text: 'Sommerfest 24.06. mit Elternbeirat gemeinsam organisieren', status: 'umgesetzt', verantwortlich: 'Fr. Hofer + Team' },
      { text: 'Jährliche Elternbefragung im Oktober wiederholen', status: 'umgesetzt', verantwortlich: 'Kitaleitung' },
    ],
    notiz: 'Sehr konstruktive Sitzung, alle Punkte abgearbeitet',
  },
  {
    id: 's3', datum: 'Di 14.01.2025', uhrzeit: '19:00', status: 'abgehalten',
    teilnehmer: 7, vorsitz: 'Frau Hofer',
    tagesordnung: [
      'Jahresrückblick 2024',
      'Ziele & Schwerpunkte 2025',
      'Wahl neuer Elternbeirat',
    ],
    beschluesse: [
      { text: 'Frau Hofer als Elternbeiratsvorsitzende wiedergewählt', status: 'umgesetzt', verantwortlich: 'Protokoll' },
      { text: 'Fokus 2025: Außengelände-Erweiterung und Digitalisierung', status: 'in_umsetzung', verantwortlich: 'Gesamtes Team' },
    ],
  },
]

const ELTERNBEIRAT_MITGLIEDER = ['Fr. Hofer (Vorsitz)', 'Hr. Schmidt (Stv.)', 'Fr. Nguyen', 'Fr. Müller']

export default function ElternbeiratPage() {
  const [expanded, setExpanded] = useState<string | null>('s1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const offeneBeschluesse = INIT_SITZUNGEN.flatMap(s => s.beschluesse ?? []).filter(b => b.status === 'offen' || b.status === 'in_umsetzung').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Nächste Sitzung: 14.05. — Einladung versendet, 12 Zusagen. ${offeneBeschluesse} offene/laufende Beschlüsse. In Umsetzung: Klettergerüst (Budget genehmigt). Empfehlung: Klettergerüst-Status vor Sitzung aktualisieren und als TOP vorbereiten.`)
      setKiLaedt(false)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-600" /> Elternbeirat
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Sitzungen · Beschlüsse · Protokolle</p>
      </div>

      {/* Beiratsmitglieder */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50 px-3 py-2.5">
        <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide mb-1.5">Elternbeirat 2024/25</p>
        <div className="flex gap-1.5 flex-wrap">
          {ELTERNBEIRAT_MITGLIEDER.map((m, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white border border-teal-200 text-teal-700">{m}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Sitzungen', val: INIT_SITZUNGEN.filter(s=>s.status==='abgehalten').length, color: 'text-teal-700' },
          { label: 'Offen',     val: offeneBeschluesse, color: offeneBeschluesse > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Nächste',   val: '14.05.', color: 'text-blue-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-200 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Überblick</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Sitzungsüberblick'}
        </button>
      )}

      <div className="space-y-2">
        {INIT_SITZUNGEN.map(s => {
          const sCfg = STATUS_CFG[s.status]
          const isOpen = expanded === s.id
          return (
            <div key={s.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : s.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <CalendarDays className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-teal-900">{s.datum} · {s.uhrzeit}</p>
                  <p className="text-[9px] text-teal-500">{s.vorsitz}</p>
                  {s.teilnehmer > 0 && <p className="text-[9px] text-teal-400"><Users className="w-2.5 h-2.5 inline mr-0.5" />{s.teilnehmer} Teilnehmer</p>}
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${sCfg.bg} ${sCfg.farbe}`}>{sCfg.label}</span>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-teal-300" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide">Tagesordnung</p>
                    {s.tagesordnung.map((top, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-[9px] text-teal-400 shrink-0 mt-0.5">{i+1}.</span>
                        <p className="text-[10px] text-teal-800">{top}</p>
                      </div>
                    ))}
                  </div>
                  {s.beschluesse && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide">Beschlüsse</p>
                      {s.beschluesse.map((b, i) => (
                        <div key={i} className="flex items-start gap-1.5 bg-teal-50 rounded-lg px-2 py-1.5">
                          <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${b.status === 'umgesetzt' ? 'text-green-500' : b.status === 'in_umsetzung' ? 'text-orange-400' : 'text-gray-300'}`} />
                          <div className="flex-1">
                            <p className={`text-[10px] ${b.status === 'umgesetzt' ? 'line-through text-teal-400' : 'text-teal-900'}`}>{b.text}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[8px] font-semibold ${BESCHLUSS_CFG[b.status].farbe}`}>{BESCHLUSS_CFG[b.status].label}</span>
                              <span className="text-[8px] text-teal-400">· {b.verantwortlich}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {s.naechsteSitzung && (
                    <p className="text-[9px] text-teal-600"><CalendarDays className="w-3 h-3 inline mr-1" />Nächste Sitzung: {s.naechsteSitzung}</p>
                  )}
                  {s.notiz && (
                    <p className="text-[9px] text-teal-500 italic">{s.notiz}</p>
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
