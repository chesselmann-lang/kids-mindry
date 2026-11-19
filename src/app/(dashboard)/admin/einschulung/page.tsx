'use client'

import { useState } from 'react'
import { Baby, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star, AlertTriangle, Users } from 'lucide-react'

// ── Einschulungsplanung — Mindry Kids ──────────────────────────────────────────
// Übergangsmanagement Kita → Grundschule · Schulreife · Dokumentation

type EinschulungsStatus = 'in_kita' | 'angemeldet' | 'schulreif' | 'zurueckgestellt' | 'eingeschult'
type SchulreifeBereich = 'kognitiv' | 'sozial' | 'emotional' | 'motorik' | 'sprache'

interface SchulreifeEinschaetzung {
  bereich: SchulreifeBereich
  einschaetzung: 'sehr_gut' | 'gut' | 'ausreichend' | 'foerderbedarf'
}

interface EinschulungsKind {
  id: string
  name: string
  geburtsdatum: string
  alter: string
  gruppe: string
  status: EinschulungsStatus
  schuljahr: string
  zielschule?: string
  einschaetzungen: SchulreifeEinschaetzung[]
  foerderbedarf?: string
  elterngespraechDatum?: string
  schritte: { text: string; erledigt: boolean }[]
  notiz?: string
}

const STATUS_CFG: Record<EinschulungsStatus, { label: string; farbe: string; bg: string }> = {
  in_kita:      { label: 'In Kita',       farbe: 'text-gray-600',   bg: 'bg-gray-50' },
  angemeldet:   { label: 'Angemeldet',    farbe: 'text-blue-700',   bg: 'bg-blue-50' },
  schulreif:    { label: 'Schulreif',     farbe: 'text-green-700',  bg: 'bg-green-50' },
  zurueckgestellt: { label: 'Zurückgestellt', farbe: 'text-orange-700', bg: 'bg-orange-50' },
  eingeschult:  { label: 'Eingeschult',   farbe: 'text-indigo-700', bg: 'bg-indigo-50' },
}

const EINSCHAETZUNG_CFG = {
  sehr_gut:     { label: '●●●●', farbe: 'text-green-600' },
  gut:          { label: '●●●○', farbe: 'text-blue-600' },
  ausreichend:  { label: '●●○○', farbe: 'text-orange-500' },
  foerderbedarf:{ label: '●○○○', farbe: 'text-red-600' },
}

const BEREICH_LABEL: Record<SchulreifeBereich, string> = {
  kognitiv: 'Kognitiv', sozial: 'Sozial', emotional: 'Emotional', motorik: 'Motorik', sprache: 'Sprache',
}

const INIT_KINDER: EinschulungsKind[] = [
  {
    id: 'e1', name: 'Emma Weber', geburtsdatum: '15.09.2018', alter: '6 J 7 M', gruppe: 'Sonnenkäfer',
    status: 'schulreif', schuljahr: '2025/26', zielschule: 'Grundschule Musterstraße',
    einschaetzungen: [
      { bereich: 'kognitiv', einschaetzung: 'sehr_gut' },
      { bereich: 'sozial', einschaetzung: 'gut' },
      { bereich: 'emotional', einschaetzung: 'gut' },
      { bereich: 'motorik', einschaetzung: 'sehr_gut' },
      { bereich: 'sprache', einschaetzung: 'gut' },
    ],
    elterngespraechDatum: '12.04.2025',
    schritte: [
      { text: 'Schulanmeldung erfolgt', erledigt: true },
      { text: 'Übergangsdokumentation erstellt', erledigt: true },
      { text: 'Elterngespräch geführt', erledigt: true },
      { text: 'Abschied-Ritual geplant', erledigt: false },
    ],
    notiz: 'Emma freut sich auf die Schule — sehr gut vorbereitet',
  },
  {
    id: 'e2', name: 'Noah Schäfer', geburtsdatum: '02.11.2018', alter: '6 J 5 M', gruppe: 'Sonnenkäfer',
    status: 'angemeldet', schuljahr: '2025/26', zielschule: 'Schiller-Grundschule',
    einschaetzungen: [
      { bereich: 'kognitiv', einschaetzung: 'gut' },
      { bereich: 'sozial', einschaetzung: 'ausreichend' },
      { bereich: 'emotional', einschaetzung: 'ausreichend' },
      { bereich: 'motorik', einschaetzung: 'gut' },
      { bereich: 'sprache', einschaetzung: 'gut' },
    ],
    foerderbedarf: 'Sozial-emotionale Kompetenz — weitere Förderung empfohlen',
    elterngespraechDatum: '28.04.2025',
    schritte: [
      { text: 'Schulanmeldung erfolgt', erledigt: true },
      { text: 'Übergangsdokumentation erstellt', erledigt: false },
      { text: 'Elterngespräch geführt', erledigt: false },
      { text: 'Abschied-Ritual geplant', erledigt: false },
    ],
    notiz: '⚠️ Soziale Reife noch im Aufbau — engmaschige Begleitung bis Sommer',
  },
  {
    id: 'e3', name: 'Lena Hoffmann', geburtsdatum: '20.03.2019', alter: '6 J 1 M', gruppe: 'Marienkäfer',
    status: 'zurueckgestellt', schuljahr: '2026/27',
    einschaetzungen: [
      { bereich: 'kognitiv', einschaetzung: 'ausreichend' },
      { bereich: 'sozial', einschaetzung: 'gut' },
      { bereich: 'emotional', einschaetzung: 'foerderbedarf' },
      { bereich: 'motorik', einschaetzung: 'ausreichend' },
      { bereich: 'sprache', einschaetzung: 'foerderbedarf' },
    ],
    foerderbedarf: 'Sprache: Logopädie empfohlen. Emotionale Stabilisierung benötigt mehr Zeit.',
    schritte: [
      { text: 'Ärztliche Stellungnahme eingeholt', erledigt: true },
      { text: 'Schulbehörde informiert', erledigt: true },
      { text: 'Förderplan für weiteres Jahr erstellt', erledigt: false },
      { text: 'Elternberatung (Logopädie)', erledigt: false },
    ],
    notiz: '⚠️ Zurückstellung bewilligt — Förderplan notwendig',
  },
  {
    id: 'e4', name: 'Max Fischer', geburtsdatum: '07.07.2018', alter: '6 J 9 M', gruppe: 'Sonnenkäfer',
    status: 'eingeschult', schuljahr: '2024/25', zielschule: 'Grundschule Musterstraße',
    einschaetzungen: [
      { bereich: 'kognitiv', einschaetzung: 'sehr_gut' },
      { bereich: 'sozial', einschaetzung: 'sehr_gut' },
      { bereich: 'emotional', einschaetzung: 'gut' },
      { bereich: 'motorik', einschaetzung: 'sehr_gut' },
      { bereich: 'sprache', einschaetzung: 'sehr_gut' },
    ],
    schritte: [
      { text: 'Schulanmeldung erfolgt', erledigt: true },
      { text: 'Übergangsdokumentation erstellt', erledigt: true },
      { text: 'Elterngespräch geführt', erledigt: true },
      { text: 'Einschulung 09.09.2024', erledigt: true },
    ],
  },
]

export default function EinschulungPage() {
  const [expanded, setExpanded] = useState<string | null>('e1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const schulreif = INIT_KINDER.filter(k => k.status === 'schulreif' || k.status === 'angemeldet').length
  const foerderbedarf = INIT_KINDER.filter(k => k.foerderbedarf).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${schulreif} Kinder für Einschulung 2025/26 vorgemerkt. ${foerderbedarf} Kind(er) mit Förderbedarf. Zurückgestellt: 1 Kind (Lena H. — Logopädie + emotionale Stabilisierung). Nächste Schritte: Übergangsdokumentation Noah S. und Elterngespräch vervollständigen bis 30.05.`)
      setKiLaedt(false)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Baby className="w-6 h-6 text-teal-600" /> Einschulungsplanung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Übergang Kita → Grundschule · Schuljahr 2025/26</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Schulreif',  val: schulreif,                                          color: 'text-green-600' },
          { label: 'Förderbedarf',val: foerderbedarf,                                     color: foerderbedarf > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Zurückgestellt', val: INIT_KINDER.filter(k=>k.status==='zurueckgestellt').length, color: 'text-orange-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-200 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Überblick</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Einschulungsüberblick'}
        </button>
      )}

      <div className="space-y-2">
        {INIT_KINDER.map(k => {
          const sCfg = STATUS_CFG[k.status]
          const isOpen = expanded === k.id
          const erledigte = k.schritte.filter(s => s.erledigt).length
          const pct = Math.round((erledigte / k.schritte.length) * 100)
          return (
            <div key={k.id} className={`rounded-2xl border overflow-hidden ${k.foerderbedarf ? 'border-orange-200 bg-orange-50/20' : 'border-teal-100 bg-white'}`}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <Baby className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-teal-900">{k.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-teal-500">{k.alter} · {k.gruppe}</span>
                    <span className="text-[9px] text-teal-400">SJ {k.schuljahr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 h-1 rounded-full bg-teal-100">
                      <div className="h-full rounded-full bg-teal-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[9px] text-teal-400 shrink-0">{pct}%</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${sCfg.bg} ${sCfg.farbe}`}>{sCfg.label}</span>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-teal-300" /> : <ChevronDown className="w-3.5 h-3.5 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {/* Schulreife-Raster */}
                  <div>
                    <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide mb-1">Schulreife-Einschätzung</p>
                    <div className="grid grid-cols-5 gap-1">
                      {k.einschaetzungen.map((e, i) => (
                        <div key={i} className="text-center">
                          <p className={`text-[11px] font-black ${EINSCHAETZUNG_CFG[e.einschaetzung].farbe}`}>{EINSCHAETZUNG_CFG[e.einschaetzung].label}</p>
                          <p className="text-[8px] text-teal-500">{BEREICH_LABEL[e.bereich]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Schritte */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wide">Checkliste</p>
                    {k.schritte.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${s.erledigt ? 'text-green-500' : 'text-teal-200'}`} />
                        <p className={`text-[10px] ${s.erledigt ? 'line-through text-teal-400' : 'text-teal-900'}`}>{s.text}</p>
                      </div>
                    ))}
                  </div>
                  {k.foerderbedarf && (
                    <div className="flex items-start gap-1.5 text-[10px] bg-orange-50 border border-orange-200 text-orange-800 rounded-lg px-2 py-1.5">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" /> {k.foerderbedarf}
                    </div>
                  )}
                  {k.notiz && !k.notiz.startsWith('⚠️') && (
                    <p className="text-[9px] text-teal-600 italic">{k.notiz}</p>
                  )}
                  {k.zielschule && <p className="text-[9px] text-teal-500">🏫 {k.zielschule}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
