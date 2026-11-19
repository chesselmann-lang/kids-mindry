'use client'

import { useState } from 'react'
import { Utensils, ChevronDown, ChevronUp, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'

// ── Mahlzeiten & Speiseplan — Mindry Kids ─────────────────────────────────────
// Wochenspeiseplan · Allergene · Bestellübersicht · DGE-konform

type MahlzeitTyp = 'fruehstueck' | 'mittagessen' | 'vesper'
type Allergen = 'A' | 'C' | 'D' | 'G' | 'H' | 'L' | 'N' | 'R'
type BestellStatus = 'bestellt' | 'nicht_bestellt' | 'alternativ'

interface Gericht {
  name: string
  beschreibung: string
  allergene: Allergen[]
  vegetarisch: boolean
  vegan: boolean
  kcal?: number
}

interface MahlzeitTag {
  datum: string
  wochentag: string
  mahlzeiten: Record<MahlzeitTyp, Gericht>
  bestellungen: number
  alternativBestellungen: number
}

const ALLERGEN_CFG: Record<Allergen, { label: string; color: string }> = {
  A: { label: 'Gluten',        color: 'bg-yellow-100 text-yellow-800' },
  C: { label: 'Sellerie',      color: 'bg-green-100 text-green-800' },
  D: { label: 'Milch',         color: 'bg-blue-100 text-blue-800' },
  G: { label: 'Ei',            color: 'bg-orange-100 text-orange-800' },
  H: { label: 'Sesam',         color: 'bg-amber-100 text-amber-800' },
  L: { label: 'Senf',          color: 'bg-yellow-200 text-yellow-900' },
  N: { label: 'Nüsse',         color: 'bg-red-100 text-red-800' },
  R: { label: 'Krebstiere',    color: 'bg-pink-100 text-pink-800' },
}

const TYP_CFG: Record<MahlzeitTyp, { label: string; emoji: string; zeit: string }> = {
  fruehstueck: { label: 'Frühstück',  emoji: '🍳', zeit: '07:30–09:00' },
  mittagessen: { label: 'Mittagessen',emoji: '🍽️', zeit: '11:30–13:00' },
  vesper:      { label: 'Vesper',     emoji: '🍎', zeit: '14:30–15:00' },
}

const WOCHE: MahlzeitTag[] = [
  {
    datum: 'Mo, 28. Apr.', wochentag: 'Montag', bestellungen: 22, alternativBestellungen: 3,
    mahlzeiten: {
      fruehstueck: { name: 'Vollkornbrot & Obst',   beschreibung: 'Vollkornscheiben, Quark, Apfelspalten, Banane', allergene: ['A','D'], vegetarisch: true, vegan: false },
      mittagessen: { name: 'Spaghetti Bolognese',    beschreibung: 'Nudeln mit Tomatensauce und Rinderhack, Parmesan', allergene: ['A','D','G'], vegetarisch: false, vegan: false, kcal: 520 },
      vesper:      { name: 'Joghurt & Müsli',         beschreibung: 'Naturjoghurt mit Haferflocken und Beeren', allergene: ['A','D'], vegetarisch: true, vegan: false },
    },
  },
  {
    datum: 'Di, 29. Apr.', wochentag: 'Dienstag', bestellungen: 24, alternativBestellungen: 2,
    mahlzeiten: {
      fruehstueck: { name: 'Porridge',               beschreibung: 'Warmer Haferbrei mit Apfelstücken und Zimt', allergene: ['A','D'], vegetarisch: true, vegan: false },
      mittagessen: { name: 'Gemüsesuppe & Brot',     beschreibung: 'Herzhaft: Kartoffel-Karottensuppe, Vollkornbrot', allergene: ['A','C'], vegetarisch: true, vegan: true, kcal: 380 },
      vesper:      { name: 'Obstteller',              beschreibung: 'Saisonales Obst gemischt, keine Allergene', allergene: [], vegetarisch: true, vegan: true },
    },
  },
  {
    datum: 'Mi, 30. Apr.', wochentag: 'Mittwoch', bestellungen: 20, alternativBestellungen: 4,
    mahlzeiten: {
      fruehstueck: { name: 'Müsli & Milch',          beschreibung: 'Knuspermüsli mit Vollmilch oder Hafermilch', allergene: ['A','D','N'], vegetarisch: true, vegan: false },
      mittagessen: { name: 'Fischstäbchen & Kartoffeln', beschreibung: 'Panierte Seelachsfilets, Kartoffelpüree, Erbsen', allergene: ['A','D','G','R'], vegetarisch: false, vegan: false, kcal: 490 },
      vesper:      { name: 'Rohkost-Teller',          beschreibung: 'Karotten, Gurken, Paprika mit Kräuterquark', allergene: ['D'], vegetarisch: true, vegan: false },
    },
  },
  {
    datum: 'Do, 1. Mai', wochentag: 'Donnerstag (Feiertag)', bestellungen: 0, alternativBestellungen: 0,
    mahlzeiten: {
      fruehstueck: { name: '— Kita geschlossen —', beschreibung: 'Tag der Arbeit', allergene: [], vegetarisch: true, vegan: true },
      mittagessen: { name: '— Kita geschlossen —', beschreibung: '', allergene: [], vegetarisch: true, vegan: true },
      vesper:      { name: '— Kita geschlossen —', beschreibung: '', allergene: [], vegetarisch: true, vegan: true },
    },
  },
  {
    datum: 'Fr, 2. Mai', wochentag: 'Freitag', bestellungen: 21, alternativBestellungen: 2,
    mahlzeiten: {
      fruehstueck: { name: 'Brezeln & Aufschnitt',   beschreibung: 'Laugenbrezel, Käse, Gurke, Tomate', allergene: ['A','D'], vegetarisch: true, vegan: false },
      mittagessen: { name: 'Pizza Margherita',        beschreibung: 'Hausgemachte Pizza, Tomatensauce, Mozzarella, Basilikum', allergene: ['A','D','G'], vegetarisch: true, vegan: false, kcal: 440 },
      vesper:      { name: 'Smoothie & Kekse',        beschreibung: 'Frucht-Smoothie, Dinkelkekse', allergene: ['A','D','G'], vegetarisch: true, vegan: false },
    },
  },
]

export default function MahlzeitenPage() {
  const [expanded, setExpanded] = useState<string | null>('Di, 29. Apr.')
  const [aktiverTyp, setAktiverTyp] = useState<MahlzeitTyp>('mittagessen')
  const [kiText, setKiText] = useState<string | null>(null)
  const [kiLaedt, setKiLaedt] = useState(false)

  const gesamtBestellungen = WOCHE.reduce((s, t) => s + t.bestellungen, 0)
  const nutzerMitAllergie = 5 // aus Allergien-Modul

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`Speiseplan KW 18: ${WOCHE.filter(t=>t.bestellungen>0).length} Kita-Tage, ${gesamtBestellungen} Mahlzeiten bestellt. Do geschlossen (Feiertag). Achtung: ${nutzerMitAllergie} Kinder mit Allergien — Mi Fischstäbchen (R+G), Mo/Fr Nüsse beachten. DGE-Ausgewogenheit: 2 vegetarische Mittagessen, 1 vegane Option. Empfehlung: Freitag Pizza → alternatives Hauptgericht für Leon (Erdnuss-Allergie-Kind) prüfen.`)
      setKiLaedt(false)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-amber-500" /> Mahlzeiten & Speiseplan
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">KW 18 · 28. Apr.–2. Mai 2025 · DGE-konform</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bestellungen', val: gesamtBestellungen,     color: 'text-amber-700' },
          { label: 'Ø / Tag',      val: Math.round(gesamtBestellungen/4), color: 'text-amber-700' },
          { label: 'Allergiker',   val: nutzerMitAllergie,      color: 'text-red-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Mahlzeit-Typ Tabs */}
      <div className="flex gap-2">
        {(Object.keys(TYP_CFG) as MahlzeitTyp[]).map(t => (
          <button key={t} onClick={() => setAktiverTyp(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              aktiverTyp === t ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {TYP_CFG[t].emoji} {TYP_CFG[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {WOCHE.map(tag => {
          const gericht = tag.mahlzeiten[aktiverTyp]
          const isOpen = expanded === tag.datum
          const isFeiertag = tag.bestellungen === 0
          return (
            <div key={tag.datum} className={`rounded-2xl border bg-white overflow-hidden ${isFeiertag ? 'opacity-50' : 'border-amber-100'}`}>
              <button onClick={() => !isFeiertag && setExpanded(isOpen ? null : tag.datum)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-amber-50/50 transition-colors">
                <span className="text-base shrink-0">{isFeiertag ? '🏖️' : TYP_CFG[aktiverTyp].emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{tag.datum}</p>
                  <p className="text-[9px] text-amber-600 truncate">{gericht.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isFeiertag && (
                    <span className="text-[9px] text-amber-600">{tag.bestellungen} Best.</span>
                  )}
                  {gericht.vegetarisch && !gericht.vegan && <span className="text-[9px] bg-green-50 text-green-700 px-1.5 rounded-full border border-green-200">🥦</span>}
                  {gericht.vegan && <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 rounded-full border border-teal-200">🌱</span>}
                </div>
                {!isFeiertag && (isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-300" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-300" />)}
              </button>

              {isOpen && (
                <div className="border-t border-amber-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-xs text-amber-900">{gericht.beschreibung}</p>
                  {gericht.kcal && <p className="text-[9px] text-amber-600">🔥 {gericht.kcal} kcal</p>}
                  {gericht.allergene.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold text-amber-700 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Allergene:
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {gericht.allergene.map(a => (
                          <span key={a} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ALLERGEN_CFG[a].color}`}>
                            {a} – {ALLERGEN_CFG[a].label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {gericht.allergene.length === 0 && (
                    <p className="text-[9px] text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Keine Hauptallergene</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {kiText ? (
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
          <p className="text-[10px] font-bold flex items-center gap-1 mb-1 text-amber-700"><Sparkles className="w-3 h-3" /> KI-Ernährungsübersicht</p>
          <p className="text-xs leading-relaxed text-amber-900">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Ernährungsübersicht'}
        </button>
      )}
    </div>
  )
}
