'use client'

import { useState } from 'react'
import { GraduationCap, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, AlertTriangle, Users, Star } from 'lucide-react'

// ── Übergangsprotokoll — Mindry Kids Admin ────────────────────────────────────
// Kita → Grundschule · Entwicklungsberichte · Übergabegespräch · §36 SGB VIII

type UebergangsStatus = 'vorbereitet' | 'gesendet' | 'bestaetigt' | 'abgeschlossen'
type EntwicklungsBereich = 'sprache' | 'motorik' | 'soziales' | 'kognitiv' | 'selbstaendigkeit' | 'emotional'

interface EntwicklungsEinschaetzung {
  bereich: EntwicklungsBereich
  stufe: 1 | 2 | 3
  notiz?: string
}

interface Uebergangsprotokoll {
  id: string
  kind: string
  geburtsdatum: string
  zielschule: string
  einschulungsDatum: string
  status: UebergangsStatus
  einschulungsjahr: string
  entwicklung: EntwicklungsEinschaetzung[]
  elternGespraechDatum?: string
  sonderfoerderbedarf: boolean
  notizen: string[]
}

const STATUS_CFG: Record<UebergangsStatus, { label: string; farbe: string; bg: string }> = {
  vorbereitet: { label: 'Vorbereitet', farbe: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
  gesendet:    { label: 'Gesendet',    farbe: 'text-orange-700',bg: 'bg-orange-50 border-orange-200' },
  bestaetigt:  { label: 'Bestätigt',   farbe: 'text-teal-700',  bg: 'bg-teal-50 border-teal-200' },
  abgeschlossen:{ label: 'Abgeschlossen', farbe: 'text-green-700', bg: 'bg-green-50 border-green-200' },
}

const BEREICH_CFG: Record<EntwicklungsBereich, { label: string; emoji: string }> = {
  sprache:        { label: 'Sprache',          emoji: '💬' },
  motorik:        { label: 'Motorik',          emoji: '🏃' },
  soziales:       { label: 'Soziales',         emoji: '🤝' },
  kognitiv:       { label: 'Kognition',        emoji: '🧠' },
  selbstaendigkeit:{ label: 'Selbständigkeit', emoji: '⭐' },
  emotional:      { label: 'Emotional',        emoji: '❤️' },
}

const STUFEN_FARBEN: Record<1 | 2 | 3, string> = {
  1: 'bg-orange-100 text-orange-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-green-100 text-green-700',
}

const STUFEN_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Förderbedarf',
  2: 'Entwicklung',
  3: 'Altersgemäß',
}

const PROTOKOLLE: Uebergangsprotokoll[] = [
  {
    id: 'up1', kind: 'Emma B.', geburtsdatum: '14.03.2020',
    zielschule: 'Grundschule Sonnenhügel', einschulungsDatum: '14.09.2026',
    status: 'vorbereitet', einschulungsjahr: '2026/27',
    elternGespraechDatum: '05.05.2026',
    sonderfoerderbedarf: false,
    entwicklung: [
      { bereich: 'sprache', stufe: 3 },
      { bereich: 'motorik', stufe: 3 },
      { bereich: 'soziales', stufe: 3 },
      { bereich: 'kognitiv', stufe: 3 },
      { bereich: 'selbstaendigkeit', stufe: 2 },
      { bereich: 'emotional', stufe: 3 },
    ],
    notizen: ['Sehr soziales, aufgewecktes Kind. Bereit für Schule.'],
  },
  {
    id: 'up2', kind: 'Max F.', geburtsdatum: '02.07.2020',
    zielschule: 'Grundschule Am Park', einschulungsDatum: '14.09.2026',
    status: 'gesendet', einschulungsjahr: '2026/27',
    elternGespraechDatum: '28.04.2026',
    sonderfoerderbedarf: true,
    entwicklung: [
      { bereich: 'sprache', stufe: 1, notiz: 'Logopädische Förderung läuft' },
      { bereich: 'motorik', stufe: 2 },
      { bereich: 'soziales', stufe: 2, notiz: 'Eingewöhnung in Gruppe nach wie vor herausfordernd' },
      { bereich: 'kognitiv', stufe: 3 },
      { bereich: 'selbstaendigkeit', stufe: 2 },
      { bereich: 'emotional', stufe: 2 },
    ],
    notizen: [
      'Sonderpädagogische Abklärung empfohlen.',
      'Logopädie-Berichte liegen dem Protokoll bei.',
    ],
  },
  {
    id: 'up3', kind: 'Lena K.', geburtsdatum: '20.11.2020',
    zielschule: 'Grundschule Sonnenhügel', einschulungsDatum: '14.09.2026',
    status: 'bestaetigt', einschulungsjahr: '2026/27',
    elternGespraechDatum: '22.04.2026',
    sonderfoerderbedarf: false,
    entwicklung: [
      { bereich: 'sprache', stufe: 3 },
      { bereich: 'motorik', stufe: 2 },
      { bereich: 'soziales', stufe: 3 },
      { bereich: 'kognitiv', stufe: 3 },
      { bereich: 'selbstaendigkeit', stufe: 3 },
      { bereich: 'emotional', stufe: 3 },
    ],
    notizen: ['Schulbereit. Bestätigung durch Grundschule eingegangen.'],
  },
]

export default function UebergangsprotokollPage() {
  const [expanded, setExpanded] = useState<string | null>('up1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const mitFoerderbedarf = PROTOKOLLE.filter(p => p.sonderfoerderbedarf).length
  const bestaetigt = PROTOKOLLE.filter(p => p.status === 'bestaetigt' || p.status === 'abgeschlossen').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PROTOKOLLE.length} Übergangsprotokolle für Einschulung 09/2026: ${bestaetigt} von Grundschulen bestätigt. ${mitFoerderbedarf} Kind mit Sonderförderbedarf (Max F.) — sonderpädagogische Abklärung rechtzeitig einleiten. Elterngespräche bis 05.05. abschließen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-teal-500" /> Übergangsprotokolle
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Kita → Grundschule · Einschulung 2026</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kinder',         val: PROTOKOLLE.length, color: 'text-teal-700' },
          { label: 'Bestätigt',      val: bestaetigt, color: 'text-green-600' },
          { label: 'Förderbedarf',   val: mitFoerderbedarf, color: mitFoerderbedarf > 0 ? 'text-orange-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {mitFoerderbedarf > 0 && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">{mitFoerderbedarf} Kind mit Sonderförderbedarf — frühzeitige Einleitung prüfen!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Übergangsempfehlung</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Übergangsempfehlung'}
        </button>
      )}

      <div className="space-y-2">
        {PROTOKOLLE.map(p => {
          const isOpen = expanded === p.id
          const statusCfg = STATUS_CFG[p.status]
          const avgStufe = Math.round(p.entwicklung.reduce((s, e) => s + e.stufe, 0) / p.entwicklung.length)
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${statusCfg.bg}`}>
                  <GraduationCap className={`w-4 h-4 ${statusCfg.farbe}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900">{p.kind}</p>
                    {p.sonderfoerderbedarf && <AlertTriangle className="w-2.5 h-2.5 text-orange-400" />}
                    <span className={`text-[8px] font-semibold ${statusCfg.farbe}`}>{statusCfg.label}</span>
                  </div>
                  <p className="text-[9px] text-teal-400">* {p.geburtsdatum} · {p.zielschule}</p>
                  <div className="flex gap-0.5 mt-1.5">
                    {[1, 2, 3].map(s => (
                      <div key={s} className={`w-5 h-1 rounded-full ${s <= avgStufe ? 'bg-teal-400' : 'bg-teal-100'}`} />
                    ))}
                    <span className="text-[9px] text-teal-400 ml-1">Ø {STUFEN_LABEL[avgStufe as 1 | 2 | 3]}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[9px] text-teal-500">Einschulung: {p.einschulungsDatum}{p.elternGespraechDatum && ` · Elterngespräch: ${p.elternGespraechDatum}`}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {p.entwicklung.map((e, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-[10px]">{BEREICH_CFG[e.bereich].emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] text-teal-500">{BEREICH_CFG[e.bereich].label}</p>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${STUFEN_FARBEN[e.stufe]}`}>{STUFEN_LABEL[e.stufe]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {p.notizen.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 space-y-0.5">
                      {p.notizen.map((n, i) => (
                        <p key={i} className="text-[9px] text-amber-700"><Star className="w-2.5 h-2.5 inline mr-1" />{n}</p>
                      ))}
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
