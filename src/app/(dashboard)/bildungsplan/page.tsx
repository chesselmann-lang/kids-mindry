'use client'

import { useState } from 'react'
import {
  BookOpen, CheckCircle2, Clock, ChevronDown, ChevronUp,
  Star, Target, Brain, Heart, Users, Music, Palette,
  Sun, Globe, Sparkles, Filter, BarChart3, Plus
} from 'lucide-react'

// ── Bildungsplan-Module NRW + Bayern ─────────────────────────────────────────
// Basierend auf:
//   NRW: Bildungsgrundsätze (2016, aktualisiert 2021)
//   Bayern: Bayerischer Bildungs- und Erziehungsplan (BEP, 7. Aufl. 2021)

type Bundesland = 'NRW' | 'Bayern' | 'allgemein'
type Bereich = 'sprache' | 'mathematik' | 'naturwissenschaft' | 'sozial' | 'kunst' | 'bewegung' | 'medien' | 'werteorientierung'
type Status = 'eingeführt' | 'in_umsetzung' | 'geplant'

interface BildungsplanModul {
  id: string
  titel: string
  bereich: Bereich
  bundesland: Bundesland
  altersgruppe: string
  lernziele: string[]
  aktivitaeten: string[]
  status: Status
  fortschritt: number // 0-100
  gesetzlicherBezug?: string
}

const BEREICH_CONFIG: Record<Bereich, { label: string; icon: React.ElementType; farbe: string }> = {
  sprache:            { label: 'Sprache & Literacy',       icon: BookOpen,  farbe: 'bg-blue-100 text-blue-700' },
  mathematik:         { label: 'Mathematik & Logik',       icon: Brain,     farbe: 'bg-purple-100 text-purple-700' },
  naturwissenschaft:  { label: 'Natur & Umwelt',           icon: Sun,       farbe: 'bg-emerald-100 text-emerald-700' },
  sozial:             { label: 'Soziale Kompetenzen',      icon: Heart,     farbe: 'bg-rose-100 text-rose-700' },
  kunst:              { label: 'Kunst & Kreativität',      icon: Palette,   farbe: 'bg-orange-100 text-orange-700' },
  bewegung:           { label: 'Bewegung & Gesundheit',    icon: Target,    farbe: 'bg-lime-100 text-lime-700' },
  medien:             { label: 'Medienbildung',            icon: Globe,     farbe: 'bg-cyan-100 text-cyan-700' },
  werteorientierung:  { label: 'Werte & Demokratie',       icon: Star,      farbe: 'bg-amber-100 text-amber-700' },
}

const STATUS_CONFIG: Record<Status, { label: string; farbe: string }> = {
  eingeführt:    { label: 'Eingeführt',    farbe: 'bg-emerald-100 text-emerald-700' },
  in_umsetzung:  { label: 'In Umsetzung', farbe: 'bg-blue-100 text-blue-700' },
  geplant:       { label: 'Geplant',      farbe: 'bg-gray-100 text-gray-600' },
}

const INIT_MODULE: BildungsplanModul[] = [
  {
    id: 'bp-nrw-sprache-1',
    titel: 'Sprachliche Bildung — Dialogisches Lesen',
    bereich: 'sprache',
    bundesland: 'NRW',
    altersgruppe: '3–6 Jahre',
    lernziele: [
      'Kinder erweitern ihren aktiven Wortschatz durch gemeinsames Lesen',
      'Entwicklung von Erzählkompetenz und narrativer Sprache',
      'Förderung der phonologischen Bewusstheit',
      'Interesse an Büchern und Schrift wecken',
    ],
    aktivitaeten: [
      'Tägliche Vorlese-Runden in Kleingruppen (15 Min.)',
      'Bilderbuch-Gespräche mit offenen Fragen',
      'Buchvorstellungen durch Kinder ("Buchpate")',
      'Sprachspiele: Reime, Silbenklatschen',
    ],
    status: 'eingeführt',
    fortschritt: 85,
    gesetzlicherBezug: 'Bildungsgrundsätze NRW 2016, Bildungsbereich 1: Sprache und Kommunikation',
  },
  {
    id: 'bp-nrw-math-1',
    titel: 'Mathematische Grundbildung — Mengen & Formen',
    bereich: 'mathematik',
    bundesland: 'NRW',
    altersgruppe: '2–6 Jahre',
    lernziele: [
      'Natürliche Zahlen von 1–10 benennen und zuordnen',
      'Geometrische Formen erkennen und benennen',
      'Mengenvergleiche (mehr/weniger/gleich viel)',
      'Grundlegendes Verständnis von Reihenfolgen und Mustern',
    ],
    aktivitaeten: [
      'Alltagsmathematik: Tisch decken, Früchte abzählen',
      'Formensortierspiele mit Holzklötzen',
      'Zählverse und Fingerspiele',
      'Mathe-Ecke mit manipulativem Material',
    ],
    status: 'eingeführt',
    fortschritt: 70,
    gesetzlicherBezug: 'Bildungsgrundsätze NRW 2016, Bildungsbereich 2: Mathematische Grunderfahrungen',
  },
  {
    id: 'bp-nrw-natur-1',
    titel: 'Natur & Wissenschaft — Forschergeist',
    bereich: 'naturwissenschaft',
    bundesland: 'NRW',
    altersgruppe: '3–6 Jahre',
    lernziele: [
      'Entdeckende und forschende Haltung gegenüber Naturphänomenen',
      'Naturwissenschaftliche Denkweise: beobachten, vermuten, überprüfen',
      'Jahreszeiten kennenlernen',
      'Umwelt- und Naturbewusstsein entwickeln',
    ],
    aktivitaeten: [
      'Kita-Garten: Aussäen, Wachsen beobachten, Ernten',
      'Experimente mit Wasser, Luft, Licht (mini-Forscherlabor)',
      'Naturwerkstatt: Basteln mit Naturmaterialien',
      'Wetterbeobachtungskalender im Gruppenraum',
    ],
    status: 'in_umsetzung',
    fortschritt: 55,
    gesetzlicherBezug: 'Bildungsgrundsätze NRW 2016, Bildungsbereich 3: Naturwissenschaftliche und technische Grunderfahrungen',
  },
  {
    id: 'bp-bay-sprache-1',
    titel: 'Sprachliche Bildung — Mehrsprachigkeit (BEP)',
    bereich: 'sprache',
    bundesland: 'Bayern',
    altersgruppe: '1–6 Jahre',
    lernziele: [
      'Wertschätzung der Muttersprachen aller Kinder',
      'Aufbau der deutschen Sprache als Bildungssprache',
      'Bilinguale Kompetenz fördern und anerkennen',
      'Eltern als Sprachpartner einbeziehen',
    ],
    aktivitaeten: [
      '"Mein Wort in deiner Sprache" — tägliche Begrüßung in Herkunftssprachen',
      'Mehrsprachige Bücher und Lieder in der Bibliothek',
      'Sprachportfolio je Kind (dreisprachig: DE/Herkunftssprache/EN)',
      'Elternabend: Sprache fördern zuhause',
    ],
    status: 'in_umsetzung',
    fortschritt: 40,
    gesetzlicherBezug: 'BEP Bayern 2021, Kap. 5: Sprachliche Bildung und Förderung',
  },
  {
    id: 'bp-bay-werte-1',
    titel: 'Werteorientierung & Religiosität (BEP)',
    bereich: 'werteorientierung',
    bundesland: 'Bayern',
    altersgruppe: '3–6 Jahre',
    lernziele: [
      'Grundlegende demokratische Werte erleben und reflektieren',
      'Interkulturelle Kompetenz und gegenseitiger Respekt',
      'Umgang mit Unterschieden (Religion, Kultur, Familie)',
      'Friedenserziehung und Konfliktlösungsstrategien',
    ],
    aktivitaeten: [
      'Gruppenregeln gemeinsam erarbeiten (Kinderkonferenz)',
      'Feste verschiedener Kulturen und Religionen kennenlernen',
      'Bilderbücher über Freundschaft, Fairness, Vielfalt',
      'Konfliktlösungsecke mit Gesprächsregeln (Friedenstreppe)',
    ],
    status: 'geplant',
    fortschritt: 15,
    gesetzlicherBezug: 'BEP Bayern 2021, Kap. 6: Werteorientierung und Religiosität',
  },
  {
    id: 'bp-allg-medien-1',
    titel: 'Digitale Bildung — Altersgemäße Mediennutzung',
    bereich: 'medien',
    bundesland: 'allgemein',
    altersgruppe: '4–6 Jahre',
    lernziele: [
      'Kritisch-reflektierter Umgang mit digitalen Medien',
      'Medien als Werkzeug: Fotos machen, Hörspiel aufnehmen',
      'Datenschutzbewusstsein altersgerecht einführen',
      'Digitale Kreativität (Stop-Motion, Hörbücher)',
    ],
    aktivitaeten: [
      'Tablet-AG: Fotos für das Kita-Portfolio',
      'Hörspiel selbst aufnehmen und anhören',
      '"Wir im Internet" — Gesprächsrunde ab 5 J.',
      'Medienerziehungs-Elternabend (jährlich)',
    ],
    status: 'geplant',
    fortschritt: 10,
    gesetzlicherBezug: 'KMK-Strategie Bildung in der digitalen Welt (2021), Kita-Bereich',
  },
]

function ModulKarte({ modul }: { modul: BildungsplanModul }) {
  const [expanded, setExpanded] = useState(false)
  const bereich = BEREICH_CONFIG[modul.bereich]
  const status = STATUS_CONFIG[modul.status]

  return (
    <div className="rounded-2xl border bg-white overflow-hidden transition-shadow hover:shadow-sm" style={{ borderColor: 'var(--color-border, #e5e7eb)' }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className={`rounded-xl p-2 shrink-0 ${bereich.farbe}`}>
              <bereich.icon size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 leading-snug">{modul.titel}</h3>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{modul.bundesland}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{modul.altersgruppe}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.farbe}`}>{status.label}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="shrink-0 text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Fortschrittsbalken */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${modul.fortschritt}%`,
                background: modul.fortschritt >= 70 ? '#10b981' : modul.fortschritt >= 40 ? '#3b82f6' : '#d1d5db',
              }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 w-10 text-right">{modul.fortschritt}%</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-5 pb-5 pt-4 space-y-4" style={{ borderColor: 'var(--color-border, #e5e7eb)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Lernziele</p>
            <ul className="space-y-1.5">
              {modul.lernziele.map((z) => (
                <li key={z} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                  {z}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Aktivitäten & Methoden</p>
            <ul className="space-y-1.5">
              {modul.aktivitaeten.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-gray-600">
                  <Sparkles size={13} className="mt-0.5 shrink-0 text-amber-400" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
          {modul.gesetzlicherBezug && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Rechtlicher / Curricula-Bezug</p>
              <p className="text-xs text-blue-600">{modul.gesetzlicherBezug}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BildungsplanPage() {
  const [filter, setFilter] = useState<Bundesland | 'alle'>('alle')
  const [bereichFilter, setBereichFilter] = useState<Bereich | 'alle'>('alle')

  const filtered = INIT_MODULE.filter((m) => {
    if (filter !== 'alle' && m.bundesland !== filter) return false
    if (bereichFilter !== 'alle' && m.bereich !== bereichFilter) return false
    return true
  })

  const stats = {
    eingeführt:   INIT_MODULE.filter(m => m.status === 'eingeführt').length,
    in_umsetzung: INIT_MODULE.filter(m => m.status === 'in_umsetzung').length,
    geplant:      INIT_MODULE.filter(m => m.status === 'geplant').length,
    gesamt:       INIT_MODULE.length,
  }

  return (
    <div className="min-h-screen p-5 md:p-8" style={{ background: 'var(--color-bg, #f9fafb)' }}>
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bildungsplan-Module</h1>
              <p className="text-sm text-gray-500 mt-0.5">NRW Bildungsgrundsätze · Bayerischer BEP · KMK-Strategie 2021</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-orange-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-orange-600 transition">
              <Plus size={16} /> Modul hinzufügen
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Module gesamt', wert: stats.gesamt, farbe: 'text-gray-700' },
              { label: 'Eingeführt',    wert: stats.eingeführt,   farbe: 'text-emerald-600' },
              { label: 'In Umsetzung',  wert: stats.in_umsetzung, farbe: 'text-blue-600' },
              { label: 'Geplant',       wert: stats.geplant,      farbe: 'text-gray-500' },
            ].map(({ label, wert, farbe }) => (
              <div key={label} className="rounded-xl border bg-white p-3 text-center" style={{ borderColor: 'var(--color-border, #e5e7eb)' }}>
                <p className={`text-2xl font-black ${farbe}`}>{wert}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500 mr-1">
              <Filter size={12} /> Bundesland:
            </div>
            {(['alle', 'NRW', 'Bayern', 'allgemein'] as const).map((bl) => (
              <button
                key={bl}
                onClick={() => setFilter(bl)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${filter === bl ? 'bg-orange-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
              >
                {bl === 'alle' ? 'Alle Bundesländer' : bl === 'allgemein' ? 'Bundesweit' : bl}
              </button>
            ))}
            <div className="ml-3 flex items-center gap-1 text-xs text-gray-500 mr-1">
              <BarChart3 size={12} /> Bereich:
            </div>
            {(['alle', ...Object.keys(BEREICH_CONFIG)] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBereichFilter(b as Bereich | 'alle')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${bereichFilter === b ? 'bg-blue-500 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
                style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
              >
                {b === 'alle' ? 'Alle Bereiche' : BEREICH_CONFIG[b as Bereich].label}
              </button>
            ))}
          </div>
        </div>

        {/* Module Liste */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
              <p>Keine Module für diesen Filter.</p>
            </div>
          ) : (
            filtered.map((m) => <ModulKarte key={m.id} modul={m} />)
          )}
        </div>

        {/* Info-Box Rechtliches */}
        <div className="mt-8 rounded-2xl border bg-blue-50 border-blue-200 p-5">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <BookOpen size={16} /> Rechtliche Grundlagen
          </h3>
          <ul className="space-y-1.5 text-sm text-blue-700">
            <li>• NRW: <em>Bildungsgrundsätze für Kinder von 0–10 Jahren</em> (Fassung 2021, §13 KiBiz)</li>
            <li>• Bayern: <em>Bayerischer Bildungs- und Erziehungsplan</em> (7. Aufl. 2021, Art. 19 BayKiBiG)</li>
            <li>• §22a SGB VIII: Bildung, Erziehung und Betreuung; Förderung durch Qualitätsentwicklung</li>
            <li>• KMK-Strategie <em>Bildung in der digitalen Welt</em> (Beschluss 08.12.2016, i.d.F. 2021)</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
