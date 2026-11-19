'use client'

import { useState } from 'react'
import { BadgeCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Qualitätssicherung — kids-mindry ──────────────────────────────────────────
// Qualitätssicherung · KTK-Gütesiegel · Selbstevaluation · Konzeptarbeit

type QSBereich = 'konzeptarbeit' | 'evaluation' | 'personal' | 'elternbeteiligung' | 'sicherheit' | 'bildungsarbeit' | 'zertifizierung'
type QSStatus = 'abgeschlossen' | 'laufend' | 'geplant' | 'ueberfaellig'

interface QSMassnahme {
  id: string
  bereich: QSBereich
  titel: string
  status: QSStatus
  verantwortlich: string
  rhythmus: string
  naechstes?: string
  kriterien: string[]
  ergebnis?: string
}

const BEREICH_CFG: Record<QSBereich, { label: string; emoji: string; farbe: string }> = {
  konzeptarbeit:   { label: 'Konzeptarbeit',    emoji: '📋', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  evaluation:      { label: 'Evaluation',       emoji: '📊', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  personal:        { label: 'Personalentw.',    emoji: '👥', farbe: 'bg-green-50 text-green-700 border-green-200' },
  elternbeteiligung:{ label: 'Elternbeteiligung',emoji: '👪', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  sicherheit:      { label: 'Sicherheit',       emoji: '🛡️', farbe: 'bg-red-50 text-red-700 border-red-200' },
  bildungsarbeit:  { label: 'Bildungsarbeit',   emoji: '🌱', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  zertifizierung:  { label: 'Zertifizierung',   emoji: '🏆', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
}

const STATUS_CFG: Record<QSStatus, { label: string; farbe: string; dot: string }> = {
  abgeschlossen:{ label: 'Abgeschlossen', farbe: 'text-green-600',  dot: 'bg-green-400' },
  laufend:      { label: 'Laufend',       farbe: 'text-blue-500',   dot: 'bg-blue-400' },
  geplant:      { label: 'Geplant',       farbe: 'text-teal-500',   dot: 'bg-teal-400' },
  ueberfaellig: { label: 'Überfällig!',   farbe: 'text-red-600',    dot: 'bg-red-400' },
}

const MASSNAHMEN: QSMassnahme[] = [
  {
    id: 'qs1', bereich: 'evaluation', titel: 'Jährliche Selbstevaluation (KTK-Qualitätshandbuch)',
    status: 'laufend', verantwortlich: 'Leitung + Team', rhythmus: 'Jährlich (Mai–Jun)',
    naechstes: 'Abschlusssitzung 10.06.2026',
    kriterien: ['Konzept, Beobachtung, Bildungsdoku', 'Team-Zufriedenheit + Fortbildungsstand', 'Elternzufriedenheit (Fragebogen)', 'Raumqualität + Materialaustattung'],
    ergebnis: 'Vorjahr: 82/100 Punkten (sehr gut)',
  },
  {
    id: 'qs2', bereich: 'zertifizierung', titel: 'KTK-Gütesiegel Verlängerung',
    status: 'geplant', verantwortlich: 'Leitung', rhythmus: 'Alle 3 Jahre',
    naechstes: 'Antrag bis 01.09.2026',
    kriterien: ['Freiwillige Selbstverpflichtung', 'Externe Auditierung durch KTK', 'Mindestpunktzahl 70/100', 'Nachweis: Teamentwicklung + Fortbildungen'],
  },
  {
    id: 'qs3', bereich: 'personal', titel: 'Mitarbeitergespräche + Fortbildungsplanung',
    status: 'laufend', verantwortlich: 'Leitung', rhythmus: '2× jährlich',
    naechstes: 'Nächste Runde: Jun 2026',
    kriterien: ['Strukturierter Gesprächsleitfaden', 'Fortbildungsportfolio pro MA aktuell', 'Mindest-Fortbildung: 20h/Jahr (TVöD)', 'Ergebnisse: vertraulich + dokumentiert'],
  },
  {
    id: 'qs4', bereich: 'elternbeteiligung', titel: 'Elternbefragung + Elternbeirat',
    status: 'abgeschlossen', verantwortlich: 'Leitung + Elternbeirat', rhythmus: 'Jährlich',
    kriterien: ['Fragebogen: 85% Rücklauf (Apr 2026)', 'Top-Ergebnisse: Eingewöhnung + Kommunikation', 'Verbesserungswunsch: Öffnungszeiten', 'Elternbeiratssitzung: Protokoll 15.04.2026'],
    ergebnis: 'Gesamtzufriedenheit: 4.3/5.0',
  },
  {
    id: 'qs5', bereich: 'sicherheit', titel: 'Sicherheitsbegehung + Gefährdungsanalyse',
    status: 'ueberfaellig', verantwortlich: 'Leitung + Träger', rhythmus: 'Jährlich',
    naechstes: 'DRINGEND: Begehung buchen!',
    kriterien: ['Letzte Begehung: Apr 2025 (überfällig)', 'Brandschutzbeauftragter: neu benennen', 'Erste-Hilfe-Kurs: 2 MA noch ausstehend', 'Fluchtwegplan: aktualisiert Jan 2026'],
  },
  {
    id: 'qs6', bereich: 'bildungsarbeit', titel: 'Bildungsdokumentation Qualitätscheck',
    status: 'laufend', verantwortlich: 'Alle Erzieher:innen', rhythmus: 'Quartalsweise',
    naechstes: 'Review: 30.06.2026',
    kriterien: ['Learning Stories: min. 1/Kind/Monat', 'Portfolio-Stand: vollständig bei allen', 'Beobachtungsbögen: BaSiK aktuell', 'Entwicklungsgespräche: 2× jährlich'],
  },
]

export default function QualitaetssicherungPage() {
  const [expanded, setExpanded] = useState<string | null>('qs5')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const laufend = MASSNAHMEN.filter(m => m.status === 'laufend').length
  const ueberfaellig = MASSNAHMEN.filter(m => m.status === 'ueberfaellig').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${MASSNAHMEN.length} QS-Maßnahmen, ${laufend} laufend, ${ueberfaellig} überfällig. DRINGEND: Sicherheitsbegehung buchen! KTK-Antrag bis 01.09. Selbstevaluation Abschluss 10.06. Elternbefragung: 4.3/5.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24 text-teal-900">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-teal-500" /> Qualitätssicherung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">KTK-Gütesiegel · Evaluation · Personal · Sicherheit</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Maßnahmen',  val: MASSNAHMEN.length, color: 'text-teal-700' },
          { label: 'Laufend',    val: laufend,           color: 'text-blue-500' },
          { label: 'Überfällig', val: ueberfaellig,      color: ueberfaellig > 0 ? 'text-red-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {MASSNAHMEN.some(m => m.status === 'ueberfaellig') && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-[10px] text-red-700 font-semibold">Sicherheitsbegehung überfällig (letzte: Apr 2025) — sofort Termin buchen!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-QS-Übersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-QS-Übersicht'}
        </button>
      )}

      <div className="space-y-2">
        {MASSNAHMEN.map(m => {
          const isOpen = expanded === m.id
          const bCfg = BEREICH_CFG[m.bereich]
          const sCfg = STATUS_CFG[m.status]
          return (
            <div key={m.id} className={`rounded-2xl overflow-hidden ${m.status === 'ueberfaellig' ? 'border border-red-200 bg-white' : 'border border-teal-100 bg-white'}`}>
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 bg-white flex items-center justify-center shrink-0 text-lg">
                  {bCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bCfg.farbe}`}>{bCfg.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{m.titel}</p>
                  <p className="text-[9px] text-teal-400">{m.verantwortlich} · {m.rhythmus}{m.naechstes ? ` · ${m.naechstes}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {m.ergebnis && (
                    <p className="text-[9px] font-semibold text-teal-600">Ergebnis: {m.ergebnis}</p>
                  )}
                  <div>
                    {m.kriterien.map((k, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-teal-500" />
                        <p className="text-[9px] text-teal-800">{k}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
