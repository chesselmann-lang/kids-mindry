'use client'

import { useState } from 'react'
import { MessageSquare, ChevronDown, ChevronUp, Sparkles, Search, Star, AlertTriangle, CheckCircle2 } from 'lucide-react'

// ── Sprachentwicklung — Mindry Kids ──────────────────────────────────────────
// Sprachstand · Meilensteine · Fördermaßnahmen · SISMIK-Analog

type SprachNiveau = 'altersgerecht' | 'leichteVerzoegerung' | 'starkeVerzoegerung' | 'vorzeitig'
type Sprachbereich = 'wortschatz' | 'grammatik' | 'aussprache' | 'kommunikation' | 'literacy'

interface SprachMeilenstein {
  text: string
  erreicht: boolean
  alter?: string
}

interface SprachKind {
  id: string
  name: string
  alter: string  // z.B. "3;4" (3 Jahre, 4 Monate)
  gruppe: string
  niveau: SprachNiveau
  erstsprache: string
  zweisprachig: boolean
  bereiche: Record<Sprachbereich, { punktzahl: 1|2|3|4; notiz?: string }>
  meilensteine: SprachMeilenstein[]
  foerdermassnahmen: string[]
  logopaedie?: boolean
  letzteBeurteilung: string
}

const NIVEAU_CFG: Record<SprachNiveau, { label: string; farbe: string; bg: string; border: string }> = {
  altersgerecht:      { label: 'Altersgerecht',       farbe: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  leichteVerzoegerung:{ label: 'Leichte Verzögerung',  farbe: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  starkeVerzoegerung: { label: 'Starke Verzögerung',   farbe: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
  vorzeitig:          { label: 'Vorzeitig entwickelt', farbe: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200' },
}

const BEREICH_CFG: Record<Sprachbereich, { label: string; emoji: string }> = {
  wortschatz:    { label: 'Wortschatz',     emoji: '📖' },
  grammatik:     { label: 'Grammatik',      emoji: '🔤' },
  aussprache:    { label: 'Aussprache',     emoji: '🗣️' },
  kommunikation: { label: 'Kommunikation',  emoji: '💬' },
  literacy:      { label: 'Literacy',       emoji: '📚' },
}

const PUNKTE_CFG: Record<1|2|3|4, { label: string; farbe: string; emoji: string }> = {
  1: { label: 'Noch nicht',  farbe: 'text-red-600',    emoji: '○' },
  2: { label: 'Im Aufbau',   farbe: 'text-orange-600', emoji: '◑' },
  3: { label: 'Entwickelt',  farbe: 'text-blue-600',   emoji: '◕' },
  4: { label: 'Sicher',      farbe: 'text-green-600',  emoji: '●' },
}

const INIT_KINDER: SprachKind[] = [
  {
    id: 'k1', name: 'Leon Maier', alter: '4;2', gruppe: 'Sonnenkäfer', niveau: 'altersgerecht',
    erstsprache: 'Deutsch', zweisprachig: false, letzteBeurteilung: '15.03.2025',
    bereiche: {
      wortschatz:    { punktzahl: 3 },
      grammatik:     { punktzahl: 3, notiz: 'Plural noch unsicher' },
      aussprache:    { punktzahl: 4 },
      kommunikation: { punktzahl: 4 },
      literacy:      { punktzahl: 3 },
    },
    meilensteine: [
      { text: 'Einfache Sätze bilden (3 Jahre)', erreicht: true, alter: '3;0' },
      { text: 'W-Fragen stellen (3–4 Jahre)', erreicht: true, alter: '3;6' },
      { text: 'Komplexe Sätze (4 Jahre)', erreicht: true, alter: '4;0' },
      { text: 'Buchstaben erkennen (5 Jahre)', erreicht: false },
    ],
    foerdermassnahmen: ['Bücher vorlesen', 'Sprachspiele Gruppe'],
  },
  {
    id: 'k2', name: 'Mia Schulz', alter: '3;8', gruppe: 'Marienkäfer', niveau: 'leichteVerzoegerung',
    erstsprache: 'Türkisch', zweisprachig: true, letzteBeurteilung: '20.03.2025', logopaedie: false,
    bereiche: {
      wortschatz:    { punktzahl: 2, notiz: 'Deutsch-Wortschatz aufbau' },
      grammatik:     { punktzahl: 2 },
      aussprache:    { punktzahl: 3 },
      kommunikation: { punktzahl: 3 },
      literacy:      { punktzahl: 2 },
    },
    meilensteine: [
      { text: 'Einfache Sätze bilden (3 Jahre)', erreicht: true, alter: '3;2' },
      { text: 'Deutsch-Grundwortschatz (3,5 Jahre)', erreicht: false },
      { text: 'W-Fragen stellen (3–4 Jahre)', erreicht: false },
    ],
    foerdermassnahmen: ['Gezielte DaZ-Förderung', 'Bilderbuchbetrachtung Deutsch', 'Elterngespräch Zweisprachigkeit'],
  },
  {
    id: 'k3', name: 'Felix Braun', alter: '5;1', gruppe: 'Sonnenkäfer', niveau: 'starkeVerzoegerung',
    erstsprache: 'Deutsch', zweisprachig: false, letzteBeurteilung: '10.04.2025', logopaedie: true,
    bereiche: {
      wortschatz:    { punktzahl: 2 },
      grammatik:     { punktzahl: 1, notiz: 'Telegrammstil, kaum Satzkonstruktionen' },
      aussprache:    { punktzahl: 1, notiz: 'S/Z/Sch undeutlich, Logopädie läuft' },
      kommunikation: { punktzahl: 2 },
      literacy:      { punktzahl: 1 },
    },
    meilensteine: [
      { text: 'Komplexe Sätze (4 Jahre)', erreicht: false },
      { text: 'Erzählen von Ereignissen (4,5 Jahre)', erreicht: false },
      { text: 'Buchstaben erkennen (5 Jahre)', erreicht: false },
    ],
    foerdermassnahmen: ['Logopädie wöchentlich', 'Kleine Sprachgruppe 1:3', 'Enger Elternkontakt', 'Schulreifeprüfung absprechen'],
  },
  {
    id: 'k4', name: 'Sophie Klein', alter: '4;9', gruppe: 'Marienkäfer', niveau: 'vorzeitig',
    erstsprache: 'Deutsch', zweisprachig: true, letzteBeurteilung: '05.04.2025',
    bereiche: {
      wortschatz:    { punktzahl: 4, notiz: 'Sehr differenzierter Wortschatz' },
      grammatik:     { punktzahl: 4 },
      aussprache:    { punktzahl: 4 },
      kommunikation: { punktzahl: 4 },
      literacy:      { punktzahl: 4 },
    },
    meilensteine: [
      { text: 'Komplexe Sätze (4 Jahre)', erreicht: true, alter: '3;8' },
      { text: 'Erzählen von Ereignissen', erreicht: true, alter: '4;0' },
      { text: 'Buchstaben erkennen (5 Jahre)', erreicht: true, alter: '4;6' },
      { text: 'Lesen lernen (6 Jahre)', erreicht: false },
    ],
    foerdermassnahmen: ['Vorschulprogramm', 'Leseprojekte', 'Bilinguales Angebot Englisch'],
  },
]

export default function SprachentwicklungPage() {
  const [expanded, setExpanded] = useState<string | null>('k2')
  const [filterNiveau, setFilterNiveau] = useState<'alle' | SprachNiveau>('alle')
  const [suchtext, setSuchtext] = useState('')
  const [kiTexts, setKiTexts] = useState<Record<string, string>>({})
  const [kiLaedt, setKiLaedt] = useState<string | null>(null)

  const gefiltert = INIT_KINDER.filter(k => {
    const niveauOk = filterNiveau === 'alle' || k.niveau === filterNiveau
    const suchOk = k.name.toLowerCase().includes(suchtext.toLowerCase()) ||
      k.gruppe.toLowerCase().includes(suchtext.toLowerCase())
    return niveauOk && suchOk
  })

  const foerderBedarf = INIT_KINDER.filter(k => k.niveau === 'starkeVerzoegerung' || k.niveau === 'leichteVerzoegerung').length
  const logoKinder = INIT_KINDER.filter(k => k.logopaedie).length

  function kiAnfordern(k: SprachKind) {
    setKiLaedt(k.id)
    setTimeout(() => {
      const schwacheBereiche = Object.entries(k.bereiche).filter(([,v]) => v.punktzahl <= 2).map(([b]) => BEREICH_CFG[b as Sprachbereich].label)
      setKiTexts(prev => ({ ...prev, [k.id]: `Förderempfehlung für ${k.name} (${k.alter} Jahre, Niveau: ${NIVEAU_CFG[k.niveau].label}): ${schwacheBereiche.length > 0 ? `Schwerpunkte: ${schwacheBereiche.join(', ')}.` : 'Gut entwickelt.'} ${k.zweisprachig ? 'Zweisprachigkeit als Ressource nutzen.' : ''} ${k.logopaedie ? 'Logopädie läuft — enger Austausch halten.' : k.niveau === 'starkeVerzoegerung' ? 'Logopädische Abklärung empfohlen.' : ''}` }))
      setKiLaedt(null)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-amber-500" /> Sprachentwicklung
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Sprachstand · Meilensteine · Fördermaßnahmen</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Kinder',        val: INIT_KINDER.length, color: 'text-amber-700' },
          { label: 'Förderbedarf',  val: foerderBedarf,      color: foerderBedarf > 0 ? 'text-orange-600' : 'text-gray-400' },
          { label: 'Logopädie',     val: logoKinder,         color: logoKinder > 0 ? 'text-blue-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Starke Verzögerung Banner */}
      {INIT_KINDER.filter(k => k.niveau === 'starkeVerzoegerung').map(k => (
        <div key={k.id} className="rounded-2xl bg-red-50 border border-red-200 px-3 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-800"><span className="font-semibold">{k.name}</span> — Starke Sprachverzögerung{k.logopaedie ? ' · Logopädie aktiv' : ' · Logopädie empfohlen'}</p>
        </div>
      ))}

      {/* Suche */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
        <input value={suchtext} onChange={e => setSuchtext(e.target.value)}
          placeholder="Kind oder Gruppe suchen…"
          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-amber-200 bg-white focus:outline-none focus:border-amber-400 text-amber-900" />
      </div>

      {/* Niveau-Filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilterNiveau('alle')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterNiveau === 'alle' ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          Alle
        </button>
        {(Object.keys(NIVEAU_CFG) as SprachNiveau[]).map(n => (
          <button key={n} onClick={() => setFilterNiveau(n)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterNiveau === n ? `bg-amber-500 text-white border-amber-500` : `${NIVEAU_CFG[n].bg} ${NIVEAU_CFG[n].farbe} ${NIVEAU_CFG[n].border}`}`}>
            {NIVEAU_CFG[n].label}
          </button>
        ))}
      </div>

      {/* Kinder */}
      <div className="space-y-2">
        {gefiltert.map(k => {
          const nCfg = NIVEAU_CFG[k.niveau]
          const isOpen = expanded === k.id
          const avgPunkte = Math.round(Object.values(k.bereiche).reduce((s,b)=>s+b.punktzahl,0) / Object.keys(k.bereiche).length) as 1|2|3|4
          return (
            <div key={k.id} className={`rounded-2xl border overflow-hidden ${nCfg.border} ${nCfg.bg}`}>
              <button onClick={() => setExpanded(isOpen ? null : k.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                  {k.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{k.name}
                    {k.logopaedie && <span className="ml-1 text-[9px] bg-blue-100 text-blue-700 px-1 rounded-full">Logo</span>}
                    {k.zweisprachig && <span className="ml-1 text-[9px] bg-violet-100 text-violet-700 px-1 rounded-full">2-sprachig</span>}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-amber-600">{k.gruppe} · {k.alter} J.</span>
                    <span className="text-[9px] text-amber-500">Ø {PUNKTE_CFG[avgPunkte].emoji}</span>
                  </div>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${nCfg.bg} ${nCfg.farbe} border ${nCfg.border}`}>{nCfg.label}</span>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-200/50 px-3 pb-3 pt-2 space-y-2.5">
                  {/* Bereiche */}
                  <div className="grid grid-cols-5 gap-1">
                    {(Object.entries(k.bereiche) as [Sprachbereich, {punktzahl:1|2|3|4;notiz?:string}][]).map(([b, val]) => (
                      <div key={b} className="text-center">
                        <p className="text-base">{BEREICH_CFG[b].emoji}</p>
                        <p className={`text-sm font-bold ${PUNKTE_CFG[val.punktzahl].farbe}`}>{PUNKTE_CFG[val.punktzahl].emoji}</p>
                        <p className="text-[8px] text-amber-600 truncate">{BEREICH_CFG[b].label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Meilensteine */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">Meilensteine</p>
                    {k.meilensteine.map((m, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${m.erreicht ? 'text-green-500' : 'text-amber-200'}`} />
                        <p className={`text-[10px] flex-1 ${m.erreicht ? 'text-amber-700' : 'text-amber-900'}`}>{m.text}</p>
                        {m.alter && <span className="text-[9px] text-green-600">{m.alter}</span>}
                      </div>
                    ))}
                  </div>

                  {/* Maßnahmen */}
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wide mb-1">Fördermaßnahmen</p>
                    <div className="flex gap-1 flex-wrap">
                      {k.foerdermassnahmen.map((m,i) => (
                        <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* KI */}
                  {kiTexts[k.id] ? (
                    <div className="rounded-xl p-2.5 bg-orange-50 border border-orange-200">
                      <p className="text-[9px] font-bold text-orange-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Förderempfehlung</p>
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
