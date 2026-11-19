'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Star } from 'lucide-react'

// ── Raumnutzung — Mindry Kids Admin ──────────────────────────────────────────
// Raumübersicht · Belegung · Kapazitäten · Reinigung

type RaumTyp = 'gruppenraum' | 'turnraum' | 'schlafraum' | 'kuche' | 'buero' | 'aussengelaende'
type RaumStatus = 'frei' | 'belegt' | 'gesperrt' | 'reinigung'

interface RaumBelegung {
  von: string
  bis: string
  gruppe: string
  aktivitaet: string
}

interface Raum {
  id: string
  bezeichnung: string
  typ: RaumTyp
  kapazitaet: number
  flaeche: number
  status: RaumStatus
  belegungen: RaumBelegung[]
  ausstattung: string[]
  notiz?: string
}

const TYP_CFG: Record<RaumTyp, { label: string; farbe: string }> = {
  gruppenraum:   { label: 'Gruppenraum',   farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  turnraum:      { label: 'Turnraum',      farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  schlafraum:    { label: 'Schlafraum',    farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  kuche:         { label: 'Küche',         farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  buero:         { label: 'Büro',          farbe: 'bg-gray-50 text-gray-700 border-gray-200' },
  aussengelaende:{ label: 'Außengelände',  farbe: 'bg-green-50 text-green-700 border-green-200' },
}

const INIT_RAEUME: Raum[] = [
  {
    id: 'r1', bezeichnung: 'Gruppenraum Igel', typ: 'gruppenraum', kapazitaet: 20, flaeche: 65, status: 'belegt',
    belegungen: [
      { von: '07:00', bis: '12:30', gruppe: 'Igel', aktivitaet: 'Regulärer Kindergartenbetrieb' },
      { von: '14:00', bis: '16:30', gruppe: 'Igel', aktivitaet: 'Nachmittagsbetreuung' },
    ],
    ausstattung: ['Maltisch', 'Bücherecke', 'Bauecke', 'Rollenspielbereich'],
  },
  {
    id: 'r2', bezeichnung: 'Gruppenraum Bären', typ: 'gruppenraum', kapazitaet: 22, flaeche: 70, status: 'belegt',
    belegungen: [
      { von: '07:30', bis: '12:30', gruppe: 'Bären', aktivitaet: 'Regulärer Kindergartenbetrieb' },
      { von: '09:45', bis: '10:30', gruppe: 'Bären', aktivitaet: 'Kreativangebot Fr. Braun' },
    ],
    ausstattung: ['Kreativtisch', 'Konstruktionsecke', 'Puppenhaus', 'Lesematratzen'],
  },
  {
    id: 'r3', bezeichnung: 'Turnraum', typ: 'turnraum', kapazitaet: 30, flaeche: 120, status: 'frei',
    belegungen: [
      { von: '09:30', bis: '10:30', gruppe: 'Igel', aktivitaet: 'Psychomotorik-Einheit' },
      { von: '14:00', bis: '15:00', gruppe: 'Füchse', aktivitaet: 'Bewegungsangebot' },
    ],
    ausstattung: ['Matten', 'Kleingeräte', 'Klettergerüst', 'Balancierbalken'],
    notiz: 'Di: Turnen 09:30 Igel, Do: Ballett extern 15:00',
  },
  {
    id: 'r4', bezeichnung: 'Schlafraum U3', typ: 'schlafraum', kapazitaet: 8, flaeche: 30, status: 'reinigung',
    belegungen: [
      { von: '12:30', bis: '14:30', gruppe: 'U3-Kinder', aktivitaet: 'Mittagsschlaf' },
    ],
    ausstattung: ['8 Feldbetten', 'Verdunklungsrollos', 'Beruhigungsmusik'],
    notiz: 'Wöchentliche Tiefenreinigung Fr. Nachmittag',
  },
]

export default function RaumnutzungPage() {
  const [expanded, setExpanded] = useState<string | null>('r1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const belegt = INIT_RAEUME.filter(r => r.status === 'belegt').length
  const gesperrt = INIT_RAEUME.filter(r => r.status === 'gesperrt' || r.status === 'reinigung').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${INIT_RAEUME.length} Räume verwaltet, ${belegt} aktuell belegt. Turnraum hat heute noch freie Slots (11:00–14:00 und 15:00+). Empfehlung: Schlafraum-Reinigungsprotokoll für Fr. dokumentieren.`)
      setKiLaedt(false)
    }, 950)
  }

  const STATUS_CFG: Record<RaumStatus, { label: string; farbe: string }> = {
    frei:      { label: 'Frei',      farbe: 'text-green-600' },
    belegt:    { label: 'Belegt',    farbe: 'text-orange-500' },
    gesperrt:  { label: 'Gesperrt', farbe: 'text-red-600' },
    reinigung: { label: 'Reinigung',farbe: 'text-blue-500' },
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-teal-500" /> Raumnutzung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Belegungen · Kapazitäten · Ausstattung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Räume',   val: INIT_RAEUME.length, color: 'text-teal-700' },
          { label: 'Belegt',  val: belegt, color: 'text-orange-600' },
          { label: 'Gesperrt/Reinigung', val: gesperrt, color: gesperrt > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Raumplanung</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Raumplanung'}
        </button>
      )}

      <div className="space-y-2">
        {INIT_RAEUME.map(r => {
          const isOpen = expanded === r.id
          const typCfg = TYP_CFG[r.typ]
          const stCfg = STATUS_CFG[r.status]
          return (
            <div key={r.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900">{r.bezeichnung}</p>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${typCfg.farbe}`}>{typCfg.label}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-teal-500"><Users className="w-2.5 h-2.5 inline mr-0.5" />max. {r.kapazitaet} · {r.flaeche} m²</span>
                    <span className={`text-[9px] font-semibold ${stCfg.farbe}`}>{stCfg.label}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-teal-500 tracking-wide mb-1">Heutige Belegung</p>
                    {r.belegungen.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px]">
                        <span className="text-teal-400 w-20 shrink-0">{b.von}–{b.bis}</span>
                        <span className="text-teal-900">{b.gruppe}: {b.aktivitaet}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.ausstattung.map((a, i) => (
                      <span key={i} className="text-[8px] bg-teal-50 border border-teal-100 text-teal-600 px-1.5 py-0.5 rounded-full">{a}</span>
                    ))}
                  </div>
                  {r.notiz && (
                    <div className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 rounded-lg px-2 py-1.5">
                      <Star className="w-2.5 h-2.5 inline mr-1" />{r.notiz}
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
