'use client'

import { useState } from 'react'
import {
  Building2, ChevronDown, ChevronUp, Sparkles,
  Users, Clock, CheckCircle2, AlertTriangle,
  CalendarDays, Star, Plus,
} from 'lucide-react'

// ── Raumplanung — Mindry Kids ─────────────────────────────────────────────────
// Raumzuordnung · Belegung · Kapazität · Leiterin

type RaumStatus = 'frei' | 'belegt' | 'gereinigt' | 'gesperrt'
type Nutzungsart = 'gruppe' | 'bewegung' | 'mahlzeit' | 'ruhe' | 'buero' | 'lager'

interface Belegung {
  id: string
  von: string
  bis: string
  gruppe: string
  aktivitaet: string
}

interface Raum {
  id: string
  name: string
  kapazitaet: number
  nutzungsart: Nutzungsart
  status: RaumStatus
  etage: string
  belegungen: Belegung[]
  hinweis?: string
  kiText?: string
}

const STATUS_CFG: Record<RaumStatus, { label: string; farbe: string; bg: string; emoji: string }> = {
  frei:      { label: 'Frei',      farbe: 'text-green-700',  bg: 'bg-green-50',  emoji: '✅' },
  belegt:    { label: 'Belegt',    farbe: 'text-blue-700',   bg: 'bg-blue-50',   emoji: '👥' },
  gereinigt: { label: 'Reinigung', farbe: 'text-orange-700', bg: 'bg-orange-50', emoji: '🧹' },
  gesperrt:  { label: 'Gesperrt', farbe: 'text-red-700',    bg: 'bg-red-50',    emoji: '🔒' },
}

const NUTZUNG_CFG: Record<Nutzungsart, { label: string; farbe: string }> = {
  gruppe:    { label: 'Gruppenraum', farbe: 'text-amber-700' },
  bewegung:  { label: 'Bewegung',   farbe: 'text-blue-700' },
  mahlzeit:  { label: 'Mensa',      farbe: 'text-green-700' },
  ruhe:      { label: 'Ruheraum',   farbe: 'text-indigo-700' },
  buero:     { label: 'Büro',       farbe: 'text-gray-600' },
  lager:     { label: 'Lager',      farbe: 'text-gray-500' },
}

const ETAGEN = ['EG', 'OG'] as const

const INIT_RAEUME: Raum[] = [
  {
    id: 'r1', name: 'Bienen-Zimmer', kapazitaet: 20, nutzungsart: 'gruppe',
    status: 'belegt', etage: 'EG',
    belegungen: [
      { id: 'b1', von: '07:00', bis: '12:30', gruppe: 'Bienen', aktivitaet: 'Freispiel & Morgenkreis' },
      { id: 'b2', von: '14:00', bis: '17:00', gruppe: 'Bienen', aktivitaet: 'Nachmittagsbetreuung' },
    ],
  },
  {
    id: 'r2', name: 'Schmetterlings-Zimmer', kapazitaet: 22, nutzungsart: 'gruppe',
    status: 'belegt', etage: 'EG',
    belegungen: [
      { id: 'b3', von: '07:30', bis: '13:00', gruppe: 'Schmetterlinge', aktivitaet: 'Freispiel & Projekte' },
      { id: 'b4', von: '14:00', bis: '17:00', gruppe: 'Schmetterlinge', aktivitaet: 'Nachmittagsbetreuung' },
    ],
  },
  {
    id: 'r3', name: 'Krabbelkäfer-Zimmer', kapazitaet: 12, nutzungsart: 'gruppe',
    status: 'belegt', etage: 'OG',
    belegungen: [
      { id: 'b5', von: '07:00', bis: '14:00', gruppe: 'Krabbelkäfer', aktivitaet: 'Krippe – Tagesablauf' },
    ],
    hinweis: 'Fenster links klemmt — Hausmeister informiert (23.04.)',
  },
  {
    id: 'r4', name: 'Bewegungsraum', kapazitaet: 30, nutzungsart: 'bewegung',
    status: 'frei', etage: 'EG',
    belegungen: [
      { id: 'b6', von: '09:30', bis: '10:30', gruppe: 'Bienen', aktivitaet: 'Turnen' },
      { id: 'b7', von: '11:00', bis: '12:00', gruppe: 'Schmetterlinge', aktivitaet: 'Tanzen & Rhythmik' },
    ],
  },
  {
    id: 'r5', name: 'Mensa', kapazitaet: 45, nutzungsart: 'mahlzeit',
    status: 'belegt', etage: 'EG',
    belegungen: [
      { id: 'b8', von: '11:30', bis: '12:30', gruppe: 'Alle Gruppen', aktivitaet: 'Mittagessen' },
    ],
  },
  {
    id: 'r6', name: 'Ruheraum', kapazitaet: 20, nutzungsart: 'ruhe',
    status: 'gereinigt', etage: 'OG',
    belegungen: [
      { id: 'b9', von: '12:30', bis: '14:30', gruppe: 'Alle', aktivitaet: 'Mittagsruhe' },
    ],
    kiText: 'Ruheraum nach Mittagsruhe: Lüften und Matten zurückstellen. Nächste Belegung: 12:30 Uhr.',
  },
  {
    id: 'r7', name: 'Leitungsbüro', kapazitaet: 4, nutzungsart: 'buero',
    status: 'frei', etage: 'OG',
    belegungen: [],
  },
]

export default function RaumplanungPage() {
  const [raeume, setRaeume] = useState(INIT_RAEUME)
  const [expanded, setExpanded] = useState<string | null>('r4')
  const [kiLaedt, setKiLaedt] = useState<string | null>(null)
  const [filterEtage, setFilterEtage] = useState<'alle' | 'EG' | 'OG'>('alle')

  function statusWechseln(id: string) {
    setRaeume(prev => prev.map(r => {
      if (r.id !== id) return r
      const order: RaumStatus[] = ['frei', 'belegt', 'gereinigt', 'gesperrt']
      const next = order[(order.indexOf(r.status) + 1) % order.length]
      return { ...r, status: next }
    }))
  }

  function kiAnfordern(id: string) {
    setKiLaedt(id)
    setTimeout(() => {
      setRaeume(prev => prev.map(r => {
        if (r.id !== id) return r
        const belegt = r.belegungen.length
        const text = belegt > 0
          ? `${r.name}: ${belegt} Belegung${belegt > 1 ? 'en' : ''} heute. Auslastung ca. ${Math.min(100, Math.round((belegt * 3 / 8) * 100))}%. ${r.hinweis ? 'Achtung: ' + r.hinweis : 'Keine Mängel gemeldet.'}`
          : `${r.name} heute nicht belegt. Möglichkeit für Sondernutzung oder Reinigung prüfen.`
        return { ...r, kiText: text }
      }))
      setKiLaedt(null)
    }, 1100)
  }

  const filtered = filterEtage === 'alle' ? raeume : raeume.filter(r => r.etage === filterEtage)
  const freiCount = raeume.filter(r => r.status === 'frei').length
  const belegtCount = raeume.filter(r => r.status === 'belegt').length

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" /> Raumplanung
          </h1>
          <p className="text-sm text-amber-700/70 mt-0.5">Belegung · Kapazitäten · Status</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Räume gesamt', val: raeume.length, color: 'text-amber-700' },
          { label: 'Frei',         val: freiCount,     color: 'text-green-700' },
          { label: 'Belegt',       val: belegtCount,   color: 'text-blue-700' },
          { label: 'Mängel',       val: raeume.filter(r => r.hinweis).length, color: 'text-orange-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Etagen-Filter */}
      <div className="flex gap-2">
        {(['alle', 'EG', 'OG'] as const).map(e => (
          <button key={e} onClick={() => setFilterEtage(e)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterEtage === e ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {e === 'alle' ? 'Alle Etagen' : e}
          </button>
        ))}
      </div>

      {/* Raumliste */}
      <div className="space-y-2">
        {filtered.map(r => {
          const isOpen = expanded === r.id
          const sCfg = STATUS_CFG[r.status]
          const nCfg = NUTZUNG_CFG[r.nutzungsart]
          return (
            <div key={r.id} className={`rounded-2xl border overflow-hidden bg-white ${
              r.hinweis ? 'border-orange-200' : 'border-amber-100'
            }`}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0">
                    {sCfg.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-amber-900">{r.name}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${sCfg.bg} ${sCfg.farbe}`}>{sCfg.label}</span>
                      <span className={`text-[9px] font-semibold ${nCfg.farbe}`}>{nCfg.label}</span>
                    </div>
                    <p className="text-xs text-amber-700/60">{r.etage} · max. {r.kapazitaet} Personen · {r.belegungen.length} Belegung{r.belegungen.length !== 1 ? 'en' : ''}</p>
                  </div>
                  {r.hinweis && <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
                <button onClick={() => statusWechseln(r.id)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg ml-1 ${sCfg.bg} ${sCfg.farbe}`}>
                  ↻
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-amber-100 px-4 pb-4 pt-3 space-y-3">
                  {r.hinweis && (
                    <div className="flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-100 px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-orange-800">{r.hinweis}</p>
                    </div>
                  )}

                  {r.belegungen.length > 0 ? (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-2">Heutige Belegungen</p>
                      <div className="space-y-1.5">
                        {r.belegungen.map(b => (
                          <div key={b.id} className="flex items-center gap-2.5 rounded-xl px-3 py-2 bg-amber-50">
                            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-amber-900">{b.aktivitaet}</p>
                              <p className="text-[10px] text-amber-700/60">{b.gruppe} · {b.von}–{b.bis}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700/50 italic">Keine Belegungen heute</p>
                  )}

                  {r.kiText ? (
                    <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                      <p className="text-[10px] font-bold flex items-center gap-1 mb-1 text-amber-700">
                        <Sparkles className="w-3 h-3" /> KI-Hinweis
                      </p>
                      <p className="text-xs leading-relaxed text-amber-900">{r.kiText}</p>
                    </div>
                  ) : (
                    <button onClick={() => kiAnfordern(r.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 transition-colors">
                      <Sparkles className="w-3.5 h-3.5" />
                      {kiLaedt === r.id ? 'KI analysiert...' : 'KI-Hinweis anfordern'}
                    </button>
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
