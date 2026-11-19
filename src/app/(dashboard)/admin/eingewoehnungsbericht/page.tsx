'use client'

import { useState } from 'react'
import { Sprout, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Eingewöhnungsbericht — kids-mindry ────────────────────────────────────────
// Eingewöhnungsberichte · Modell · Verlauf · Elterngespräche · Abschluss

type EingewoehnungsModell = 'berliner' | 'muenchner' | 'pikler' | 'individual'
type EingewoehnungsPhase = 'grundphase' | 'trennungsphase' | 'stabilisierung' | 'schlussphase' | 'abgeschlossen' | 'abgebrochen'

interface EingewoehnungsSchritt {
  bezeichnung: string
  abgeschlossen: boolean
  datum?: string
  notiz?: string
}

interface EingewoehnungsBericht {
  id: string
  kindName: string
  geburtsDatum: string
  gruppe: string
  modell: EingewoehnungsModell
  phase: EingewoehnungsPhase
  beginn: string
  abschlussErwartet: string
  bezugsperson: string
  begleitung: string
  schritte: EingewoehnungsSchritt[]
  notiz?: string
  abgeschlossen?: boolean
}

const MODELL_CFG: Record<EingewoehnungsModell, { label: string; emoji: string; farbe: string }> = {
  berliner:   { label: 'Berliner Modell',  emoji: '🏙️', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  muenchner:  { label: 'Münchner Modell',  emoji: '🍺', farbe: 'bg-green-50 text-green-700 border-green-200' },
  pikler:     { label: 'Pikler-Ansatz',    emoji: '🌸', farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
  individual: { label: 'Individuell',      emoji: '⭐', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const PHASE_CFG: Record<EingewoehnungsPhase, { label: string; farbe: string }> = {
  grundphase:     { label: 'Grundphase',     farbe: 'text-blue-500' },
  trennungsphase: { label: 'Trennungsphase', farbe: 'text-orange-500' },
  stabilisierung: { label: 'Stabilisierung', farbe: 'text-purple-500' },
  schlussphase:   { label: 'Schlussphase',   farbe: 'text-teal-500' },
  abgeschlossen:  { label: 'Abgeschlossen ✓',farbe: 'text-green-600' },
  abgebrochen:    { label: 'Abgebrochen',    farbe: 'text-red-500' },
}

const BERICHTE: EingewoehnungsBericht[] = [
  {
    id: 'eb1', kindName: 'Ben S.', geburtsDatum: '12.01.2024', gruppe: 'Krippe 1',
    modell: 'berliner', phase: 'grundphase', beginn: '14.04.2026',
    abschlussErwartet: '12.05.2026', bezugsperson: 'Miriam Hofmann', begleitung: 'Mutter',
    schritte: [
      { bezeichnung: 'Erstgespräch mit Eltern geführt', abgeschlossen: true, datum: '01.04.2026' },
      { bezeichnung: 'Kennenlern-Tag (1 Std. mit Eltern)', abgeschlossen: true, datum: '14.04.2026' },
      { bezeichnung: 'Grundphase (Eltern anwesend)', abgeschlossen: false },
      { bezeichnung: 'Erster Trennungsversuch', abgeschlossen: false },
      { bezeichnung: 'Stabilisierungsphase', abgeschlossen: false },
      { bezeichnung: 'Abschlussgespräch Eltern', abgeschlossen: false },
    ],
    notiz: 'Woche 2. Ben weint beim Trennen noch kurz, beruhigt sich schnell. Positiver Verlauf!',
  },
  {
    id: 'eb2', kindName: 'Lena O.', geburtsDatum: '05.07.2023', gruppe: 'U3',
    modell: 'berliner', phase: 'stabilisierung', beginn: '01.03.2026',
    abschlussErwartet: '30.04.2026', bezugsperson: 'Sandra Berger', begleitung: 'Vater',
    schritte: [
      { bezeichnung: 'Erstgespräch mit Eltern geführt', abgeschlossen: true, datum: '18.02.2026' },
      { bezeichnung: 'Kennenlern-Tag (1 Std. mit Eltern)', abgeschlossen: true, datum: '01.03.2026' },
      { bezeichnung: 'Grundphase (Eltern anwesend)', abgeschlossen: true, datum: '08.03.2026' },
      { bezeichnung: 'Erster Trennungsversuch', abgeschlossen: true, datum: '15.03.2026' },
      { bezeichnung: 'Stabilisierungsphase', abgeschlossen: false, notiz: 'Lena bleibt jetzt bis 13:00 Uhr — nächste Woche Mittagsschlaf' },
      { bezeichnung: 'Abschlussgespräch Eltern', abgeschlossen: false },
    ],
    notiz: 'Verlauf sehr gut! Lena spielt eigenständig, sucht Kontakt zur Bezugserzieherin.',
  },
  {
    id: 'eb3', kindName: 'Max R.', geburtsDatum: '20.11.2022', gruppe: 'Krippe 2',
    modell: 'muenchner', phase: 'abgeschlossen', beginn: '01.02.2026',
    abschlussErwartet: '01.03.2026', bezugsperson: 'Lars Kunze', begleitung: 'Mutter',
    schritte: [
      { bezeichnung: 'Erstgespräch mit Eltern geführt', abgeschlossen: true, datum: '20.01.2026' },
      { bezeichnung: 'Beobachtungsphase im Alltag', abgeschlossen: true, datum: '01.02.2026' },
      { bezeichnung: 'Beziehungsaufbau zur Erzieherin', abgeschlossen: true, datum: '10.02.2026' },
      { bezeichnung: 'Ablösephase', abgeschlossen: true, datum: '20.02.2026' },
      { bezeichnung: 'Abschlussgespräch Eltern', abgeschlossen: true, datum: '28.02.2026' },
    ],
    abgeschlossen: true,
  },
]

export default function EingewoehnungsBerichtPage() {
  const [expanded, setExpanded] = useState<string | null>('eb1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const aktiv = BERICHTE.filter(b => !b.abgeschlossen).length
  const abg = BERICHTE.filter(b => b.abgeschlossen).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${BERICHTE.length} Eingewöhnungen, ${aktiv} aktiv, ${abg} abgeschlossen. Ben S. in Woche 2 — positiver Verlauf. Lena O. in Stabilisierung, Abschluss bis 30.04. geplant. Max R. erfolgreich abgeschlossen.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Sprout className="w-6 h-6 text-teal-500" /> Eingewöhnungsberichte
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Berliner/Münchner Modell · Verlauf · Schritte · Elterngespräche</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Gesamt',       val: BERICHTE.length, color: 'text-teal-700' },
          { label: 'Aktiv',        val: aktiv,           color: aktiv > 0 ? 'text-blue-500' : 'text-gray-400' },
          { label: 'Abgeschlossen',val: abg,             color: 'text-green-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Eingewöhnungsübersicht</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Eingewöhnungsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {BERICHTE.map(b => {
          const isOpen = expanded === b.id
          const mCfg = MODELL_CFG[b.modell]
          const pCfg = PHASE_CFG[b.phase]
          const erledigtCount = b.schritte.filter(s => s.abgeschlossen).length
          return (
            <div key={b.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {b.kindName.split(' ')[0][0]}{b.kindName.split(' ')[1]?.[0] ?? ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${mCfg.farbe}`}>{mCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${pCfg.farbe}`}>{pCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{b.kindName} · {b.gruppe}</p>
                  <p className="text-[9px] text-teal-400">seit {b.beginn} · {erledigtCount}/{b.schritte.length} Schritte · Bezug: {b.bezugsperson}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  {b.schritte.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className={`w-3 h-3 mt-0.5 shrink-0 ${s.abgeschlossen ? 'text-green-400' : 'text-gray-200'}`} />
                      <div>
                        <p className={`text-[9px] ${s.abgeschlossen ? 'text-teal-600' : 'text-teal-900 font-semibold'}`}>{s.bezeichnung}</p>
                        {s.datum && <p className="text-[8px] text-teal-400">{s.datum}</p>}
                        {s.notiz && <p className="text-[8px] text-amber-600">{s.notiz}</p>}
                      </div>
                    </div>
                  ))}
                  {b.notiz && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg px-2 py-1.5 mt-1">
                      <p className="text-[8px] text-teal-700">{b.notiz}</p>
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
