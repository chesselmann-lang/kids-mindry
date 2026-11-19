'use client'

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Star } from 'lucide-react'

// ── Konzepte — Mindry Kids Admin ──────────────────────────────────────────────
// Pädagogische Konzepte · Leitbild · Konzeptpflege · §45 SGB VIII

type KonzeptTyp = 'paedagogik' | 'schutz' | 'hygiene' | 'ernaehrung' | 'inklusion' | 'qualitaet' | 'sprache' | 'eingewoehnung'
type KonzeptStatus = 'aktuell' | 'ueberarbeitung' | 'veraltet' | 'neu'

interface KonzeptKapitel {
  titel: string
  seitenzahl: number
  letzteAktualisierung: string
}

interface Konzept {
  id: string
  typ: KonzeptTyp
  titel: string
  version: string
  letzte_ueberarbeitung: string
  naechste_ueberarbeitung: string
  verantwortlich: string
  status: KonzeptStatus
  kapitel: KonzeptKapitel[]
  notiz?: string
}

const TYP_CFG: Record<KonzeptTyp, { label: string; emoji: string; farbe: string }> = {
  paedagogik:    { label: 'Pädagogik',     emoji: '🎓', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  schutz:        { label: 'Kinderschutz',  emoji: '🛡️', farbe: 'bg-red-50 text-red-700 border-red-200' },
  hygiene:       { label: 'Hygiene',       emoji: '🧼', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  ernaehrung:    { label: 'Ernährung',     emoji: '🥗', farbe: 'bg-green-50 text-green-700 border-green-200' },
  inklusion:     { label: 'Inklusion',     emoji: '🤝', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  qualitaet:     { label: 'Qualität',      emoji: '⭐', farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  sprache:       { label: 'Sprache',       emoji: '💬', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  eingewoehnung: { label: 'Eingewöhnung',  emoji: '🌱', farbe: 'bg-lime-50 text-lime-700 border-lime-200' },
}

const STATUS_CFG: Record<KonzeptStatus, { label: string; farbe: string; bg: string }> = {
  aktuell:        { label: 'Aktuell',        farbe: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  ueberarbeitung: { label: 'In Überarbeitung',farbe: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  veraltet:       { label: 'Veraltet',        farbe: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  neu:            { label: 'Neu erstellt',    farbe: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
}

const KONZEPTE: Konzept[] = [
  {
    id: 'k1', typ: 'paedagogik', status: 'aktuell',
    titel: 'Pädagogisches Konzept der Kita',
    version: '3.2', letzte_ueberarbeitung: '01.09.2025', naechste_ueberarbeitung: '01.09.2026',
    verantwortlich: 'Frau Keller (Kita-Leitung)',
    kapitel: [
      { titel: 'Leitbild & Werte',        seitenzahl: 4,  letzteAktualisierung: '01.09.2025' },
      { titel: 'Situationsansatz',        seitenzahl: 6,  letzteAktualisierung: '01.09.2025' },
      { titel: 'Bildungsbereiche',        seitenzahl: 12, letzteAktualisierung: '01.09.2025' },
      { titel: 'Beobachtung & Doku',      seitenzahl: 5,  letzteAktualisierung: '01.09.2025' },
      { titel: 'Elternpartnerschaft',     seitenzahl: 4,  letzteAktualisierung: '01.09.2025' },
    ],
    notiz: 'Nächste Revision: Sprachförderkonzept erweitern (BiSS-Transfer)',
  },
  {
    id: 'k2', typ: 'schutz', status: 'aktuell',
    titel: 'Kinderschutzkonzept §8a SGB VIII',
    version: '2.1', letzte_ueberarbeitung: '15.01.2026', naechste_ueberarbeitung: '15.01.2027',
    verantwortlich: 'Frau Keller + externer Kinderschutzbeauftragter',
    kapitel: [
      { titel: 'Risikoanalyse',           seitenzahl: 3,  letzteAktualisierung: '15.01.2026' },
      { titel: 'Handlungsleitfaden §8a',  seitenzahl: 6,  letzteAktualisierung: '15.01.2026' },
      { titel: 'Meldewege',               seitenzahl: 2,  letzteAktualisierung: '15.01.2026' },
      { titel: 'Präventionsmaßnahmen',    seitenzahl: 5,  letzteAktualisierung: '15.01.2026' },
    ],
  },
  {
    id: 'k3', typ: 'sprache', status: 'ueberarbeitung',
    titel: 'Sprachförderkonzept nach BayBEP',
    version: '1.8', letzte_ueberarbeitung: '01.06.2024', naechste_ueberarbeitung: '01.06.2025',
    verantwortlich: 'Fr. Reiter (Sprachförderkraft)',
    kapitel: [
      { titel: 'Sprachstandsdiagnostik',  seitenzahl: 4,  letzteAktualisierung: '01.06.2024' },
      { titel: 'Fördermaßnahmen',         seitenzahl: 8,  letzteAktualisierung: '01.06.2024' },
      { titel: 'Alltagsintegrierte Förderung', seitenzahl: 5, letzteAktualisierung: '01.06.2024' },
    ],
    notiz: 'Überarbeitung läuft — neue DaZ-Leitlinien integrieren',
  },
  {
    id: 'k4', typ: 'ernaehrung', status: 'aktuell',
    titel: 'Ernährungskonzept & Speiseplan-Grundsätze',
    version: '2.0', letzte_ueberarbeitung: '01.03.2026', naechste_ueberarbeitung: '01.03.2027',
    verantwortlich: 'Fr. Huber (Hauswirtschaft)',
    kapitel: [
      { titel: 'Vollwerternährung DGE',   seitenzahl: 3,  letzteAktualisierung: '01.03.2026' },
      { titel: 'Allergien & Intoleranzen',seitenzahl: 4,  letzteAktualisierung: '01.03.2026' },
      { titel: 'Mahlzeiten-Rituale',      seitenzahl: 2,  letzteAktualisierung: '01.03.2026' },
    ],
  },
]

export default function KonzeptePage() {
  const [expanded, setExpanded] = useState<string | null>('k1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const veraltet = KONZEPTE.filter(k => k.status === 'veraltet').length
  const ueberarbeitung = KONZEPTE.filter(k => k.status === 'ueberarbeitung').length
  const gesamtSeiten = KONZEPTE.flatMap(k => k.kapitel).reduce((s, kap) => s + kap.seitenzahl, 0)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${KONZEPTE.length} Konzepte (${gesamtSeiten} Seiten gesamt). ${ueberarbeitung} in Überarbeitung — Sprachförderkonzept überfällig: neue DaZ-Leitlinien integrieren. Kinderschutzkonzept aktuell. Alle Konzepte 2027 zur Revision fällig.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-500" /> Pädagogische Konzepte
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Konzeptpflege · Leitbild · §45 SGB VIII</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Konzepte',       val: KONZEPTE.length, color: 'text-teal-700' },
          { label: 'In Überarb.',    val: ueberarbeitung,  color: ueberarbeitung > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Seiten ges.',    val: gesamtSeiten,    color: 'text-indigo-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {(veraltet > 0 || ueberarbeitung > 0) && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">{ueberarbeitung} Konzept(e) in Überarbeitung — Abschluss koordinieren!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Konzept-Übersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Konzept-Übersicht'}
        </button>
      )}

      <div className="space-y-2">
        {KONZEPTE.map(k => {
          const isOpen = expanded === k.id
          const typCfg = TYP_CFG[k.typ]
          const statusCfg = STATUS_CFG[k.status]
          const totalSeiten = k.kapitel.reduce((s, kap) => s + kap.seitenzahl, 0)
          return (
            <div key={k.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {typCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${typCfg.farbe}`}>{typCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${statusCfg.farbe}`}>{statusCfg.label}</span>
                    <span className="text-[8px] text-teal-400">v{k.version}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{k.titel}</p>
                  <p className="text-[9px] text-teal-400 mt-0.5">
                    <Clock className="w-2.5 h-2.5 inline mr-0.5" />Rev. {k.letzte_ueberarbeitung} · Nächste: {k.naechste_ueberarbeitung} · {totalSeiten} Seiten
                  </p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-500">Verantwortlich: {k.verantwortlich}</p>

                  {k.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{k.notiz}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Kapitel</p>
                    {k.kapitel.map((kap, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                        <p className="text-[9px] text-teal-900 flex-1">{kap.titel}</p>
                        <span className="text-[8px] text-teal-400">{kap.seitenzahl}S</span>
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
