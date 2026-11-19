'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star } from 'lucide-react'

// ── Portfolio-Übersicht — Mindry Kids Admin ───────────────────────────────────
// Entwicklungsportfolios aller Kinder · Stand · Letzte Einträge

type EntwicklungsBereich = 'sprache' | 'motorik' | 'soziales' | 'kognitiv' | 'kreativ' | 'natur' | 'alltag'
type PortfolioStatus = 'aktuell' | 'veraltet' | 'neu' | 'elternfreigabe'

interface PortfolioEintrag {
  datum: string
  bereich: EntwicklungsBereich
  beschreibung: string
  fotoAnzahl: number
}

interface KindPortfolio {
  id: string
  name: string
  gruppe: string
  alter: string
  status: PortfolioStatus
  eintraegeGesamt: number
  letzterEintrag: string
  elternZugang: boolean
  bereiche: { bereich: EntwicklungsBereich; eintraege: number }[]
  neusteEintraege: PortfolioEintrag[]
}

const BEREICH_CFG: Record<EntwicklungsBereich, { label: string; emoji: string; farbe: string }> = {
  sprache:   { label: 'Sprache',        emoji: '💬', farbe: 'bg-blue-50 text-blue-700' },
  motorik:   { label: 'Motorik',        emoji: '🏃', farbe: 'bg-green-50 text-green-700' },
  soziales:  { label: 'Soziales',       emoji: '🤝', farbe: 'bg-orange-50 text-orange-700' },
  kognitiv:  { label: 'Kognition',      emoji: '🧩', farbe: 'bg-indigo-50 text-indigo-700' },
  kreativ:   { label: 'Kreativität',    emoji: '🎨', farbe: 'bg-pink-50 text-pink-700' },
  natur:     { label: 'Natur',          emoji: '🌱', farbe: 'bg-lime-50 text-lime-700' },
  alltag:    { label: 'Alltagsleben',   emoji: '🏠', farbe: 'bg-amber-50 text-amber-700' },
}

const STATUS_CFG: Record<PortfolioStatus, { label: string; farbe: string; dot: string }> = {
  aktuell:        { label: 'Aktuell',          farbe: 'text-green-600',  dot: 'bg-green-400' },
  veraltet:       { label: 'Veraltet',         farbe: 'text-orange-500', dot: 'bg-orange-400' },
  neu:            { label: 'Neu',              farbe: 'text-blue-600',   dot: 'bg-blue-400' },
  elternfreigabe: { label: 'Elternfreigabe',   farbe: 'text-purple-600', dot: 'bg-purple-400' },
}

const PORTFOLIOS: KindPortfolio[] = [
  {
    id: 'p1', name: 'Mia S.', gruppe: 'Schmetterlinge', alter: '4 J.',
    status: 'aktuell', eintraegeGesamt: 23, letzterEintrag: '21.04.2026', elternZugang: true,
    bereiche: [
      { bereich: 'sprache', eintraege: 6 }, { bereich: 'motorik', eintraege: 5 },
      { bereich: 'soziales', eintraege: 4 }, { bereich: 'kreativ', eintraege: 8 },
    ],
    neusteEintraege: [
      { datum: '21.04.2026', bereich: 'kreativ', beschreibung: 'Erstes Selbstportrait gemalt — erkennbare Körperteile.', fotoAnzahl: 3 },
      { datum: '18.04.2026', bereich: 'sprache', beschreibung: 'Erzählt in ganzen Sätzen von Wochenenderlebnissen.', fotoAnzahl: 0 },
    ],
  },
  {
    id: 'p2', name: 'Noah K.', gruppe: 'Schmetterlinge', alter: '3 J.',
    status: 'veraltet', eintraegeGesamt: 8, letzterEintrag: '14.02.2026', elternZugang: false,
    bereiche: [
      { bereich: 'motorik', eintraege: 4 }, { bereich: 'soziales', eintraege: 2 },
      { bereich: 'alltag', eintraege: 2 },
    ],
    neusteEintraege: [
      { datum: '14.02.2026', bereich: 'motorik', beschreibung: 'Treppe alleine rauf und runter ohne Festhalten.', fotoAnzahl: 1 },
    ],
  },
  {
    id: 'p3', name: 'Emilia B.', gruppe: 'Regenbogen', alter: '5 J.',
    status: 'elternfreigabe', eintraegeGesamt: 31, letzterEintrag: '22.04.2026', elternZugang: true,
    bereiche: [
      { bereich: 'sprache', eintraege: 9 }, { bereich: 'kognitiv', eintraege: 7 },
      { bereich: 'soziales', eintraege: 6 }, { bereich: 'kreativ', eintraege: 5 }, { bereich: 'natur', eintraege: 4 },
    ],
    neusteEintraege: [
      { datum: '22.04.2026', bereich: 'kognitiv', beschreibung: 'Löst Puzzles bis 48 Teile selbstständig.', fotoAnzahl: 2 },
      { datum: '20.04.2026', bereich: 'sprache', beschreibung: 'Buchstaben M, A, N erkennt und benennt.', fotoAnzahl: 0 },
    ],
  },
  {
    id: 'p4', name: 'Luca M.', gruppe: 'Regenbogen', alter: '4 J.',
    status: 'neu', eintraegeGesamt: 3, letzterEintrag: '10.04.2026', elternZugang: false,
    bereiche: [
      { bereich: 'alltag', eintraege: 2 }, { bereich: 'soziales', eintraege: 1 },
    ],
    neusteEintraege: [
      { datum: '10.04.2026', bereich: 'alltag', beschreibung: 'Neues Kind — Eingewöhnung abgeschlossen, isst eigenständig.', fotoAnzahl: 1 },
    ],
  },
]

export default function PortfolioUebersichtPage() {
  const [expanded, setExpanded] = useState<string | null>('p1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const veraltet = PORTFOLIOS.filter(p => p.status === 'veraltet').length
  const mitElternzugang = PORTFOLIOS.filter(p => p.elternZugang).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PORTFOLIOS.length} Portfolios: ${veraltet} veraltet — Noah K. seit Feb. nicht aktualisiert. ${mitElternzugang} Familien haben Elternzugang. Emilia B.: Übergangsdoku Schulreife vorbereiten.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-500" /> Portfolio-Übersicht
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Entwicklungsportfolios · Beobachtungen · Elternzugang</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Portfolios',    val: PORTFOLIOS.length, color: 'text-teal-700' },
          { label: 'Veraltet',      val: veraltet,          color: veraltet > 0 ? 'text-orange-500' : 'text-gray-400' },
          { label: 'Elternzugang',  val: mitElternzugang,   color: 'text-purple-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Portfolio-Hinweise</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Portfolio-Hinweise'}
        </button>
      )}

      <div className="space-y-2">
        {PORTFOLIOS.map(p => {
          const isOpen = expanded === p.id
          const stCfg = STATUS_CFG[p.status]
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-teal-700">{p.name.split(' ')[0][0]}{p.name.split(' ')[1]?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${stCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${stCfg.farbe}`}>{stCfg.label}</span>
                    <span className="text-[8px] text-teal-400">{p.gruppe} · {p.alter}</span>
                    {p.elternZugang && <span className="text-[8px] text-purple-500 font-semibold">👨‍👩‍👧 Eltern</span>}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5">{p.name}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{p.eintraegeGesamt} Einträge · zuletzt {p.letzterEintrag}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {/* Bereiche */}
                  <div>
                    <p className="text-[9px] font-bold text-teal-500 uppercase tracking-wide mb-1">Entwicklungsbereiche</p>
                    <div className="flex flex-wrap gap-1">
                      {p.bereiche.map((b, i) => {
                        const bcfg = BEREICH_CFG[b.bereich]
                        return (
                          <span key={i} className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${bcfg.farbe}`}>
                            {bcfg.emoji} {bcfg.label} ({b.eintraege})
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Neueste Einträge */}
                  <div>
                    <p className="text-[9px] font-bold text-teal-500 uppercase tracking-wide mb-1">Neueste Einträge</p>
                    {p.neusteEintraege.map((e, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1">
                        <Star className="w-3 h-3 text-teal-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-teal-900">{e.beschreibung}</p>
                          <p className="text-[8px] text-teal-400">{e.datum} · {BEREICH_CFG[e.bereich].label}{e.fotoAnzahl > 0 ? ` · 📷 ${e.fotoAnzahl} Fotos` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
