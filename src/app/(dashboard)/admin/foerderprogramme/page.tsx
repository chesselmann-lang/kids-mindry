'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Förderprogramme — kids-mindry ─────────────────────────────────────────────
// Förderprogramme · Maßnahmen · Teilnehmer · Finanzierung · §22a KiTaG

type FoerderTyp = 'sprachfoerderung' | 'motorik' | 'inklusion' | 'fruehfoerderung' | 'begabung' | 'sozial' | 'daz'
type FoerderStatus = 'aktiv' | 'geplant' | 'abgeschlossen' | 'beantragt'

interface FoerderProgramm {
  id: string
  name: string
  typ: FoerderTyp
  status: FoerderStatus
  anbieter: string
  zielgruppe: string
  teilnehmerAnzahl: number
  maxTeilnehmer: number
  finanzierung: string
  laufzeit: string
  massnahmen: string[]
  koordination: string
  foerdergrundlage?: string
  notiz?: string
}

const TYP_CFG: Record<FoerderTyp, { label: string; emoji: string; farbe: string }> = {
  sprachfoerderung:{ label: 'Sprachförderung', emoji: '💬', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  motorik:         { label: 'Motorik',          emoji: '🏃', farbe: 'bg-green-50 text-green-700 border-green-200' },
  inklusion:       { label: 'Inklusion',         emoji: '🌈', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  fruehfoerderung: { label: 'Frühförderung',     emoji: '🌱', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  begabung:        { label: 'Begabungsförderung',emoji: '⭐', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  sozial:          { label: 'Sozialförderung',   emoji: '🤝', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  daz:             { label: 'DaZ',               emoji: '🗣️', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
}

const STATUS_CFG: Record<FoerderStatus, { label: string; farbe: string; dot: string }> = {
  aktiv:       { label: 'Aktiv',       farbe: 'text-green-600', dot: 'bg-green-400' },
  geplant:     { label: 'Geplant',     farbe: 'text-blue-500',  dot: 'bg-blue-400' },
  abgeschlossen:{ label: 'Abgeschlossen',farbe: 'text-gray-400',dot: 'bg-gray-300' },
  beantragt:   { label: 'Beantragt',   farbe: 'text-orange-500',dot: 'bg-orange-400' },
}

const PROGRAMME: FoerderProgramm[] = [
  {
    id: 'fp1', name: 'Sprachförderung „Kon-Lab"', typ: 'sprachfoerderung',
    status: 'aktiv', anbieter: 'Intern / Kita', zielgruppe: 'Kinder mit Sprachförderbedarf (3–5 J.)',
    teilnehmerAnzahl: 8, maxTeilnehmer: 10, finanzierung: 'KiTaG §22a + Träger',
    laufzeit: '01.09.2025 – 31.07.2026', koordination: 'M. Hofmann',
    foerdergrundlage: '§22a SGB VIII i.V.m. KiTaG',
    massnahmen: ['2× wöchentlich Kleingruppenförderung', 'Sprachstandserhebung (SismikS) halbjährlich', 'Elternberatung quartalsweise'],
  },
  {
    id: 'fp2', name: 'Frühförderung SPZ (Motorik + Sprache)', typ: 'fruehfoerderung',
    status: 'aktiv', anbieter: 'SPZ Musterstadt', zielgruppe: 'Kinder mit diagnostiziertem Förderbedarf',
    teilnehmerAnzahl: 3, maxTeilnehmer: 3, finanzierung: 'Krankenkasse / Frühförderrichtlinien',
    laufzeit: 'Laufend', koordination: 'S. Berger',
    massnahmen: ['Wöchentliche Einzeltherapie im SPZ', 'Beratung Erzieherin in der Kita', 'Halbjährliches Hilfeplangespräch'],
    notiz: 'Alle 3 Plätze belegt. Warteliste: 1 Kind.',
  },
  {
    id: 'fp3', name: 'DaZ-Förderung für Kinder mit Migrationshintergrund', typ: 'daz',
    status: 'aktiv', anbieter: 'Intern / kommunale Förderung', zielgruppe: 'Kinder nichtdeutscher Muttersprache',
    teilnehmerAnzahl: 6, maxTeilnehmer: 8, finanzierung: 'Kommunale Bildungsförderung',
    laufzeit: 'Laufend', koordination: 'L. Kunze',
    foerdergrundlage: 'KiTaG §22a, Integrationspauschale',
    massnahmen: ['Alltagsintegrierte Sprachbildung', 'Bilinguale Bilderbücher + Materialien', 'Elternkooperation mit Übersetzungshilfe'],
  },
  {
    id: 'fp4', name: 'Bewegungsförderung „Toben macht schlau"', typ: 'motorik',
    status: 'geplant', anbieter: 'TSV Musterstadt', zielgruppe: 'Alle Kinder ab 3 Jahren',
    teilnehmerAnzahl: 0, maxTeilnehmer: 20, finanzierung: 'Kooperationsvertrag Sportverein',
    laufzeit: 'ab 01.09.2026', koordination: 'S. Berger',
    massnahmen: ['1× wöchentlich Turnstunde', 'Bewegungslandschaften', 'Ausflüge Sportanlage TSV'],
    notiz: 'Vertrag in Vorbereitung. Start Herbst 2026.',
  },
]

export default function FoerderProgrammePage() {
  const [expanded, setExpanded] = useState<string | null>('fp1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = PROGRAMME.filter(p => p.status === 'aktiv').length
  const gesamtTN = PROGRAMME.filter(p => p.status === 'aktiv').reduce((a, p) => a + p.teilnehmerAnzahl, 0)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PROGRAMME.length} Programme, ${aktiv} aktiv. ${gesamtTN} Kinder nehmen teil. SPZ Frühförderung: alle Plätze belegt, 1 Kind auf Warteliste. Bewegungsförderung ab Herbst geplant.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-teal-500" /> Förderprogramme
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Maßnahmen · Teilnehmer · Finanzierung · §22a KiTaG</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Programme',  val: PROGRAMME.length, color: 'text-teal-700' },
          { label: 'Aktiv',      val: aktiv,            color: 'text-green-600' },
          { label: 'Teilnehmer', val: gesamtTN,         color: 'text-blue-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {PROGRAMME.some(p => p.notiz) && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">SPZ Frühförderung: Warteliste — weiteres Kind anmelden?</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Förderübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Förderübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {PROGRAMME.map(p => {
          const isOpen = expanded === p.id
          const tCfg = TYP_CFG[p.typ]
          const sCfg = STATUS_CFG[p.status]
          const pct = p.maxTeilnehmer > 0 ? Math.round(p.teilnehmerAnzahl / p.maxTeilnehmer * 100) : 0
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 flex items-center justify-center shrink-0 text-lg bg-white">
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{p.name}</p>
                  <p className="text-[9px] text-teal-400">{p.koordination} · {p.teilnehmerAnzahl}/{p.maxTeilnehmer} TN · {p.finanzierung}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-600">{p.zielgruppe} · {p.laufzeit}</p>
                  {p.status === 'aktiv' && (
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[8px]" style={{ color: 'inherit' }}>Auslastung</p>
                        <p className="text-[8px] font-semibold text-teal-700">{p.teilnehmerAnzahl}/{p.maxTeilnehmer} ({pct} %)</p>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-teal-100 overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 90 ? 'bg-orange-400' : 'bg-teal-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-1">Maßnahmen</p>
                    {p.massnahmen.map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5 mb-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 text-teal-300 shrink-0" />
                        <p className="text-[9px] text-teal-700">{m}</p>
                      </div>
                    ))}
                  </div>
                  {p.foerdergrundlage && (
                    <p className="text-[8px] text-teal-400">Rechtsgrundlage: {p.foerdergrundlage}</p>
                  )}
                  {p.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                      <p className="text-[8px] text-amber-700">{p.notiz}</p>
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
