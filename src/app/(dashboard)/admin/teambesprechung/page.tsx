'use client'

import { useState } from 'react'
import { MessageCircle, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star, AlertTriangle } from 'lucide-react'

// ── Teambesprechung — Mindry Kids Admin ───────────────────────────────────────
// Besprechungsplanung · Protokolle · Aufgaben · Beschlüsse

type BesprechungsTyp = 'teamkonferenz' | 'dienstbesprechung' | 'fallbesprechung' | 'elternteam' | 'traegergespraech'
type AufgabenStatus = 'offen' | 'in_bearbeitung' | 'erledigt'

interface TeamAufgabe {
  nr: string
  aufgabe: string
  person: string
  bis: string
  status: AufgabenStatus
}

interface BesprechungsEintrag {
  id: string
  typ: BesprechungsTyp
  datum: string
  uhrzeit: string
  leitung: string
  anwesend: string[]
  aufgaben: TeamAufgabe[]
  naechsterTermin?: string
  notiz?: string
}

const TYP_CFG: Record<BesprechungsTyp, { label: string; emoji: string; farbe: string }> = {
  teamkonferenz:   { label: 'Teamkonferenz',    emoji: '👥', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  dienstbesprechung:{ label: 'Dienstbesprechung', emoji: '📋', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  fallbesprechung: { label: 'Fallbesprechung',  emoji: '🔍', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  elternteam:      { label: 'Eltern-Team',       emoji: '👨‍👩‍👧', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  traegergespraech:{ label: 'Trägergespräch',   emoji: '🏢', farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
}

const AUFGABEN_STATUS: Record<AufgabenStatus, { label: string; farbe: string }> = {
  offen:         { label: 'Offen',          farbe: 'text-orange-500' },
  in_bearbeitung:{ label: 'In Bearb.',       farbe: 'text-blue-600' },
  erledigt:      { label: 'Erledigt',        farbe: 'text-green-600' },
}

const BESPRECHUNGEN: BesprechungsEintrag[] = [
  {
    id: 'tb1', typ: 'teamkonferenz',
    datum: '22.04.2026', uhrzeit: '14:00 Uhr', leitung: 'Kita-Leitung Fr. Maier',
    anwesend: ['Fr. Maier', 'Fr. Schmidt', 'Hr. Keller', 'Fr. Hofer', 'Fr. Braun'],
    naechsterTermin: '20.05.2026',
    aufgaben: [
      { nr: 'T-01', aufgabe: 'Hygieneplan Sommer aktualisieren', person: 'Fr. Schmidt', bis: '30.04.2026', status: 'offen' },
      { nr: 'T-02', aufgabe: 'Eingewöhnungsplan neues Kind (Max M.) erstellen', person: 'Hr. Keller', bis: '28.04.2026', status: 'in_bearbeitung' },
      { nr: 'T-03', aufgabe: 'Beobachtungsbögen Q2 fertigstellen', person: 'Alle ErzieherInnen', bis: '15.05.2026', status: 'offen' },
      { nr: 'T-04', aufgabe: 'Elternbrief Mai versenden', person: 'Fr. Maier', bis: '01.05.2026', status: 'erledigt' },
    ],
    notiz: 'Protokoll genehmigt. Nächste Besprechung: 20.05.2026.',
  },
  {
    id: 'tb2', typ: 'fallbesprechung',
    datum: '15.04.2026', uhrzeit: '15:30 Uhr', leitung: 'Fr. Maier + Frühförderstelle',
    anwesend: ['Fr. Maier', 'Hr. Keller', 'Fr. Vogel (FFS)'],
    aufgaben: [
      { nr: 'F-01', aufgabe: 'Förderbericht an Eltern weiterleiten', person: 'Fr. Maier', bis: '20.04.2026', status: 'erledigt' },
      { nr: 'F-02', aufgabe: 'Integrationsstunden beantragen (§ 35a SGB VIII)', person: 'Fr. Maier', bis: '30.04.2026', status: 'in_bearbeitung' },
    ],
    notiz: 'Vertraulich — nur für beteiligte Fachkräfte.',
  },
  {
    id: 'tb3', typ: 'dienstbesprechung',
    datum: '08.05.2026', uhrzeit: '13:00 Uhr', leitung: 'Fr. Maier',
    anwesend: [],
    aufgaben: [
      { nr: 'D-01', aufgabe: 'Sommerfest-Organisation besprechen', person: 'Team', bis: '08.05.2026', status: 'offen' },
      { nr: 'D-02', aufgabe: 'Urlaubsplanung Sommer klären', person: 'Alle', bis: '08.05.2026', status: 'offen' },
    ],
    notiz: 'Termin noch in Planung — Einladungen noch nicht raus!',
  },
]

export default function TeambesprechungPage() {
  const [expanded, setExpanded] = useState<string | null>('tb1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const offeneAufgaben = BESPRECHUNGEN.flatMap(b => b.aufgaben).filter(a => a.status !== 'erledigt').length
  const gesamtAufgaben = BESPRECHUNGEN.flatMap(b => b.aufgaben).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${BESPRECHUNGEN.length} Besprechungen, ${gesamtAufgaben} Aufgaben gesamt: ${offeneAufgaben} noch offen. T-01 Hygieneplan bis 30.04. dringend! F-02 Integrationsstunden § 35a laufen. Dienstbesprechung 08.05. noch ausstehend.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-teal-500" /> Teambesprechungen
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Protokolle · Aufgaben · Beschlüsse · Termine</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Besprechungen', val: BESPRECHUNGEN.length, color: 'text-teal-700' },
          { label: 'Aufgaben',      val: gesamtAufgaben,       color: 'text-blue-600' },
          { label: 'Offen',         val: offeneAufgaben,       color: offeneAufgaben > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {offeneAufgaben > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">{offeneAufgaben} Aufgaben noch offen oder in Bearbeitung.</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Teambesprechung</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Teambesprechung'}
        </button>
      )}

      <div className="space-y-2">
        {BESPRECHUNGEN.map(b => {
          const isOpen = expanded === b.id
          const tCfg = TYP_CFG[b.typ]
          const offen = b.aufgaben.filter(a => a.status !== 'erledigt').length
          return (
            <div key={b.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    {offen > 0 && <span className="text-[8px] text-orange-500 font-semibold">{offen} offen</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{b.datum} · {b.uhrzeit}</p>
                  <p className="text-[9px] text-teal-400">
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />{b.leitung}
                    {b.anwesend.length > 0 && ` · ${b.anwesend.length} Teiln.`}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {b.anwesend.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {b.anwesend.map(p => (
                        <span key={p} className="text-[8px] bg-teal-50 border border-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">{p}</span>
                      ))}
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Aufgaben</p>
                    {b.aufgaben.map(a => {
                      const aCfg = AUFGABEN_STATUS[a.status]
                      return (
                        <div key={a.nr} className="flex items-start gap-1.5 mb-1">
                          <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${a.status === 'erledigt' ? 'text-green-500' : 'text-gray-300'}`} />
                          <div className="flex-1">
                            <p className={`text-[9px] ${a.status === 'erledigt' ? 'line-through text-teal-300' : 'text-teal-800'}`}>
                              <strong>{a.nr}</strong>: {a.aufgabe}
                            </p>
                            <p className="text-[8px] text-teal-400">{a.person} · bis {a.bis} · <span className={aCfg.farbe}>{aCfg.label}</span></p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {b.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{b.notiz}</p>
                    </div>
                  )}
                  {b.naechsterTermin && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-blue-700 font-semibold">→ Nächste Besprechung: {b.naechsterTermin}</p>
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
