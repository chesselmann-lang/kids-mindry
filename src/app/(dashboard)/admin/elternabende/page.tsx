'use client'

import { useState } from 'react'
import { Users, CalendarDays, ChevronDown, ChevronUp, CheckCircle2, Clock, Sparkles, AlertTriangle, Star } from 'lucide-react'

// ── Elternabende — Mindry Kids ────────────────────────────────────────────────
// Termine · Protokolle · Anwesenheit · Agenda

type ElternabenStatus = 'geplant' | 'laufend' | 'abgeschlossen' | 'abgesagt'
type AgendaPunkt = { titel: string; dauer: number; erledigt: boolean; notiz?: string }

interface Elternabend {
  id: string
  titel: string
  datum: string
  uhrzeit: string
  ort: string
  status: ElternabenStatus
  eingeladen: number
  erschienen: number
  moderation: string
  agenda: AgendaPunkt[]
  beschluss?: string
  naechsterTermin?: string
}

const STATUS_CFG: Record<ElternabenStatus, { label: string; farbe: string; bg: string; border: string }> = {
  geplant:      { label: 'Geplant',       farbe: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  laufend:      { label: 'Läuft',         farbe: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  abgeschlossen:{ label: 'Abgeschlossen', farbe: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200' },
  abgesagt:     { label: 'Abgesagt',      farbe: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
}

const INIT_ABENDE: Elternabend[] = [
  {
    id: 'e1',
    titel: 'Elternabend Gruppe Sonnenkäfer',
    datum: '08.05.2025', uhrzeit: '18:30', ort: 'Gruppenraum 1',
    status: 'geplant', eingeladen: 14, erschienen: 0, moderation: 'Fr. Weber',
    agenda: [
      { titel: 'Begrüßung & Vorstellungsrunde', dauer: 10, erledigt: false },
      { titel: 'Rückblick auf das Halbjahr', dauer: 15, erledigt: false, notiz: 'Bilder & Portfolio vorstellen' },
      { titel: 'Eingewöhnung neuer Kinder – Bericht', dauer: 10, erledigt: false },
      { titel: 'Jahresfest Planung (24. Juni)', dauer: 20, erledigt: false },
      { titel: 'Fragen & Wünsche der Eltern', dauer: 15, erledigt: false },
    ],
  },
  {
    id: 'e2',
    titel: 'Elternabend Gruppe Marienkäfer',
    datum: '15.04.2025', uhrzeit: '19:00', ort: 'Mehrzweckraum',
    status: 'abgeschlossen', eingeladen: 16, erschienen: 11, moderation: 'Hr. Schulze',
    beschluss: 'Eltern übernehmen Kuchenstand beim Sommerfest. Elternbeirat: Fam. Klein als Vorsitz wiedergewählt.',
    naechsterTermin: 'Oktober 2025',
    agenda: [
      { titel: 'Begrüßung', dauer: 5, erledigt: true },
      { titel: 'Entwicklungsstand Gruppen-Kinder', dauer: 20, erledigt: true },
      { titel: 'Allergien & Speiseplan Frühjahr', dauer: 10, erledigt: true },
      { titel: 'Sommerfest-Planung', dauer: 25, erledigt: true },
      { titel: 'Wahl Elternbeirat', dauer: 15, erledigt: true },
    ],
  },
  {
    id: 'e3',
    titel: 'Gesamt-Elternabend Kita',
    datum: '12.03.2025', uhrzeit: '18:00', ort: 'Turnhalle',
    status: 'abgeschlossen', eingeladen: 52, erschienen: 38, moderation: 'Leitung Fr. Jung',
    beschluss: 'Schließzeiten Sommer: 01.–12.08. Neue Bring-/Abholregelung ab Mai. Eltern stimmen Konzept-Update zu.',
    naechsterTermin: 'November 2025',
    agenda: [
      { titel: 'Jahresbericht Kita-Leitung', dauer: 20, erledigt: true },
      { titel: 'Schließzeiten & Ferienplanung', dauer: 15, erledigt: true },
      { titel: 'Konzept-Update 2025', dauer: 25, erledigt: true },
      { titel: 'Finanzbericht Elternbeirat', dauer: 10, erledigt: true },
      { titel: 'Diverses', dauer: 10, erledigt: true },
    ],
  },
]

function AnwesenheitsQuote({ erschienen, eingeladen }: { erschienen: number; eingeladen: number }) {
  if (erschienen === 0) return null
  const pct = Math.round((erschienen / eingeladen) * 100)
  const farbe = pct >= 75 ? 'bg-green-400' : pct >= 50 ? 'bg-orange-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-amber-100">
        <div className={`h-full rounded-full ${farbe}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] text-amber-600 shrink-0">{erschienen}/{eingeladen} ({pct}%)</span>
    </div>
  )
}

export default function ElternabenPage() {
  const [expanded, setExpanded] = useState<string | null>('e1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const geplant = INIT_ABENDE.filter(e => e.status === 'geplant').length
  const abgeschlossen = INIT_ABENDE.filter(e => e.status === 'abgeschlossen').length
  const naechster = INIT_ABENDE.find(e => e.status === 'geplant')

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Nächster Termin: "${naechster?.titel}" am ${naechster?.datum} um ${naechster?.uhrzeit}. Agenda enthält ${naechster?.agenda.length} Punkte (Gesamtdauer ca. ${naechster?.agenda.reduce((s,a)=>s+a.dauer,0)} Min). Empfehlung: Einladungen spätestens 10 Tage vorher versenden.`)
      setKiLaedt(false)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-500" /> Elternabende
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Termine · Protokolle · Anwesenheit</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Gesamt',        val: INIT_ABENDE.length, color: 'text-amber-700' },
          { label: 'Geplant',       val: geplant,            color: geplant > 0 ? 'text-blue-600' : 'text-gray-400' },
          { label: 'Abgeschlossen', val: abgeschlossen,      color: 'text-green-700' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Nächster Termin Banner */}
      {naechster && (
        <div className="rounded-2xl bg-blue-50 border border-blue-200 px-3 py-2.5 flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-800">{naechster.titel}</p>
            <p className="text-[10px] text-blue-600">{naechster.datum} · {naechster.uhrzeit} · {naechster.ort}</p>
          </div>
        </div>
      )}

      {/* KI */}
      {kiText ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[9px] font-bold text-amber-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Hinweis</p>
          <p className="text-xs text-amber-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Zusammenfassung'}
        </button>
      )}

      {/* Elternabende */}
      <div className="space-y-2">
        {INIT_ABENDE.map(e => {
          const sCfg = STATUS_CFG[e.status]
          const isOpen = expanded === e.id
          const erledigtAnzahl = e.agenda.filter(a => a.erledigt).length
          return (
            <div key={e.id} className={`rounded-2xl border ${sCfg.border} ${sCfg.bg} overflow-hidden`}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-90 transition-opacity">
                <CalendarDays className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{e.titel}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[9px] text-amber-600">{e.datum} · {e.uhrzeit}</span>
                    <span className="text-[9px] text-amber-500">{e.ort}</span>
                  </div>
                  <AnwesenheitsQuote erschienen={e.erschienen} eingeladen={e.eingeladen} />
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${sCfg.farbe} ${sCfg.bg}`}>{sCfg.label}</span>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-200/50 px-3 pb-3 pt-2 space-y-2.5">
                  <div className="flex items-center gap-2 text-[10px] text-amber-700">
                    <Clock className="w-3 h-3" /> Leitung: {e.moderation}
                    {e.status === 'abgeschlossen' && (
                      <span className="ml-auto font-semibold text-green-700 flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" /> {e.erschienen}/{e.eingeladen} anwesend
                      </span>
                    )}
                  </div>

                  {/* Agenda */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">Agenda</p>
                    {e.agenda.map((a, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {a.erledigt
                          ? <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                          : <div className="w-3 h-3 rounded-full border border-amber-300 mt-0.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] ${a.erledigt ? 'text-amber-600 line-through' : 'text-amber-900'}`}>{a.titel}</p>
                          {a.notiz && <p className="text-[9px] text-amber-500 italic">{a.notiz}</p>}
                        </div>
                        <span className="text-[9px] text-amber-500 shrink-0">{a.dauer} min</span>
                      </div>
                    ))}
                    <p className="text-[9px] text-amber-500 text-right">
                      Gesamt: {e.agenda.reduce((s,a)=>s+a.dauer,0)} Min · {erledigtAnzahl}/{e.agenda.length} erledigt
                    </p>
                  </div>

                  {e.beschluss && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-2 py-1.5">
                      <p className="text-[9px] font-bold text-green-700 mb-0.5 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Beschlüsse</p>
                      <p className="text-[10px] text-green-800">{e.beschluss}</p>
                    </div>
                  )}
                  {e.naechsterTermin && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-400" />
                      <p className="text-[10px] text-amber-700">Nächster Termin: {e.naechsterTermin}</p>
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
