'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, Search, Star, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Motorikentwicklung — Mindry Kids ─────────────────────────────────────────
// Grob-/Feinmotorik · Meilensteine · Fördermaßnahmen

type MotorikNiveau = 'vorzeitig' | 'altersgerecht' | 'leichteVerzoegerung' | 'starkeVerzoegerung'
type MotorikBereich = 'grobmotorik' | 'feinmotorik' | 'koerperwahrnehmung' | 'koordination'

interface MotorikMeilenstein {
  text: string
  alter: string
  erreicht: boolean
}

interface MotorikKind {
  id: string
  name: string
  alter: string
  gruppe: string
  niveau: MotorikNiveau
  bereiche: Record<MotorikBereich, 1|2|3|4>
  meilensteine: MotorikMeilenstein[]
  foerderung: string[]
  ergotherapie?: boolean
  letzteBeurteilung: string
}

const NIVEAU_CFG: Record<MotorikNiveau, { label: string; farbe: string; bg: string; border: string }> = {
  vorzeitig:          { label: 'Vorzeitig',      farbe: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  altersgerecht:      { label: 'Altersgerecht',  farbe: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  leichteVerzoegerung:{ label: 'Leichte Verz.',  farbe: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  starkeVerzoegerung: { label: 'Starke Verz.',   farbe: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
}

const BEREICH_CFG: Record<MotorikBereich, { label: string; emoji: string }> = {
  grobmotorik:       { label: 'Grobmotorik',   emoji: '🤸' },
  feinmotorik:       { label: 'Feinmotorik',   emoji: '✏️' },
  koerperwahrnehmung:{ label: 'Körperwahrn.',  emoji: '🧠' },
  koordination:      { label: 'Koordination',  emoji: '⚖️' },
}

const PUNKTE_EMOJI: Record<1|2|3|4, string> = { 1: '○', 2: '◑', 3: '◕', 4: '●' }
const PUNKTE_FARBE: Record<1|2|3|4, string> = { 1: 'text-red-600', 2: 'text-orange-600', 3: 'text-blue-600', 4: 'text-green-600' }

const INIT_KINDER: MotorikKind[] = [
  {
    id: 'k1', name: 'Noah Fischer', alter: '4;3', gruppe: 'Sonnenkäfer', niveau: 'altersgerecht', letzteBeurteilung: '20.03.2025',
    bereiche: { grobmotorik: 3, feinmotorik: 3, koerperwahrnehmung: 4, koordination: 3 },
    meilensteine: [
      { text: 'Sicher laufen & rennen', alter: '2;0', erreicht: true },
      { text: 'Einbeinig hüpfen (4 J.)', alter: '4;0', erreicht: true },
      { text: 'Stift korrekt halten (4 J.)', alter: '4;0', erreicht: true },
      { text: 'Schere benutzen (4,5 J.)', alter: '4;6', erreicht: false },
    ],
    foerderung: ['Bewegungsbaustelle', 'Regelspiele'],
  },
  {
    id: 'k2', name: 'Lara Hoffmann', alter: '3;10', gruppe: 'Marienkäfer', niveau: 'leichteVerzoegerung', letzteBeurteilung: '15.04.2025',
    bereiche: { grobmotorik: 2, feinmotorik: 2, koerperwahrnehmung: 2, koordination: 2 },
    meilensteine: [
      { text: 'Sicher laufen & rennen', alter: '2;0', erreicht: true },
      { text: 'Treppen steigen ohne Halt (3 J.)', alter: '3;0', erreicht: false },
      { text: 'Einfache Formen nachzeichnen (3,5 J.)', alter: '3;6', erreicht: false },
    ],
    foerderung: ['Psychomotorische Förderung Di', 'Kneipp-Pfade', 'Motorikparcours'],
  },
  {
    id: 'k3', name: 'Finn Bauer', alter: '5;2', gruppe: 'Sonnenkäfer', niveau: 'starkeVerzoegerung', letzteBeurteilung: '10.04.2025', ergotherapie: true,
    bereiche: { grobmotorik: 1, feinmotorik: 1, koerperwahrnehmung: 2, koordination: 1 },
    meilensteine: [
      { text: 'Sicher laufen & rennen', alter: '2;0', erreicht: true },
      { text: 'Ball fangen & werfen (4 J.)', alter: '4;0', erreicht: false },
      { text: 'Stift korrekt halten (4 J.)', alter: '4;0', erreicht: false },
      { text: 'An- und Ausziehen (5 J.)', alter: '5;0', erreicht: false },
    ],
    foerderung: ['Ergotherapie wöchentlich', 'Kleingruppe Feinmotorik', 'Elternberatung Alltagsmotorik'],
  },
  {
    id: 'k4', name: 'Hanna Weber', alter: '4;7', gruppe: 'Marienkäfer', niveau: 'vorzeitig', letzteBeurteilung: '05.04.2025',
    bereiche: { grobmotorik: 4, feinmotorik: 4, koerperwahrnehmung: 4, koordination: 4 },
    meilensteine: [
      { text: 'Einbeinig hüpfen (4 J.)', alter: '3;6', erreicht: true },
      { text: 'Stift korrekt halten (4 J.)', alter: '3;4', erreicht: true },
      { text: 'Schere benutzen (4,5 J.)', alter: '4;0', erreicht: true },
    ],
    foerderung: ['Sporttanz-AG', 'Fortgeschrittene Bewegungsangebote'],
  },
]

export default function MotorikPage() {
  const [expanded, setExpanded] = useState<string | null>('k3')
  const [suchtext, setSuchtext] = useState('')
  const [kiTexts, setKiTexts] = useState<Record<string, string>>({})
  const [kiLaedt, setKiLaedt] = useState<string | null>(null)

  const gefiltert = INIT_KINDER.filter(k =>
    k.name.toLowerCase().includes(suchtext.toLowerCase()) ||
    k.gruppe.toLowerCase().includes(suchtext.toLowerCase())
  )

  const foerderBedarf = INIT_KINDER.filter(k => k.niveau === 'starkeVerzoegerung' || k.niveau === 'leichteVerzoegerung').length
  const ergoKinder = INIT_KINDER.filter(k => k.ergotherapie).length

  function kiAnfordern(k: MotorikKind) {
    setKiLaedt(k.id)
    setTimeout(() => {
      const schwach = Object.entries(k.bereiche).filter(([,v]) => v <= 2).map(([b]) => BEREICH_CFG[b as MotorikBereich].label)
      setKiTexts(prev => ({ ...prev, [k.id]: `Förderempfehlung für ${k.name}: Niveau "${NIVEAU_CFG[k.niveau].label}". ${schwach.length > 0 ? `Schwächen in: ${schwach.join(', ')}.` : 'Gut entwickelt.'} ${k.ergotherapie ? 'Ergotherapie läuft — Ziele abstimmen.' : k.niveau === 'starkeVerzoegerung' ? 'Ergotherapeutische Abklärung empfehlen.' : ''} Alltagsintegration: Knetmasse, Schere, Klettergerüst.` }))
      setKiLaedt(null)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <span className="text-2xl">🤸</span> Motorikentwicklung
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Grob-/Feinmotorik · Meilensteine · Fördermaßnahmen</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kinder',       val: INIT_KINDER.length, color: 'text-amber-700' },
          { label: 'Förderbedarf', val: foerderBedarf,      color: foerderBedarf > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Ergotherapie', val: ergoKinder,         color: ergoKinder > 0 ? 'text-blue-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {INIT_KINDER.filter(k => k.niveau === 'starkeVerzoegerung').map(k => (
        <div key={k.id} className="rounded-2xl bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-800"><span className="font-semibold">{k.name}</span> — Starke Motorik-Verzögerung{k.ergotherapie ? ' · Ergo aktiv' : ' · Ergo empfohlen'}</p>
        </div>
      ))}

      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
        <input value={suchtext} onChange={e => setSuchtext(e.target.value)}
          placeholder="Kind oder Gruppe suchen…"
          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-400 text-amber-900" />
      </div>

      <div className="space-y-2">
        {gefiltert.map(k => {
          const nCfg = NIVEAU_CFG[k.niveau]
          const isOpen = expanded === k.id
          return (
            <div key={k.id} className={`rounded-2xl border overflow-hidden ${nCfg.border} ${nCfg.bg}`}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                  {k.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{k.name}
                    {k.ergotherapie && <span className="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1 rounded-full">Ergo</span>}
                  </p>
                  <p className="text-[9px] text-amber-600 mt-0.5">{k.gruppe} · {k.alter} J.</p>
                </div>
                <div className="grid grid-cols-4 gap-1 shrink-0">
                  {(Object.entries(k.bereiche) as [MotorikBereich, 1|2|3|4][]).map(([b, v]) => (
                    <span key={b} className={`text-xs font-bold ${PUNKTE_FARBE[v]}`}>{PUNKTE_EMOJI[v]}</span>
                  ))}
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${nCfg.bg} ${nCfg.farbe} ${nCfg.border}`}>{nCfg.label}</span>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-200/50 px-3 pb-3 pt-2 space-y-2.5">
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(k.bereiche) as [MotorikBereich, 1|2|3|4][]).map(([b, v]) => (
                      <div key={b} className="text-center">
                        <p className="text-base">{BEREICH_CFG[b].emoji}</p>
                        <p className={`text-sm font-bold ${PUNKTE_FARBE[v]}`}>{PUNKTE_EMOJI[v]}</p>
                        <p className="text-[8px] text-amber-600">{BEREICH_CFG[b].label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">Meilensteine</p>
                    {k.meilensteine.map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${m.erreicht ? 'text-green-500' : 'text-amber-200'}`} />
                        <p className={`text-[10px] flex-1 ${m.erreicht ? 'text-amber-600' : 'text-amber-900'}`}>{m.text}</p>
                        <span className="text-[9px] text-amber-400 shrink-0">{m.alter}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {k.foerderung.map((f,i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">{f}</span>
                    ))}
                  </div>

                  {kiTexts[k.id] ? (
                    <div className="rounded-xl p-2.5 bg-orange-50 border border-orange-200">
                      <p className="text-[9px] font-bold text-orange-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Empfehlung</p>
                      <p className="text-[10px] text-orange-900 leading-relaxed">{kiTexts[k.id]}</p>
                    </div>
                  ) : (
                    <button onClick={() => kiAnfordern(k)} disabled={kiLaedt === k.id}
                      className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {kiLaedt === k.id ? 'KI analysiert...' : 'KI-Förderempfehlung'}
                    </button>
                  )}
                  <p className="text-[9px] text-amber-400">Letzte Beurteilung: {k.letzteBeurteilung}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
