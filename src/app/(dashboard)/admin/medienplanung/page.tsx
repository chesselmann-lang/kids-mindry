'use client'

import { useState } from 'react'
import { Tv2, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Star, AlertTriangle } from 'lucide-react'

// ── Medienplanung — Mindry Kids Admin ─────────────────────────────────────────
// Medieneinsatz Kita · Bildschirmzeiten · Altersgerechte Medien

type MedienKategorie = 'digital' | 'buch' | 'hoerspiel' | 'musik' | 'film' | 'spiel'
type AltersGruppe = 'krippe' | 'u3' | 'u6' | 'alle'

interface MedienEintrag {
  id: string
  titel: string
  kategorie: MedienKategorie
  alter: AltersGruppe
  zeitBedarf: string
  ziel: string
  empfohlenVon: string
  bewertet: boolean
  bewertung?: 1 | 2 | 3 | 4 | 5
  notiz?: string
  eingesetzt: boolean
}

interface WochenMediaplan {
  wochentag: string
  einheit: string
  kategorie: MedienKategorie
  dauer: number
  gruppe: string
}

const KAT_CFG: Record<MedienKategorie, { label: string; emoji: string; farbe: string }> = {
  digital:   { label: 'Digital/App',   emoji: '📱', farbe: 'bg-blue-50 text-blue-700' },
  buch:      { label: 'Buch',          emoji: '📚', farbe: 'bg-green-50 text-green-700' },
  hoerspiel: { label: 'Hörspiel',      emoji: '🎧', farbe: 'bg-purple-50 text-purple-700' },
  musik:     { label: 'Musik',         emoji: '🎵', farbe: 'bg-pink-50 text-pink-700' },
  film:      { label: 'Film/Video',    emoji: '🎬', farbe: 'bg-orange-50 text-orange-700' },
  spiel:     { label: 'Brettspiel',    emoji: '🎲', farbe: 'bg-amber-50 text-amber-700' },
}

const ALTER_LABEL: Record<AltersGruppe, string> = {
  krippe: 'Krippe (0–2)',
  u3:     'U3 (2–3)',
  u6:     'U6 (3–6)',
  alle:   'Alle',
}

const MEDIEN: MedienEintrag[] = [
  {
    id: 'm1', titel: 'Kinder-App: "Tiptoi" Lern-Stift',
    kategorie: 'digital', alter: 'u6', zeitBedarf: '15 Min.',
    ziel: 'Sprachförderung, Sachkunde', empfohlenVon: 'Fr. Hartmann',
    bewertet: true, bewertung: 5, eingesetzt: true,
    notiz: 'Kinder sehr begeistert. Tiere-Set sehr beliebt.',
  },
  {
    id: 'm2', titel: '"Der Grüffelo" (Buch + Hörspiel)',
    kategorie: 'buch', alter: 'u6', zeitBedarf: '20 Min.',
    ziel: 'Fantasie, Sprachentwicklung, Zuhören', empfohlenVon: 'Fr. Klein',
    bewertet: true, bewertung: 5, eingesetzt: true,
  },
  {
    id: 'm3', titel: 'Lernfilm: "Kikaninchen" (KiKA)',
    kategorie: 'film', alter: 'u3', zeitBedarf: '10 Min.',
    ziel: 'Sprachförderung, einfache Konzepte', empfohlenVon: 'Fr. Becker',
    bewertet: true, bewertung: 3, eingesetzt: false,
    notiz: 'Max. 10 Min. Bildschirmzeit für U3 beachten — Kita-Medienkonzept §2.',
  },
  {
    id: 'm4', titel: 'Hörspiel "Benjamin Blümchen"',
    kategorie: 'hoerspiel', alter: 'alle', zeitBedarf: '20 Min.',
    ziel: 'Zuhören, Fantasie, Ruhezeit', empfohlenVon: 'Elternwunsch',
    bewertet: false, eingesetzt: true,
  },
  {
    id: 'm5', titel: 'Kinderlied-Sammlung "Lieder für die Kita"',
    kategorie: 'musik', alter: 'alle', zeitBedarf: '15 Min.',
    ziel: 'Rhythmus, Sprache, Gemeinschaft', empfohlenVon: 'Fr. Hartmann',
    bewertet: true, bewertung: 4, eingesetzt: true,
  },
]

const WOCHENPLAN: WochenMediaplan[] = [
  { wochentag: 'Mo', einheit: 'Hörspiel Morgenkreis',     kategorie: 'hoerspiel', dauer: 10, gruppe: 'Alle' },
  { wochentag: 'Di', einheit: 'Tiptoi-Station',            kategorie: 'digital',   dauer: 15, gruppe: 'Schmetterlinge' },
  { wochentag: 'Mi', einheit: 'Bilderbuch Vorlesezeit',    kategorie: 'buch',      dauer: 20, gruppe: 'Alle' },
  { wochentag: 'Do', einheit: 'Liedeinheit Elternfest',    kategorie: 'musik',     dauer: 20, gruppe: 'Alle' },
  { wochentag: 'Fr', einheit: 'Freie Spielzeit mit Medien',kategorie: 'spiel',     dauer: 30, gruppe: 'Alle' },
]

export default function MedienplanungPage() {
  const [expanded, setExpanded] = useState<string | null>('m1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const eingesetzt = MEDIEN.filter(m => m.eingesetzt).length
  const bewertet = MEDIEN.filter(m => m.bewertet).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${MEDIEN.length} Medien erfasst: ${eingesetzt} bereits eingesetzt, ${bewertet} bewertet. Tiptoi + Grüffelo Top-Empfehlungen (⭐5). Film-Einheit U3: Bildschirmzeit max. 10 Min. beachten!`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Tv2 className="w-6 h-6 text-teal-500" /> Medienplanung
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Medienkonzept · Materialien · Wöchentlicher Medieneinsatz</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Medien',     val: MEDIEN.length, color: 'text-teal-700' },
          { label: 'Eingesetzt', val: eingesetzt,    color: 'text-green-600' },
          { label: 'Bewertet',   val: bewertet,      color: 'text-purple-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Medientipps</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Medientipps'}
        </button>
      )}

      {/* Wochenplan */}
      <div>
        <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide mb-2">Wöchentlicher Medieneinsatz</p>
        <div className="rounded-2xl border border-teal-100 bg-white overflow-hidden divide-y divide-teal-100">
          {WOCHENPLAN.map((w, i) => {
            const kCfg = KAT_CFG[w.kategorie]
            return (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                <span className="text-[9px] font-bold text-teal-500 w-6 shrink-0">{w.wochentag}</span>
                <span className="text-base">{kCfg.emoji}</span>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-teal-900">{w.einheit}</p>
                  <p className="text-[8px] text-teal-400">{w.gruppe} · {w.dauer} Min.</p>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${kCfg.farbe}`}>{kCfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Medienliste */}
      <div className="space-y-2">
        {MEDIEN.map(m => {
          const isOpen = expanded === m.id
          const kCfg = KAT_CFG[m.kategorie]
          return (
            <div key={m.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : m.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-lg">
                  {kCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${kCfg.farbe}`}>{kCfg.label}</span>
                    <span className="text-[8px] text-teal-400">{ALTER_LABEL[m.alter]}</span>
                    {m.eingesetzt && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{m.titel}</p>
                  {m.bewertet && m.bewertung && (
                    <p className="text-[8px] text-yellow-500">{'⭐'.repeat(m.bewertung)} · {m.zeitBedarf}</p>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-1.5">
                  <p className="text-[9px] text-teal-600"><Star className="w-2.5 h-2.5 inline mr-1 text-teal-400" />Ziel: {m.ziel}</p>
                  <p className="text-[9px] text-teal-400">Empfohlen von: {m.empfohlenVon}</p>
                  {m.notiz && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5 mt-1">
                      <p className="text-[9px] text-amber-700"><AlertTriangle className="w-2.5 h-2.5 inline mr-1" />{m.notiz}</p>
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
