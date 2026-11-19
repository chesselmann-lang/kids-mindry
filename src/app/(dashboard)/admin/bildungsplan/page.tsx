'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react'

// ── Bildungsplan — kids-mindry ─────────────────────────────────────────────────
// Bildungsplan NRW · Bildungsbereiche · KiBiz · Projektplanung

type BildungsBereich = 'sprache' | 'bewegung' | 'sozial' | 'kuenstlerisch' | 'natur' | 'medien' | 'mathematik'
type PlanStatus = 'aktiv' | 'planung' | 'abgeschlossen' | 'jaehrlich'

interface BildungsProjekt {
  id: string
  bereich: BildungsBereich
  titel: string
  status: PlanStatus
  gruppe: string
  zeitraum: string
  verantwortlich: string
  lernziele: string[]
  materialien?: string
  rechtsgrundlage?: string
}

const BEREICH_CFG: Record<BildungsBereich, { label: string; emoji: string; farbe: string }> = {
  sprache:      { label: 'Sprache & Literacy', emoji: '💬', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  bewegung:     { label: 'Körper & Bewegung',  emoji: '🏃', farbe: 'bg-green-50 text-green-700 border-green-200' },
  sozial:       { label: 'Soziale & kult. Welt',emoji: '🤝', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kuenstlerisch:{ label: 'Künstlerisch-kreativ',emoji: '🎨', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  natur:        { label: 'Natur & Naturwiss.',  emoji: '🌿', farbe: 'bg-lime-50 text-lime-700 border-lime-200' },
  medien:       { label: 'Medien',              emoji: '📱', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  mathematik:   { label: 'Math. Grunderfahrungen',emoji: '🔢', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
}

const STATUS_CFG: Record<PlanStatus, { label: string; farbe: string; dot: string }> = {
  aktiv:        { label: 'Aktiv',        farbe: 'text-green-600', dot: 'bg-green-400' },
  planung:      { label: 'In Planung',   farbe: 'text-blue-500',  dot: 'bg-blue-400' },
  abgeschlossen:{ label: 'Abgeschlossen',farbe: 'text-gray-400',  dot: 'bg-gray-300' },
  jaehrlich:    { label: 'Jährlich',     farbe: 'text-teal-600',  dot: 'bg-teal-400' },
}

const PROJEKTE: BildungsProjekt[] = [
  {
    id: 'bp1', bereich: 'natur', titel: 'Projekt: "Wir entdecken den Frühling"',
    status: 'aktiv', gruppe: 'Ü3 alle Gruppen', zeitraum: 'Apr–Mai 2026',
    verantwortlich: 'Fr. Müller + Fr. Schmidt',
    lernziele: ['Naturphänomene entdecken + benennen', 'Insekten, Blumen, Wachstum beobachten', 'Naturtagebuch führen (Zeichnungen)', 'Wetter-Station täglich ablesen'],
    materialien: 'Lupen, Pflanzenkarten, Erde + Töpfe',
    rechtsgrundlage: 'KiBiz Bildungsbereich Natur (§13)',
  },
  {
    id: 'bp2', bereich: 'sprache', titel: 'Sprachförderung Alltagsintegriert (alltagsintegrierte sprachliche Bildung)',
    status: 'jaehrlich', gruppe: 'Alle Kinder', zeitraum: 'Ganzjährig',
    verantwortlich: 'Alle Erzieher:innen',
    lernziele: ['Sprachbegleitung in allen Situationen', 'Dialoge + Erzählungen aktiv fördern', 'Bücher + Bilderbücher täglich', 'Fingerspiele + Reime in Routine'],
    rechtsgrundlage: 'KiBiz §13 + Delfin-4 Screening',
  },
  {
    id: 'bp3', bereich: 'bewegung', titel: 'Bewegungsbaustelle — wöchentliches Projekt',
    status: 'aktiv', gruppe: 'U3 + Ü3', zeitraum: 'Laufend (Di 9–10 Uhr)',
    verantwortlich: 'Hr. Weber',
    lernziele: ['Grob- + Feinmotorik strukturiert fördern', 'Körperwahrnehmung + Balance', 'Regelspiele + freie Exploration', 'Psychomotorik: Materialerfahrung'],
    materialien: 'Turnhalle: Schaumstoffwürfel, Seile, Reifen',
  },
  {
    id: 'bp4', bereich: 'kuenstlerisch', titel: 'Atelier-Tag: Freies Gestalten',
    status: 'jaehrlich', gruppe: 'Alle Kinder', zeitraum: 'Jeden Donnerstag',
    verantwortlich: 'Fr. Schmidt (Atelierverantwortliche)',
    lernziele: ['Farb- + Formerkundung', 'Freier Ausdruck ohne Vorlage', 'Werkzeugnutzung (Schere, Pinsel)', 'Portfoliofotos nach jeder Einheit'],
    materialien: 'Wasser- + Fingerfarbe, Ton, Collagematerial',
  },
  {
    id: 'bp5', bereich: 'mathematik', titel: 'Zahlen-Forscherkiste (Ü3)',
    status: 'aktiv', gruppe: 'Ü3 Schulstarter', zeitraum: 'Jan–Jun 2026',
    verantwortlich: 'Fr. Müller',
    lernziele: ['Zählen bis 20 spielerisch', 'Mengenvergleich + Muster erkennen', 'Formen + Geometrie im Alltag', 'Vorschulvorbereitung Mathematik'],
    materialien: 'Zählsteine, Sortierspiele, Würfel, Abakus',
  },
  {
    id: 'bp6', bereich: 'sozial', titel: 'Demokratie-Projekt: "Unser Kita-Rat"',
    status: 'planung', gruppe: 'Ü3 ab 4 Jahre', zeitraum: 'Sep 2026 (geplant)',
    verantwortlich: 'Fr. Müller + Leitung',
    lernziele: ['Abstimmungsregeln + demokratische Entscheidungen', 'Kinderparlament 1× monatlich', 'Eigene Wünsche + Ideen formulieren', 'Partizipation als Bildungsrecht'],
    rechtsgrundlage: 'KiBiz §13 + UN-Kinderrechtskonvention Art. 12',
  },
]

export default function BildungsplanPage() {
  const [expanded, setExpanded] = useState<string | null>('bp1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = PROJEKTE.filter(p => p.status === 'aktiv' || p.status === 'jaehrlich').length
  const planung = PROJEKTE.filter(p => p.status === 'planung').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PROJEKTE.length} Bildungsprojekte, ${aktiv} aktiv/laufend, ${planung} in Planung. Frühlings-Projekt läuft Apr–Mai. Zahlenforscherkiste bis Jun. Kita-Rat geplant Sep 2026. Atelier-Tag Do wöchentlich.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24 text-teal-900">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-500" /> Bildungsplan
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Bildungsbereiche · Projekte · KiBiz §13 · Alltagsintegriert</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Projekte',  val: PROJEKTE.length, color: 'text-teal-700' },
          { label: 'Aktiv',     val: aktiv,           color: 'text-green-600' },
          { label: 'Planung',   val: planung,         color: 'text-blue-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Bildungsplanübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Bildungsplanübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {PROJEKTE.map(p => {
          const isOpen = expanded === p.id
          const bCfg = BEREICH_CFG[p.bereich]
          const sCfg = STATUS_CFG[p.status]
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
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
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{p.titel}</p>
                  <p className="text-[9px] text-teal-400">{p.gruppe} · {p.zeitraum} · {p.verantwortlich}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {p.rechtsgrundlage && (
                    <p className="text-[8px] font-semibold text-teal-500">{p.rechtsgrundlage}</p>
                  )}
                  <div>
                    {p.lernziele.map((z, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-teal-500" />
                        <p className="text-[9px] text-teal-800">{z}</p>
                      </div>
                    ))}
                  </div>
                  {p.materialien && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg px-2 py-1">
                      <p className="text-[8px] text-teal-600">🧰 {p.materialien}</p>
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
