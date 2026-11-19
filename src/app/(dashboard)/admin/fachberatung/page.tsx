'use client'

import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star, AlertTriangle } from 'lucide-react'

// ── Fachberatung — Mindry Kids Admin ─────────────────────────────────────────
// Fachberatung · Förderschwerpunkte · Beratungsfälle · §22a KiTaG

type BeratungsBereich = 'sprache' | 'motorik' | 'sozialEmotional' | 'kognition' | 'inklusion' | 'ernaehrung' | 'bindung'
type BeratungsStatus = 'aktiv' | 'abgeschlossen' | 'wartend' | 'weitergeleitet'

interface BeratungsSchritt {
  aktion: string
  datum: string
  erledigt?: boolean
}

interface BeratungsFall {
  id: string
  bereich: BeratungsBereich
  kind: string
  gruppe: string
  alter: string
  datum: string
  status: BeratungsStatus
  beraterin?: string
  beobachtung: string
  schritte: BeratungsSchritt[]
  ergebnis?: string
  vertraulich?: boolean
  notiz?: string
}

const BEREICH_CFG: Record<BeratungsBereich, { label: string; emoji: string; farbe: string }> = {
  sprache:         { label: 'Sprachentwicklung', emoji: '💬', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  motorik:         { label: 'Motorik',           emoji: '🏃', farbe: 'bg-green-50 text-green-700 border-green-200' },
  sozialEmotional: { label: 'Sozial-emotional',  emoji: '❤️', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  kognition:       { label: 'Kognition',         emoji: '🧠', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  inklusion:       { label: 'Inklusion',         emoji: '🌈', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ernaehrung:      { label: 'Ernährung',          emoji: '🥗', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  bindung:         { label: 'Bindung/Trauma',    emoji: '🤲', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
}

const STATUS_CFG: Record<BeratungsStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',          farbe: 'text-blue-600' },
  abgeschlossen:  { label: 'Abgeschlossen',  farbe: 'text-green-600' },
  wartend:        { label: 'Wartend',        farbe: 'text-orange-500' },
  weitergeleitet: { label: 'Weitergeleitet', farbe: 'text-purple-600' },
}

const FAELLE: BeratungsFall[] = [
  {
    id: 'fb1', bereich: 'sprache', kind: 'Kind A (3 J.)', gruppe: 'Schmetterlinge',
    alter: '3 Jahre', datum: '01.04.2026', status: 'aktiv',
    beraterin: 'Logopädin Fr. Baum (extern)',
    beobachtung: 'Kaum aktiver Wortschatz, deutliche Rückstände bei Satzbildung. Versteht einfache Anweisungen.',
    schritte: [
      { aktion: 'Elterngespräch — Beobachtungen mitteilen', datum: '03.04.2026', erledigt: true },
      { aktion: 'Überweisung zu Logopädie', datum: '08.04.2026', erledigt: true },
      { aktion: 'Sprachförderprogramm in Gruppe starten', datum: '14.04.2026', erledigt: true },
      { aktion: 'Verlaufsbericht nach 6 Wochen', datum: '26.05.2026', erledigt: false },
    ],
    vertraulich: true,
    notiz: 'Eltern sind offen, kooperieren gut.',
  },
  {
    id: 'fb2', bereich: 'sozialEmotional', kind: 'Kind B (4 J.)', gruppe: 'Sterne',
    alter: '4 Jahre', datum: '15.04.2026', status: 'wartend',
    beobachtung: 'Häufige Wutausbrüche, Schwierigkeiten beim Teilen und Abwarten. Kein auffälliges Verhalten zu Hause laut Eltern.',
    schritte: [
      { aktion: 'Beobachtungsdokumentation erstellen', datum: '15.04.2026', erledigt: true },
      { aktion: 'Elterngespräch vereinbaren', datum: '24.04.2026', erledigt: false },
      { aktion: 'Beratung Fachberaterin Jugendamt', datum: '30.04.2026', erledigt: false },
    ],
    notiz: 'Elterngespräch noch nicht stattgefunden — Termin setzen!',
  },
  {
    id: 'fb3', bereich: 'inklusion', kind: 'Kind C (5 J.)', gruppe: 'Regenbogen',
    alter: '5 Jahre', datum: '01.02.2026', status: 'abgeschlossen',
    beraterin: 'Heilpädagogin Fr. Stern',
    beobachtung: 'Diagnose Trisomie 21. Integrationsplatz bewilligt. Anpassung der Gruppenroutinen erforderlich.',
    schritte: [
      { aktion: 'Eingliederungshilfeantrag stellen', datum: '01.02.2026', erledigt: true },
      { aktion: 'Heilpädagogische Fachkraft beantragen', datum: '10.02.2026', erledigt: true },
      { aktion: 'Förderplan erstellen', datum: '01.03.2026', erledigt: true },
      { aktion: 'Halbjährliche Evaluation', datum: '01.09.2026', erledigt: false },
    ],
    ergebnis: 'Integrationsplatz bewilligt, Fr. Stern seit März im Einsatz. Kind gut integriert.',
  },
]

export default function FachberatungPage() {
  const [expanded, setExpanded] = useState<string | null>('fb1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = FAELLE.filter(f => f.status === 'aktiv' || f.status === 'wartend').length
  const offeneSchritte = FAELLE.flatMap(f => f.schritte).filter(s => !s.erledigt).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${FAELLE.length} Beratungsfälle: ${aktiv} aktiv/wartend, ${offeneSchritte} offene Schritte. Kind B — Elterngespräch noch nicht erfolgt! Inklusionsfall C gut abgeschlossen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-teal-500" /> Fachberatung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Förderung · Inklusion · Fachberatungsfälle · §22a KiTaG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Fälle',          val: FAELLE.length,   color: 'text-teal-700' },
          { label: 'Aktiv',          val: aktiv,            color: aktiv > 0 ? 'text-blue-600' : 'text-gray-400' },
          { label: 'Offen. Schr.',   val: offeneSchritte,   color: offeneSchritte > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {FAELLE.some(f => f.notiz?.includes('!')) && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">Offene Punkte in Beratungsfällen — Hinweise beachten.</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Beratungsübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Beratungsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {FAELLE.map(f => {
          const isOpen = expanded === f.id
          const bCfg = BEREICH_CFG[f.bereich]
          const sCfg = STATUS_CFG[f.status]
          const done = f.schritte.filter(s => s.erledigt).length
          return (
            <div key={f.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : f.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    {f.vertraulich && <span className="text-[8px] text-gray-400">🔒</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{f.kind} · {f.gruppe}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{f.datum} · {done}/{f.schritte.length} Schr.</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-700 leading-relaxed">{f.beobachtung}</p>
                  {f.beraterin && <p className="text-[8px] text-teal-400">Fachberatung: {f.beraterin}</p>}
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Schritte</p>
                    {f.schritte.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-0.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${s.erledigt ? 'text-green-500' : 'text-gray-300'}`} />
                        <div>
                          <p className={`text-[9px] ${s.erledigt ? 'line-through text-teal-300' : 'text-teal-800'}`}>{s.aktion}</p>
                          <p className="text-[8px] text-teal-400">{s.datum}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {f.ergebnis && (
                    <div className="bg-green-50 border border-green-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-green-700 font-semibold">✓ {f.ergebnis}</p>
                    </div>
                  )}
                  {f.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{f.notiz}</p>
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
