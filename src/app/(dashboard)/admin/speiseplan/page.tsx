'use client'

import { useState } from 'react'
import { Utensils, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star, AlertTriangle } from 'lucide-react'

// ── Speiseplan — Mindry Kids Admin ───────────────────────────────────────────
// Speiseplan · Wochentage · Allergene · Vegetarisch · Bestellungen

type Wochentag = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr'
type GerichtTyp = 'fleisch' | 'vegetarisch' | 'vegan' | 'fisch'

interface Allergen { kuerzel: string; name: string }
interface Gericht {
  name: string
  typ: GerichtTyp
  kalorien?: number
  allergene?: string[]
  bio?: boolean
}

interface Tagesplan {
  tag: Wochentag
  hauptgericht: Gericht
  beilage?: string
  dessert?: string
  suppe?: string
  bestellungen?: number
  notiz?: string
}

const TYP_CFG: Record<GerichtTyp, { label: string; emoji: string; farbe: string }> = {
  fleisch:      { label: 'Fleisch',      emoji: '🍖', farbe: 'text-orange-700' },
  vegetarisch:  { label: 'Vegetarisch',  emoji: '🥦', farbe: 'text-green-700' },
  vegan:        { label: 'Vegan',        emoji: '🌱', farbe: 'text-teal-700' },
  fisch:        { label: 'Fisch',        emoji: '🐟', farbe: 'text-blue-700' },
}

const ALLERGENE: Allergen[] = [
  { kuerzel: 'A', name: 'Gluten' }, { kuerzel: 'C', name: 'Eier' },
  { kuerzel: 'D', name: 'Milch' }, { kuerzel: 'F', name: 'Soja' },
  { kuerzel: 'L', name: 'Sellerie' }, { kuerzel: 'N', name: 'Nüsse' },
]

const WOCHENPLAN: Tagesplan[] = [
  {
    tag: 'Mo', bestellungen: 34,
    hauptgericht: { name: 'Spaghetti Bolognese', typ: 'fleisch', kalorien: 620, allergene: ['A', 'C'], bio: false },
    beilage: 'Gemischter Salat', dessert: 'Apfelmus',
  },
  {
    tag: 'Di', bestellungen: 28,
    hauptgericht: { name: 'Gemüse-Curry mit Reis', typ: 'vegan', kalorien: 520, allergene: ['F', 'L'], bio: true },
    beilage: 'Naan-Brot', dessert: 'Joghurt',
    notiz: 'Nüsse-Alternativ für allergische Kinder: Kürbiskerne.',
  },
  {
    tag: 'Mi', bestellungen: 31,
    suppe: 'Tomatensuppe',
    hauptgericht: { name: 'Fischstäbchen mit Kartoffelpüree', typ: 'fisch', kalorien: 580, allergene: ['A', 'D', 'C'] },
    dessert: 'Obstsalat',
  },
  {
    tag: 'Do', bestellungen: 35,
    hauptgericht: { name: 'Linsensuppe mit Brot', typ: 'vegetarisch', kalorien: 490, allergene: ['A', 'L'], bio: true },
    beilage: 'Vollkornbrot', dessert: 'Vanillepudding',
  },
  {
    tag: 'Fr', bestellungen: 22,
    hauptgericht: { name: 'Pizza Margherita', typ: 'vegetarisch', kalorien: 640, allergene: ['A', 'D'], bio: false },
    beilage: 'Rohkost', dessert: 'Fruchteis',
    notiz: 'Freitag reduzierte Bestellzahlen — normaler Wert.',
  },
]

const WOCHENTAGE: Wochentag[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr']

export default function SpeiseplanPage() {
  const [filterTag, setFilterTag] = useState<Wochentag>('Mo')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gesamtBestellungen = WOCHENPLAN.reduce((s, t) => s + (t.bestellungen || 0), 0)
  const bioTage = WOCHENPLAN.filter(t => t.hauptgericht.bio).length
  const vegTage = WOCHENPLAN.filter(t => t.hauptgericht.typ === 'vegetarisch' || t.hauptgericht.typ === 'vegan').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`KW 18: ${gesamtBestellungen} Bestellungen gesamt. ${vegTage} vegetarische/vegane Tage. ${bioTage} Bio-Gerichte. Ø ${Math.round(gesamtBestellungen / 5)} Bestellungen/Tag. Dienstag: Nuss-Allergie beachten.`)
      setKiLaedt(false)
    }, 950)
  }

  const tagesplan = WOCHENPLAN.find(t => t.tag === filterTag)

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-teal-500" /> Speiseplan
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Wochenmenü · Allergene · Bestellungen · KW 18</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bestellungen',  val: gesamtBestellungen, color: 'text-teal-700' },
          { label: 'Veg. Tage',     val: vegTage,             color: 'text-green-600' },
          { label: 'Bio-Gerichte',  val: bioTage,             color: 'text-teal-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Speiseplanübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Speiseplanübersicht'}
        </button>
      )}

      <div className="flex gap-1.5">
        {WOCHENTAGE.map(t => (
          <button key={t} onClick={() => setFilterTag(t)}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${filterTag === t ? 'bg-teal-500 text-white border-transparent' : 'border-teal-200 text-teal-500'}`}>
            {t}
          </button>
        ))}
      </div>

      {tagesplan && (
        <div className="space-y-2">
          <div className="rounded-2xl border border-teal-100 bg-white p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide">{filterTag} — Hauptgericht</p>
              {tagesplan.bestellungen && <span className="text-[9px] text-teal-500 font-semibold">{tagesplan.bestellungen} Bestellungen</span>}
            </div>

            {tagesplan.suppe && (
              <div className="flex items-center gap-2">
                <span className="text-base">🥣</span>
                <div>
                  <p className="text-[8px] text-teal-400">Suppe</p>
                  <p className="text-xs font-semibold text-teal-900">{tagesplan.suppe}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="text-xl">{TYP_CFG[tagesplan.hauptgericht.typ].emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className={`text-[8px] font-semibold ${TYP_CFG[tagesplan.hauptgericht.typ].farbe}`}>
                    {TYP_CFG[tagesplan.hauptgericht.typ].label}
                  </span>
                  {tagesplan.hauptgericht.bio && <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded-full">🌿 Bio</span>}
                  {tagesplan.hauptgericht.kalorien && <span className="text-[8px] text-teal-400">{tagesplan.hauptgericht.kalorien} kcal</span>}
                </div>
                <p className="text-sm font-bold text-teal-900">{tagesplan.hauptgericht.name}</p>
                {tagesplan.hauptgericht.allergene && (
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    {tagesplan.hauptgericht.allergene.map(a => (
                      <span key={a} className="text-[7px] bg-orange-50 border border-orange-200 text-orange-600 rounded px-1 font-bold">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {tagesplan.beilage && (
                <div className="bg-teal-50 rounded-xl p-2">
                  <p className="text-[8px] text-teal-400">Beilage</p>
                  <p className="text-[9px] font-semibold text-teal-800">{tagesplan.beilage}</p>
                </div>
              )}
              {tagesplan.dessert && (
                <div className="bg-teal-50 rounded-xl p-2">
                  <p className="text-[8px] text-teal-400">Dessert</p>
                  <p className="text-[9px] font-semibold text-teal-800">{tagesplan.dessert}</p>
                </div>
              )}
            </div>

            {tagesplan.notiz && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                <p className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{tagesplan.notiz}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-teal-100 bg-white p-3">
            <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-2">Allergen-Legende</p>
            <div className="grid grid-cols-3 gap-1">
              {ALLERGENE.map(al => (
                <div key={al.kuerzel} className="flex items-center gap-1">
                  <span className="text-[7px] bg-orange-50 border border-orange-200 text-orange-600 rounded px-1 font-bold">{al.kuerzel}</span>
                  <p className="text-[8px] text-teal-600">{al.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
