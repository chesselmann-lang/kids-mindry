'use client'

import { useState } from 'react'
import { Flag, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star, AlertTriangle } from 'lucide-react'

// ── Beschwerdemanagement — Mindry Kids Admin ──────────────────────────────────
// Beschwerden · Rückmeldungen · Bearbeitung · §45 SGB VIII QM

type BeschwerdeKategorie = 'eltern' | 'kind' | 'personal' | 'traeger' | 'behoerde' | 'extern'
type BeschwerdeStatus = 'eingegangen' | 'in_bearbeitung' | 'abgeschlossen' | 'weitergeleitet'
type Dringlichkeit = 'hoch' | 'normal' | 'gering'

interface BeschwerdeSchritt {
  aktion: string
  datum: string
  person: string
  erledigt?: boolean
}

interface BeschwerdeEintrag {
  id: string
  kategorie: BeschwerdeKategorie
  datum: string
  einreicherin: string
  betreff: string
  dringlichkeit: Dringlichkeit
  status: BeschwerdeStatus
  schritte: BeschwerdeSchritt[]
  ergebnis?: string
  anonym?: boolean
  notiz?: string
}

const KAT_CFG: Record<BeschwerdeKategorie, { label: string; emoji: string; farbe: string }> = {
  eltern:   { label: 'Eltern',     emoji: '👨‍👩‍👧', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  kind:     { label: 'Kind',       emoji: '🧒', farbe: 'bg-green-50 text-green-700 border-green-200' },
  personal: { label: 'Personal',   emoji: '👥', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  traeger:  { label: 'Träger',     emoji: '🏢', farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
  behoerde: { label: 'Behörde',    emoji: '🏛️', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  extern:   { label: 'Extern',     emoji: '📋', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
}

const STATUS_CFG: Record<BeschwerdeStatus, { label: string; farbe: string }> = {
  eingegangen:    { label: 'Eingegangen',    farbe: 'text-orange-500' },
  in_bearbeitung: { label: 'In Bearbeitung', farbe: 'text-blue-600' },
  abgeschlossen:  { label: 'Abgeschlossen',  farbe: 'text-green-600' },
  weitergeleitet: { label: 'Weitergeleitet', farbe: 'text-purple-600' },
}

const DRINGL_FARBE: Record<Dringlichkeit, string> = {
  hoch:   'text-red-600 font-bold',
  normal: 'text-gray-500',
  gering: 'text-gray-400',
}

const BESCHWERDEN: BeschwerdeEintrag[] = [
  {
    id: 'bm1', kategorie: 'eltern', datum: '21.04.2026',
    einreicherin: 'Familie Müller', dringlichkeit: 'hoch', status: 'in_bearbeitung',
    betreff: 'Unzufriedenheit mit Eingewöhnungsablauf — Kind weint täglich beim Abschied.',
    schritte: [
      { aktion: 'Eingangsbestätigung + Gesprächsangebot', datum: '22.04.2026', person: 'Fr. Maier', erledigt: true },
      { aktion: 'Gespräch Familie Müller + Erzieherin Hr. Keller', datum: '25.04.2026', person: 'Fr. Maier', erledigt: true },
      { aktion: 'Angepasster Eingewöhnungsplan erstellen', datum: '28.04.2026', person: 'Hr. Keller' },
      { aktion: 'Rückmeldung Familie nach 2 Wochen', datum: '12.05.2026', person: 'Fr. Maier' },
    ],
    notiz: 'Eltern wünschen intensivere Eingewöhnung.',
  },
  {
    id: 'bm2', kategorie: 'personal', datum: '14.04.2026',
    einreicherin: 'Anonym (Mitarbeiter)', dringlichkeit: 'normal', status: 'abgeschlossen',
    betreff: 'Unklare Dienstplanverteilung — zu viele Spätdienste bei einzelnen Personen.',
    schritte: [
      { aktion: 'Beschwerde aufgenommen + Anonymität gesichert', datum: '14.04.2026', person: 'Fr. Maier', erledigt: true },
      { aktion: 'Dienstplananalyse letzte 3 Monate', datum: '16.04.2026', person: 'Fr. Maier', erledigt: true },
      { aktion: 'Teambesprechung Dienstplan-Fairness', datum: '22.04.2026', person: 'Fr. Maier', erledigt: true },
    ],
    ergebnis: 'Dienstplan angepasst. Verteilung jetzt gleichmäßiger. Mitarbeiter informiert.',
    anonym: true,
  },
  {
    id: 'bm3', kategorie: 'eltern', datum: '23.04.2026',
    einreicherin: 'Familie Schmidt', dringlichkeit: 'hoch', status: 'eingegangen',
    betreff: 'Vorwurf: Kind wurde von anderem Kind gebissen — unzureichende Aufsicht.',
    schritte: [
      { aktion: 'Eingangsbestätigung versenden', datum: '23.04.2026', person: 'Fr. Maier' },
      { aktion: 'Vorfall mit beteiligten ErzieherInnen klären', datum: '24.04.2026', person: 'Fr. Maier' },
      { aktion: 'Gespräch beide Familien (getrennt)', datum: '27.04.2026', person: 'Fr. Maier' },
    ],
    notiz: 'Dringend — Aufsichtspflichtverletzungs-Vorwurf! Dokumentation sichern.',
  },
]

export default function BeschwerdemanagementPage() {
  const [expanded, setExpanded] = useState<string | null>('bm3')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const offen = BESCHWERDEN.filter(b => b.status !== 'abgeschlossen').length
  const hoch = BESCHWERDEN.filter(b => b.dringlichkeit === 'hoch' && b.status !== 'abgeschlossen').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${BESCHWERDEN.length} Beschwerden: ${offen} noch offen, ${hoch} mit hoher Dringlichkeit. Aufsichtspflicht-Vorwurf (Familie Schmidt) — sofort bearbeiten! Eingewöhnung Müller läuft.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Flag className="w-6 h-6 text-teal-500" /> Beschwerdemanagement
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Beschwerden · Rückmeldungen · §45 SGB VIII · Qualitätssicherung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Beschwerden', val: BESCHWERDEN.length, color: 'text-teal-700' },
          { label: 'Offen',       val: offen,               color: offen > 0 ? 'text-orange-500' : 'text-gray-400' },
          { label: 'Dringend',    val: hoch,                color: hoch > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {hoch > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-bold">{hoch} dringende Beschwerde(n) — sofort bearbeiten!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Beschwerdeübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Beschwerdeübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {BESCHWERDEN.map(b => {
          const isOpen = expanded === b.id
          const kCfg = KAT_CFG[b.kategorie]
          const sCfg = STATUS_CFG[b.status]
          const done = b.schritte.filter(s => s.erledigt).length
          return (
            <div key={b.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {kCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${kCfg.farbe}`}>{kCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                    <span className={`text-[8px] ${DRINGL_FARBE[b.dringlichkeit]}`}>{b.dringlichkeit === 'hoch' ? '🔴 Dringend' : ''}</span>
                    {b.anonym && <span className="text-[8px] text-gray-400">🔒 Anonym</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{b.betreff}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{b.datum} · {b.einreicherin} · {done}/{b.schritte.length} Schr.</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Bearbeitungsschritte</p>
                    {b.schritte.map((s, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-0.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 mt-0.5 ${s.erledigt ? 'text-green-500' : 'text-gray-300'}`} />
                        <div className="flex-1">
                          <p className={`text-[9px] ${s.erledigt ? 'line-through text-teal-300' : 'text-teal-800'}`}>{s.aktion}</p>
                          <p className="text-[8px] text-teal-400">{s.datum} · {s.person}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {b.ergebnis && (
                    <div className="bg-green-50 border border-green-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-green-700 font-semibold">✓ Ergebnis: {b.ergebnis}</p>
                    </div>
                  )}
                  {b.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{b.notiz}</p>
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
