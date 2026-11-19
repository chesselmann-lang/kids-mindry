'use client'

import { useState } from 'react'
import { Leaf, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react'

// ── Nachhaltigkeit — kids-mindry ───────────────────────────────────────────────
// Nachhaltigkeit · Öko-Kita · BNE · Ressourcen · Umweltbildung

type NachhaltigkeitsThema = 'energie' | 'ernaehrung' | 'natur' | 'muell' | 'mobilität' | 'beschaffung' | 'bildung'
type MassnahmenStatus = 'umgesetzt' | 'laufend' | 'geplant' | 'idee'

interface NachhaltigkeitsMassnahme {
  id: string
  thema: NachhaltigkeitsThema
  titel: string
  status: MassnahmenStatus
  verantwortlich: string
  impact: string
  massnahmen: string[]
  naechstesZiel?: string
}

const THEMA_CFG: Record<NachhaltigkeitsThema, { label: string; emoji: string; farbe: string }> = {
  energie:     { label: 'Energie',            emoji: '⚡', farbe: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  ernaehrung:  { label: 'Ernährung',          emoji: '🥦', farbe: 'bg-green-50 text-green-700 border-green-200' },
  natur:       { label: 'Natur & Umwelt',     emoji: '🌿', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  muell:       { label: 'Abfall & Kreislauf', emoji: '♻️', farbe: 'bg-lime-50 text-lime-700 border-lime-200' },
  mobilität:   { label: 'Mobilität',          emoji: '🚲', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  beschaffung: { label: 'Nachh. Beschaffung', emoji: '🛒', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  bildung:     { label: 'BNE-Bildung',        emoji: '📚', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const STATUS_CFG: Record<MassnahmenStatus, { label: string; farbe: string; dot: string }> = {
  umgesetzt:{ label: 'Umgesetzt', farbe: 'text-green-600', dot: 'bg-green-400' },
  laufend:  { label: 'Laufend',   farbe: 'text-blue-500',  dot: 'bg-blue-400' },
  geplant:  { label: 'Geplant',   farbe: 'text-teal-500',  dot: 'bg-teal-400' },
  idee:     { label: 'Idee',      farbe: 'text-gray-400',  dot: 'bg-gray-300' },
}

const MASSNAHMEN: NachhaltigkeitsMassnahme[] = [
  {
    id: 'nh1', thema: 'ernaehrung', titel: 'Bio-Verpflegung + Saisonküche',
    status: 'umgesetzt', verantwortlich: 'Küche + Träger', impact: '30% Bio-Anteil zertifiziert',
    massnahmen: ['DGE-Qualitätsstandard Kita erfüllt', 'Saisonkalender an Küchenwand', 'Fleischreduzierung: 2× pro Woche', 'Foodwaste-Monitoring: ∅ 12% Abfall'],
  },
  {
    id: 'nh2', thema: 'natur', titel: 'Kita-Garten + Naturerfahrungsraum',
    status: 'laufend', verantwortlich: 'Fr. Müller + Eltern-AG', impact: 'Naturraum 45 m² angelegt',
    massnahmen: ['Hochbeet: 4 Beete von Eltern gebaut (2025)', 'Kräutergarten mit Kindern gepflanzt', 'Insektenhotel + Vogelnistkasten', 'Regenwasser-Tonne: Apr 2026 installiert'],
    naechstesZiel: 'Wildblumenwiese ansäen — Mai 2026',
  },
  {
    id: 'nh3', thema: 'muell', titel: 'Mülltrennung + Upcycling-Projekte',
    status: 'umgesetzt', verantwortlich: 'Alle Erzieher:innen', impact: 'Recyclingquote: >80%',
    massnahmen: ['5-Farben-Mülleimer in jeder Gruppe', 'Upcycling-Kiste: Alltagsmaterialien sammeln', 'Basteln mit Naturmaterialien (Herbst/Frühling)', 'Kinder als Müll-Scouts (Pausenritual)'],
  },
  {
    id: 'nh4', thema: 'energie', titel: 'Energiesparprogramm Kita-Gebäude',
    status: 'laufend', verantwortlich: 'Leitung + Träger', impact: 'Ziel: -15% Energieverbrauch bis 2027',
    massnahmen: ['LED-Beleuchtung: vollständig umgestellt', 'Licht aus bei Verlassen des Raums (Routine)', 'Heizthermostat: Nachtabsenkung aktiviert', 'Verbrauchsauswertung: quartalsweise'],
    naechstesZiel: 'Solaranlage: Machbarkeitsprüfung 2026',
  },
  {
    id: 'nh5', thema: 'bildung', titel: 'BNE — Bildung für nachhaltige Entwicklung',
    status: 'laufend', verantwortlich: 'Alle Fachkräfte', impact: 'BNE als Querschnittsprinzip',
    massnahmen: ['BNE-Fortbildung Team: Sep 2025 (abgeschlossen)', 'Jahresprojekt: "Unsere Erde schützen"', 'SDG-Poster in Gruppenräumen', 'Kooperation: Umweltzentrum Stadt (jährlich)'],
    naechstesZiel: 'BNE-Zertifikat Antrag 2027',
  },
  {
    id: 'nh6', thema: 'beschaffung', titel: 'Nachhaltige Materialbeschaffung',
    status: 'geplant', verantwortlich: 'Leitung', impact: 'Ziel: 50% nachhaltig bis 2027',
    massnahmen: ['Lieferantenliste auf Öko-Anbieter umstellen', 'Spielzeug: PEFC/FSC-zertifiziert bevorzugen', 'Druckerpapier: Recycling 100% (ab Jun 2026)', 'Reinigungsmittel: ökologisch (ab Sep 2026)'],
    naechstesZiel: 'Ausschreibung ökologische Reinigungsmittel',
  },
]

export default function NachhaltigkeitPage() {
  const [expanded, setExpanded] = useState<string | null>('nh2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const umgesetzt = MASSNAHMEN.filter(m => m.status === 'umgesetzt').length
  const laufend = MASSNAHMEN.filter(m => m.status === 'laufend').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${MASSNAHMEN.length} Nachhaltigkeitsmaßnahmen, ${umgesetzt} umgesetzt, ${laufend} laufend. Garten: Wildblumenwiese Mai 2026. Bio-Anteil 30% zertifiziert. Solaranlage Machbarkeitsprüfung 2026. BNE-Zertifikat 2027.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24 text-teal-900">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Leaf className="w-6 h-6 text-teal-500" /> Nachhaltigkeit
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Öko-Kita · BNE · Garten · Energie · Bio-Verpflegung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Maßnahmen', val: MASSNAHMEN.length, color: 'text-teal-700' },
          { label: 'Umgesetzt', val: umgesetzt,         color: 'text-green-600' },
          { label: 'Laufend',   val: laufend,           color: 'text-blue-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Nachhaltigkeitsübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Nachhaltigkeitsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {MASSNAHMEN.map(m => {
          const isOpen = expanded === m.id
          const tCfg = THEMA_CFG[m.thema]
          const sCfg = STATUS_CFG[m.status]
          return (
            <div key={m.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 bg-white flex items-center justify-center shrink-0 text-lg">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{m.titel}</p>
                  <p className="text-[9px] text-teal-400">{m.verantwortlich} · {m.impact}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div>
                    {m.massnahmen.map((item, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-teal-500" />
                        <p className="text-[9px] text-teal-800">{item}</p>
                      </div>
                    ))}
                  </div>
                  {m.naechstesZiel && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg px-2 py-1">
                      <p className="text-[8px] text-teal-700 font-semibold">→ {m.naechstesZiel}</p>
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
