'use client'

import { useState } from 'react'
import { Baby, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star } from 'lucide-react'

// ── Eingewöhnungsplan — Mindry Kids ──────────────────────────────────────────
// Berliner / Münchner Modell · Phasen-Tracking · Bezugserzieherin

type EingewoehnungsPhase = 'vorbereitung' | 'grundphase' | 'stabilisierung' | 'schlussphase' | 'abgeschlossen'
type EingewoehnungsModell = 'berlin' | 'muenchen'

interface PhasenSchritt {
  nr: number
  beschreibung: string
  erledigt: boolean
  datum?: string
}

interface EingewoehnungsKind {
  id: string
  name: string
  alter: string
  gruppe: string
  modell: EingewoehnungsModell
  phase: EingewoehnungsPhase
  start: string
  bezugserzieherin: string
  elternteil: string
  schritte: PhasenSchritt[]
  notiz?: string
}

const PHASE_CFG: Record<EingewoehnungsPhase, { label: string; farbe: string; bg: string; emoji: string }> = {
  vorbereitung:    { label: 'Vorbereitung',    farbe: 'text-gray-700',   bg: 'bg-gray-100',    emoji: '📋' },
  grundphase:      { label: 'Grundphase',      farbe: 'text-blue-700',   bg: 'bg-blue-50',     emoji: '🌱' },
  stabilisierung:  { label: 'Stabilisierung',  farbe: 'text-amber-700',  bg: 'bg-amber-50',    emoji: '🌿' },
  schlussphase:    { label: 'Schlussphase',    farbe: 'text-green-700',  bg: 'bg-green-50',    emoji: '🌸' },
  abgeschlossen:   { label: 'Abgeschlossen',   farbe: 'text-teal-700',   bg: 'bg-teal-50',     emoji: '✅' },
}

const MODELL_CFG: Record<EingewoehnungsModell, { label: string }> = {
  berlin:   { label: 'Berliner Modell' },
  muenchen: { label: 'Münchner Modell' },
}

const INIT_KINDER: EingewoehnungsKind[] = [
  {
    id: 'k1', name: 'Finn Richter', alter: '2 Jahre 8 Monate', gruppe: 'Bienen',
    modell: 'berlin', phase: 'stabilisierung', start: 'Mo, 7. Apr.',
    bezugserzieherin: 'Fr. Jung', elternteil: 'Mutter Richter',
    notiz: 'Finn hat sich sehr gut eingelebt. Nur bei Mittagsschlaf noch kurzes Weinen.',
    schritte: [
      { nr: 1, beschreibung: 'Erstgespräch & Voranmeldung',                erledigt: true, datum: '28. März' },
      { nr: 2, beschreibung: 'Eingewöhnungsgespräch mit Eltern',           erledigt: true, datum: '4. Apr.' },
      { nr: 3, beschreibung: 'Grundphase (3 Tage mit Bezugsperson)',        erledigt: true, datum: '7.–9. Apr.' },
      { nr: 4, beschreibung: 'Erste Trennungsversuche (kurz)',              erledigt: true, datum: '10. Apr.' },
      { nr: 5, beschreibung: 'Stabilisierungsphase — längere Trennungen',  erledigt: true, datum: '11. Apr.' },
      { nr: 6, beschreibung: 'Mittagessen ohne Bezugsperson',               erledigt: false },
      { nr: 7, beschreibung: 'Mittagsschlaf ohne Bezugsperson',             erledigt: false },
      { nr: 8, beschreibung: 'Eingewöhnung abgeschlossen — Dokumentation', erledigt: false },
    ],
  },
  {
    id: 'k2', name: 'Mia Krause', alter: '2 Jahre 1 Monat', gruppe: 'Schmetterlinge',
    modell: 'muenchen', phase: 'grundphase', start: 'Mo, 22. Apr.',
    bezugserzieherin: 'Fr. Peters', elternteil: 'Vater Krause',
    notiz: 'Mia weint bei Abschied, beruhigt sich aber nach ca. 10 Minuten.',
    schritte: [
      { nr: 1, beschreibung: 'Erstgespräch',                                erledigt: true, datum: '10. Apr.' },
      { nr: 2, beschreibung: 'Schnuppernachmittag',                         erledigt: true, datum: '15. Apr.' },
      { nr: 3, beschreibung: 'Tag 1: Kennenlernen (mit Elternteil)',         erledigt: true, datum: '22. Apr.' },
      { nr: 4, beschreibung: 'Tag 2: Erster kurzer Abschied (10 Min.)',      erledigt: true, datum: '23. Apr.' },
      { nr: 5, beschreibung: 'Tag 3: Abschied 20–30 Minuten',               erledigt: false },
      { nr: 6, beschreibung: 'Tag 4–5: Abschied bis 1 Stunde',              erledigt: false },
      { nr: 7, beschreibung: 'Stabilisierungsphase einleiten',               erledigt: false },
      { nr: 8, beschreibung: 'Schlussphase — Eingewöhnung abschließen',     erledigt: false },
    ],
  },
  {
    id: 'k3', name: 'Lars Böhm', alter: '3 Jahre', gruppe: 'Drachen',
    modell: 'berlin', phase: 'abgeschlossen', start: 'Mo, 10. März',
    bezugserzieherin: 'Fr. Klein', elternteil: 'Mutter Böhm',
    schritte: [
      { nr: 1, beschreibung: 'Erstgespräch',                  erledigt: true, datum: '3. März' },
      { nr: 2, beschreibung: 'Grundphase',                    erledigt: true, datum: '10.–12. März' },
      { nr: 3, beschreibung: 'Stabilisierung',                erledigt: true, datum: '13.–19. März' },
      { nr: 4, beschreibung: 'Schlussphase',                  erledigt: true, datum: '20.–24. März' },
      { nr: 5, beschreibung: 'Eingewöhnung abgeschlossen',    erledigt: true, datum: '25. März' },
    ],
  },
]

export default function EingewoehnungsplanPage() {
  const [kinder, setKinder] = useState(INIT_KINDER)
  const [expanded, setExpanded] = useState<string | null>('k1')
  const [filterPhase, setFilterPhase] = useState<EingewoehnungsPhase | 'alle'>('alle')
  const [kiText, setKiText] = useState<string | null>(null)
  const [kiLaedt, setKiLaedt] = useState(false)

  function schrittToggle(kindId: string, schritt: number) {
    setKinder(prev => prev.map(k => k.id !== kindId ? k : {
      ...k,
      schritte: k.schritte.map(s => s.nr === schritt ? { ...s, erledigt: !s.erledigt, datum: !s.erledigt ? new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : undefined } : s)
    }))
  }

  const aktiv = kinder.filter(k => k.phase !== 'abgeschlossen').length
  const gefiltert = filterPhase === 'alle' ? kinder : kinder.filter(k => k.phase === filterPhase)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      const imFortschritt = kinder.filter(k => k.phase === 'grundphase' || k.phase === 'stabilisierung')
      setKiText(`Eingewöhnung: ${aktiv} aktive Prozesse, ${kinder.filter(k=>k.phase==='abgeschlossen').length} abgeschlossen. ${imFortschritt.map(k => `${k.name.split(' ')[0]} (${PHASE_CFG[k.phase].label})`).join(', ')} benötigen diese Woche besondere Aufmerksamkeit. Mia Krause: erste Woche — Bezugserzieherin Fr. Peters täglich einplanen. Finn: Mittagsschlaf-Phase — geduldig bleiben.`)
      setKiLaedt(false)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Baby className="w-6 h-6 text-amber-500" /> Eingewöhnungsplan
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Berliner & Münchner Modell · Phasen-Tracking</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Gesamt',       val: kinder.length, color: 'text-amber-700' },
          { label: 'Aktiv',        val: aktiv,         color: aktiv > 0 ? 'text-blue-700' : 'text-gray-500' },
          { label: 'Abgeschl.',    val: kinder.length - aktiv, color: 'text-green-700' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-100 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['alle', 'grundphase', 'stabilisierung', 'schlussphase', 'abgeschlossen'] as const).map(p => (
          <button key={p} onClick={() => setFilterPhase(p)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterPhase === p ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
            {p === 'alle' ? 'Alle' : `${PHASE_CFG[p].emoji} ${PHASE_CFG[p].label}`}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(k => {
          const erledigtCount = k.schritte.filter(s => s.erledigt).length
          const pCfg = PHASE_CFG[k.phase]
          const isOpen = expanded === k.id
          const progress = Math.round((erledigtCount / k.schritte.length) * 100)
          return (
            <div key={k.id} className="rounded-2xl border border-amber-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-amber-50/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
                  {k.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{k.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[9px] text-amber-600">{k.alter} · {k.gruppe} · {MODELL_CFG[k.modell].label}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-amber-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[9px] text-amber-600">{erledigtCount}/{k.schritte.length}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${pCfg.bg} ${pCfg.farbe} shrink-0`}>{pCfg.emoji} {pCfg.label}</span>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-100 px-3 pb-3 pt-2 space-y-2.5">
                  <div className="flex gap-3 text-[10px] text-amber-700">
                    <span>Start: {k.start}</span>
                    <span>Bezugserz.: {k.bezugserzieherin}</span>
                  </div>
                  {k.notiz && (
                    <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-2.5 py-2 border border-amber-100">{k.notiz}</p>
                  )}
                  <div className="space-y-1.5">
                    {k.schritte.map(s => (
                      <button key={s.nr} onClick={() => schrittToggle(k.id, s.nr)}
                        className="w-full flex items-center gap-2 text-left hover:opacity-80 transition-opacity">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${s.erledigt ? 'bg-green-500 border-green-500' : 'border-amber-300'}`}>
                          {s.erledigt && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <p className={`text-[10px] flex-1 ${s.erledigt ? 'line-through text-amber-400' : 'text-amber-900'}`}>{s.beschreibung}</p>
                        {s.datum && <span className="text-[9px] text-green-600">{s.datum}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {kiText ? (
        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
          <p className="text-[10px] font-bold flex items-center gap-1 mb-1 text-amber-700"><Sparkles className="w-3 h-3" /> KI-Eingewöhnungsübersicht</p>
          <p className="text-xs leading-relaxed text-amber-900">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Übersicht'}
        </button>
      )}
    </div>
  )
}
