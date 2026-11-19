'use client'

import { useState } from 'react'
import { Sun, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star } from 'lucide-react'

// ── Tagesreflexion — Mindry Kids Admin ───────────────────────────────────────
// Pädagogische Tagesreflexion · Teamnotizen · Beobachtungen · Übergaben

type ReflexionsTyp = 'beobachtung' | 'vorfall' | 'entwicklung' | 'elternkontakt' | 'teaminfo' | 'nachricht'
type Stimmung = 'sehr_gut' | 'gut' | 'neutral' | 'schwierig' | 'herausfordernd'

interface ReflexionsEintrag {
  id: string
  datum: string
  wochentag: string
  stimmung: Stimmung
  gruppe: string
  verfasser: string
  eintraege: {
    typ: ReflexionsTyp
    kind?: string
    text: string
    wichtig: boolean
  }[]
  weitergabe?: string
  morgen?: string
}

const TYP_CFG: Record<ReflexionsTyp, { emoji: string; label: string; farbe: string }> = {
  beobachtung:  { emoji: '👁️', label: 'Beobachtung',   farbe: 'text-blue-600' },
  vorfall:      { emoji: '⚠️', label: 'Vorfall',        farbe: 'text-red-600' },
  entwicklung:  { emoji: '🌱', label: 'Entwicklung',    farbe: 'text-green-600' },
  elternkontakt:{ emoji: '👨‍👩‍👧', label: 'Elternkontakt', farbe: 'text-orange-600' },
  teaminfo:     { emoji: '📋', label: 'Team-Info',      farbe: 'text-indigo-600' },
  nachricht:    { emoji: '💬', label: 'Nachricht',      farbe: 'text-teal-600' },
}

const STIMMUNG_CFG: Record<Stimmung, { emoji: string; label: string; farbe: string }> = {
  sehr_gut:       { emoji: '😄', label: 'Sehr gut',        farbe: 'text-green-600' },
  gut:            { emoji: '🙂', label: 'Gut',              farbe: 'text-teal-600' },
  neutral:        { emoji: '😐', label: 'Neutral',          farbe: 'text-gray-500' },
  schwierig:      { emoji: '😔', label: 'Schwierig',        farbe: 'text-orange-600' },
  herausfordernd: { emoji: '😤', label: 'Herausfordernd',   farbe: 'text-red-600' },
}

const EINTRAEGE: ReflexionsEintrag[] = [
  {
    id: 'tr1', datum: '24.04.2026', wochentag: 'Freitag',
    stimmung: 'gut', gruppe: 'Schmetterlinge (3–4 J.)', verfasser: 'Fr. Reiter',
    eintraege: [
      { typ: 'entwicklung', kind: 'Emma B.', text: 'Emma hat heute erstmals freiwillig an der Bastelstation teilgenommen — großer Schritt!', wichtig: true },
      { typ: 'beobachtung', kind: 'Max F.', text: 'Max war sehr ruhig nach dem Mittagsschlaf, Eltern informieren bzgl. Schlafqualität.', wichtig: false },
      { typ: 'elternkontakt', text: 'Frau Fischer fragt nach Möglichkeit der verlängerten Betreuung ab Herbst.', wichtig: false },
      { typ: 'teaminfo', text: 'Morgen kommt Praktikantin Sophie — bitte kurze Einführung einplanen.', wichtig: true },
    ],
    weitergabe: 'Praktikantin Sophie einweisen · Emma-Entwicklung weiter beobachten',
    morgen: 'Freitagskreis: Wochenzusammenfassung mit Kindern',
  },
  {
    id: 'tr2', datum: '23.04.2026', wochentag: 'Donnerstag',
    stimmung: 'herausfordernd', gruppe: 'Schmetterlinge (3–4 J.)', verfasser: 'Fr. Keller',
    eintraege: [
      { typ: 'vorfall', kind: 'Lena K.', text: 'Lena und Niklas hatten heftigen Streit um Spielzeug — beide weinten. Deeskaliert, beide Eltern informiert.', wichtig: true },
      { typ: 'beobachtung', text: 'Gruppe generell unruhig — möglicherweise Wetterumschwung.', wichtig: false },
      { typ: 'entwicklung', kind: 'Jonas S.', text: 'Jonas hat beim Vorlesen erstmals selbst Buchstaben erkannt — sehr begeistert!', wichtig: false },
      { typ: 'nachricht', text: 'Eltern Braun bestätigen Sommerfest-Teilnahme.', wichtig: false },
    ],
    weitergabe: 'Lena/Niklas-Situation beobachten · Gruppenklima prüfen',
  },
  {
    id: 'tr3', datum: '22.04.2026', wochentag: 'Mittwoch',
    stimmung: 'sehr_gut', gruppe: 'Schmetterlinge (3–4 J.)', verfasser: 'Fr. Huber',
    eintraege: [
      { typ: 'teaminfo', text: 'Projektarbeit "Unser Garten" gestartet — Kinder sehr begeistert!', wichtig: true },
      { typ: 'beobachtung', text: 'Alle 18 Kinder anwesend — sehr lebhafter Tag.', wichtig: false },
      { typ: 'elternkontakt', text: 'Herr Müller bittet um Gespräch wegen Übergangsprotokoll Max — Termin für 28.04. vereinbart.', wichtig: true },
    ],
    weitergabe: 'Garten-Projekt: Materialien bereitstellen · Termin Müller im Kalender',
    morgen: 'Gartenarbeit fortsetzen — Erde + Samen mitbringen!',
  },
]

export default function TagesreflexionPage() {
  const [expanded, setExpanded] = useState<string | null>('tr1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const wichtigeEintraege = EINTRAEGE.flatMap(e => e.eintraege).filter(e => e.wichtig).length
  const vorfaelle = EINTRAEGE.flatMap(e => e.eintraege).filter(e => e.typ === 'vorfall').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Tagesreflexionen diese Woche. ${wichtigeEintraege} wichtige Einträge — ${vorfaelle} Vorfall(Vorfälle) protokolliert. Emma B.: positive Entwicklung! Lena/Niklas-Situation weiter beobachten. Termin Müller 28.04. im Blick.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Sun className="w-6 h-6 text-teal-500" /> Tagesreflexion
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Pädagogische Notizen · Übergaben · Teaminfo</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Einträge',   val: EINTRAEGE.length,   color: 'text-teal-700' },
          { label: 'Wichtig',    val: wichtigeEintraege,  color: wichtigeEintraege > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Vorfälle',   val: vorfaelle,          color: vorfaelle > 0 ? 'text-red-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Wochenüberblick</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Wochenüberblick'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const stimmCfg = STIMMUNG_CFG[e.stimmung]
          const wichtigCount = e.eintraege.filter(ei => ei.wichtig).length
          return (
            <div key={e.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl border border-teal-100 bg-teal-50 flex items-center justify-center shrink-0 text-xl">
                  {stimmCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-teal-900">{e.wochentag}, {e.datum}</p>
                    <span className={`text-[8px] font-semibold ${stimmCfg.farbe}`}>{stimmCfg.label}</span>
                  </div>
                  <p className="text-[9px] text-teal-400">{e.gruppe} · {e.verfasser}</p>
                  <p className="text-[9px] text-teal-500 mt-0.5">{e.eintraege.length} Einträge{wichtigCount > 0 ? ` · ${wichtigCount} wichtig ⚡` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <div className="space-y-1.5">
                    {e.eintraege.map((ei, i) => {
                      const eiCfg = TYP_CFG[ei.typ]
                      return (
                        <div key={i} className={`rounded-lg px-2 py-1.5 ${ei.wichtig ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50 border border-gray-100'}`}>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="text-sm">{eiCfg.emoji}</span>
                            <span className={`text-[8px] font-semibold ${eiCfg.farbe}`}>{eiCfg.label}</span>
                            {ei.kind && <span className="text-[8px] text-teal-600 font-semibold">· {ei.kind}</span>}
                            {ei.wichtig && <span className="text-[8px] text-amber-600 font-semibold ml-auto">⚡ Wichtig</span>}
                          </div>
                          <p className="text-[9px] text-teal-900 leading-relaxed">{ei.text}</p>
                        </div>
                      )
                    })}
                  </div>

                  {e.weitergabe && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1.5">
                      <p className="text-[8px] font-bold text-indigo-500 mb-0.5">📤 Weitergabe an nächste Schicht:</p>
                      <p className="text-[9px] text-indigo-800">{e.weitergabe}</p>
                    </div>
                  )}

                  {e.morgen && (
                    <div className="bg-teal-50 border border-teal-100 rounded-lg px-2 py-1.5">
                      <p className="text-[8px] font-bold text-teal-500 mb-0.5">☀️ Morgen:</p>
                      <p className="text-[9px] text-teal-800">{e.morgen}</p>
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
