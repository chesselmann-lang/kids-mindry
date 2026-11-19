'use client'

import { useState } from 'react'
import { CalendarDays, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star } from 'lucide-react'

// ── Wochenplan — Mindry Kids Admin ───────────────────────────────────────────
// Wochenplanung Kita · Angebote · Projekte · Vorbereitung

type AngebotKategorie = 'bewegung' | 'kreativ' | 'sprache' | 'natur' | 'musik' | 'soziales' | 'kognitiv' | 'alltagsleben'
type Wochentag = 'mo' | 'di' | 'mi' | 'do' | 'fr'

interface TagesAngebot {
  uhrzeit: string
  dauer: number
  kategorie: AngebotKategorie
  titel: string
  gruppe: string
  material?: string[]
  ziel: string
  durchgefuehrt?: boolean
}

interface Wochentag_Entry {
  tag: Wochentag
  label: string
  morgenkreisThema: string
  angebote: TagesAngebot[]
  notiz?: string
}

const KAT_CFG: Record<AngebotKategorie, { emoji: string; farbe: string }> = {
  bewegung:     { emoji: '🏃', farbe: 'bg-green-50 text-green-700' },
  kreativ:      { emoji: '🎨', farbe: 'bg-pink-50 text-pink-700' },
  sprache:      { emoji: '💬', farbe: 'bg-blue-50 text-blue-700' },
  natur:        { emoji: '🌱', farbe: 'bg-lime-50 text-lime-700' },
  musik:        { emoji: '🎵', farbe: 'bg-purple-50 text-purple-700' },
  soziales:     { emoji: '🤝', farbe: 'bg-orange-50 text-orange-700' },
  kognitiv:     { emoji: '🧩', farbe: 'bg-indigo-50 text-indigo-700' },
  alltagsleben: { emoji: '🏠', farbe: 'bg-amber-50 text-amber-700' },
}

const WOCHE: Wochentag_Entry[] = [
  {
    tag: 'mo', label: 'Montag 27.04.',
    morgenkreisThema: 'Wochenstart: Was haben wir am Wochenende erlebt?',
    angebote: [
      { uhrzeit: '09:30', dauer: 30, kategorie: 'sprache', titel: 'Bilderbuch-Vorlesezeit "Der Regenbogenfisch"', gruppe: 'Schmetterlinge', ziel: 'Sprachverständnis, Empathie', durchgefuehrt: false, material: ['Buch', 'Stofftier Fisch'] },
      { uhrzeit: '10:00', dauer: 45, kategorie: 'kreativ', titel: 'Frühlingscollagen basteln', gruppe: 'Alle', ziel: 'Feinmotorik, Kreativität', durchgefuehrt: false, material: ['Tonpapier', 'Wolle', 'Klebstoff', 'Schere'] },
      { uhrzeit: '14:30', dauer: 20, kategorie: 'bewegung', titel: 'Bewegungsgeschichte "Die Reise durch den Wald"', gruppe: 'Schmetterlinge', ziel: 'Körperwahrnehmung, Fantasie', durchgefuehrt: false },
    ],
  },
  {
    tag: 'di', label: 'Dienstag 28.04.',
    morgenkreisThema: 'Thema Frühling: Was beobachten wir draußen?',
    angebote: [
      { uhrzeit: '09:30', dauer: 45, kategorie: 'natur', titel: 'Gartenbeobachtung: Insekten suchen + zeichnen', gruppe: 'Alle', ziel: 'Naturwissen, Neugier', durchgefuehrt: false, material: ['Lupen', 'Zeichenblöcke', 'Buntstifte'] },
      { uhrzeit: '10:30', dauer: 30, kategorie: 'kognitiv', titel: 'Mengenspiel: Sortieren + Zählen', gruppe: 'Schmetterlinge', ziel: 'Mengenverständnis, Konzentration', durchgefuehrt: false, material: ['Naturmaterialien', 'Behälter'] },
      { uhrzeit: '14:00', dauer: 25, kategorie: 'musik', titel: 'Frühlingslied einüben für Elternfest', gruppe: 'Alle', ziel: 'Rhythmusgefühl, Gemeinschaft', durchgefuehrt: false },
    ],
    notiz: 'Praktikantin Sophie begleitet Gartenbeobachtung',
  },
  {
    tag: 'mi', label: 'Mittwoch 29.04.',
    morgenkreisThema: 'Gefühlsbarometer: Wie geht es mir heute?',
    angebote: [
      { uhrzeit: '09:30', dauer: 30, kategorie: 'soziales', titel: 'Konfliktlösung: Rollenspiel am Beispiel "Spielzeug teilen"', gruppe: 'Schmetterlinge', ziel: 'Empathie, Konfliktlösung', durchgefuehrt: false },
      { uhrzeit: '10:15', dauer: 60, kategorie: 'kreativ', titel: 'Malen mit Wasserfarben: "Mein liebster Ort"', gruppe: 'Alle', ziel: 'Ausdrucksmöglichkeiten, Selbstreflexion', durchgefuehrt: false, material: ['Wasserfarben', 'Pinsel', 'Wasserkrüge'] },
    ],
  },
  {
    tag: 'do', label: 'Donnerstag 30.04.',
    morgenkreisThema: 'Wir lernen: Straßenverkehr und Sicherheit',
    angebote: [
      { uhrzeit: '09:30', dauer: 45, kategorie: 'alltagsleben', titel: 'Verkehrserziehung: Ampelfarben und Zebrastreifen', gruppe: 'Alle', ziel: 'Sicherheitsverhalten, Regelverständnis', durchgefuehrt: false, material: ['Ampelkarten', 'Rollenspiel-Materialien'] },
      { uhrzeit: '10:30', dauer: 30, kategorie: 'sprache', titel: 'Sprachspiel: Reime finden', gruppe: 'Schmetterlinge', ziel: 'Phonologische Bewusstheit', durchgefuehrt: false },
      { uhrzeit: '15:00', dauer: 20, kategorie: 'bewegung', titel: 'Tanzen: Kindertanz zum Elternfest', gruppe: 'Alle', ziel: 'Körperkoordination, Ausdruckstanz', durchgefuehrt: false },
    ],
  },
  {
    tag: 'fr', label: 'Freitag 01.05.',
    morgenkreisThema: 'Wochenrückblick: Was war schön diese Woche?',
    angebote: [
      { uhrzeit: '09:30', dauer: 45, kategorie: 'natur', titel: 'Frühlingsspaziergang im Park', gruppe: 'Alle', ziel: 'Naturbeobachtung, Bewegung', durchgefuehrt: false, material: ['Wetterjacken', 'Sammelkörbe'] },
      { uhrzeit: '11:00', dauer: 30, kategorie: 'soziales', titel: 'Freie Spielzeit + Gesprächsrunden', gruppe: 'Alle', ziel: 'Selbstständigkeit, soziale Kompetenz', durchgefuehrt: false },
    ],
    notiz: '1. Mai — Feiertag: Kita geschlossen!',
  },
]

export default function WochenplanPage() {
  const [tagIdx, setTagIdx] = useState(0)
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const tag = WOCHE[tagIdx]
  const gesamtAngebote = WOCHE.flatMap(w => w.angebote).length
  const kategorienAbgedeckt = new Set(WOCHE.flatMap(w => w.angebote.map(a => a.kategorie))).size

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Wochenplanung KW 18: ${gesamtAngebote} Angebote über ${kategorienAbgedeckt} Bildungsbereiche. Freitag 01.05. Feiertag — Kita geschlossen! Tanztanz für Elternfest wird Do vorbereitet. Schwerpunkt diese Woche: Frühling + Natur.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-teal-500" /> Wochenplan
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">KW 18 · Pädagogische Angebote · Vorbereitung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Angebote',  val: gesamtAngebote,         color: 'text-teal-700' },
          { label: 'Bereiche',  val: `${kategorienAbgedeckt}/8`, color: 'text-indigo-600' },
          { label: 'Tage',      val: WOCHE.length,            color: 'text-teal-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Wochenplan-Tipps</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Wochenplan-Tipps'}
        </button>
      )}

      {/* Tag-Tabs */}
      <div className="flex gap-1 flex-wrap">
        {WOCHE.map((w, i) => (
          <button key={i} onClick={() => setTagIdx(i)}
            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-colors ${i === tagIdx ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600 border border-teal-100'}`}>
            {w.tag.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
        <div className="px-3 py-2.5 bg-teal-50">
          <p className="text-xs font-bold text-teal-900">{tag.label}</p>
          <p className="text-[9px] text-teal-600 mt-0.5">🌅 Morgenkreis: {tag.morgenkreisThema}</p>
          {tag.notiz && <p className="text-[9px] text-amber-700 mt-0.5 font-semibold"><Star className="w-2.5 h-2.5 inline mr-0.5" />{tag.notiz}</p>}
        </div>

        <div className="divide-y divide-teal-100">
          {tag.angebote.map((a, i) => {
            const katCfg = KAT_CFG[a.kategorie]
            return (
              <div key={i} className="px-3 py-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 shrink-0 mt-0.5">
                    <p className="text-[8px] font-bold text-teal-500">{a.uhrzeit}</p>
                    <p className="text-[7px] text-teal-400">{a.dauer} Min</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{katCfg.emoji}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${katCfg.farbe}`}>{a.kategorie}</span>
                      {a.durchgefuehrt && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    </div>
                    <p className="text-[10px] font-semibold text-teal-900">{a.titel}</p>
                    <p className="text-[8px] text-teal-400">Gruppe: {a.gruppe} · Ziel: {a.ziel}</p>
                    {a.material && <p className="text-[8px] text-indigo-500 mt-0.5">📦 {a.material.join(', ')}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
