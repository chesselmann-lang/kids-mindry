'use client'

import { useState } from 'react'
import { Star, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Users } from 'lucide-react'

// ── Kreativprojekte — Mindry Kids ─────────────────────────────────────────────
// Projektdokumentation · Kunstprojekte · Theaterstücke · Jahreswerke

type ProjektStatus = 'planung' | 'aktiv' | 'abgeschlossen' | 'ausgestellt'
type ProjektTyp = 'kunst' | 'theater' | 'musik' | 'natur' | 'bau' | 'basteln'

interface ProjektSchritt { text: string; erledigt: boolean }
interface KreativProjekt {
  id: string
  titel: string
  typ: ProjektTyp
  status: ProjektStatus
  gruppen: string[]
  zeitraum: string
  leitung: string
  beschreibung: string
  schritte: ProjektSchritt[]
  materialien?: string
  notiz?: string
  kinderzahl?: number
}

const TYP_CFG: Record<ProjektTyp, { label: string; emoji: string; farbe: string; bg: string }> = {
  kunst:   { label: 'Kunst',    emoji: '🎨', farbe: 'text-pink-700',   bg: 'bg-pink-50 border-pink-200' },
  theater: { label: 'Theater',  emoji: '🎭', farbe: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  musik:   { label: 'Musik',    emoji: '🎵', farbe: 'text-violet-700', bg: 'bg-violet-50 border-violet-200' },
  natur:   { label: 'Natur',    emoji: '🌿', farbe: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  bau:     { label: 'Bauen',    emoji: '🏗️', farbe: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  basteln: { label: 'Basteln',  emoji: '✂️', farbe: 'text-amber-700',  bg: 'bg-amber-50 border-amber-200' },
}

const STATUS_CFG: Record<ProjektStatus, { label: string; farbe: string }> = {
  planung:      { label: 'In Planung',   farbe: 'text-blue-600' },
  aktiv:        { label: 'Aktiv',        farbe: 'text-green-600' },
  abgeschlossen:{ label: 'Abgeschlossen',farbe: 'text-gray-500' },
  ausgestellt:  { label: 'Ausgestellt',  farbe: 'text-amber-600' },
}

const INIT_PROJEKTE: KreativProjekt[] = [
  {
    id: 'k1', titel: 'Frühlings-Theater: "Das Märchen vom Fuchs"', typ: 'theater', status: 'aktiv',
    gruppen: ['Sonnenkäfer', 'Marienkäfer'], zeitraum: 'Apr–Jun 2025', leitung: 'Fr. Weber', kinderzahl: 28,
    beschreibung: 'Kinder erarbeiten ein kleines Theaterstück zur Aufführung beim Sommerfest.',
    schritte: [
      { text: 'Rollenverteilung', erledigt: true },
      { text: 'Text auswendig lernen', erledigt: true },
      { text: 'Kostüme nähen mit Eltern', erledigt: false },
      { text: 'Bühnenbilder gestalten', erledigt: false },
      { text: 'Generalprobe', erledigt: false },
    ],
    materialien: 'Kostümstoffe, Farbe, Pappe für Bühne',
    notiz: 'Aufführung: 24. Juni beim Sommerfest',
  },
  {
    id: 'k2', titel: 'Jahreszeiten-Kalender 2025/26', typ: 'kunst', status: 'planung',
    gruppen: ['Alle Gruppen'], zeitraum: 'Mai–Sep 2025', leitung: 'Team gesamt', kinderzahl: 52,
    beschreibung: 'Jedes Kind gestaltet ein Monatsblatt — Collage, Aquarell, Fingerabdruck.',
    schritte: [
      { text: 'Kalenderformat festlegen', erledigt: false },
      { text: 'Materialien bestellen', erledigt: false },
      { text: 'Mal-Sessions pro Gruppe', erledigt: false },
      { text: 'Druckerei anfragen', erledigt: false },
    ],
    materialien: 'Aquarellfarben, Papier A4, Pinsel, Stempel',
    notiz: 'Ergebnis als Weihnachtsgeschenk für Eltern',
  },
  {
    id: 'k3', titel: 'Schulgarten — Gemüsebeet anlegen', typ: 'natur', status: 'aktiv',
    gruppen: ['Sonnenkäfer'], zeitraum: 'Mär–Jul 2025', leitung: 'Hr. Schulze', kinderzahl: 14,
    beschreibung: 'Kinder pflanzen, gießen und ernten Radieschen, Kräuter und Salat.',
    schritte: [
      { text: 'Beet vorbereitet', erledigt: true },
      { text: 'Saat ausgebracht', erledigt: true },
      { text: 'Gießplan eingeteilt', erledigt: true },
      { text: 'Erste Ernte', erledigt: false },
    ],
    materialien: 'Samen, Erde, Gießkannen, Schaufeln',
  },
  {
    id: 'k4', titel: 'Musikprojekt "Tiere klingen"', typ: 'musik', status: 'abgeschlossen',
    gruppen: ['Marienkäfer'], zeitraum: 'Jan–Mär 2025', leitung: 'Fr. Weber', kinderzahl: 16,
    beschreibung: 'Kinder basteln Instrumente und spielen tierische Klänge nach.',
    schritte: [
      { text: 'Instrumente gebastelt', erledigt: true },
      { text: 'Lieder geübt', erledigt: true },
      { text: 'Aufführung beim Elternabend', erledigt: true },
    ],
    materialien: 'Dosenrasseln, Holzstäbe, Blechdosen, Trockenkörner',
  },
  {
    id: 'k5', titel: 'Große Frühlingsausstellung', typ: 'basteln', status: 'ausgestellt',
    gruppen: ['Alle Gruppen'], zeitraum: 'Feb–Apr 2025', leitung: 'Team gesamt', kinderzahl: 52,
    beschreibung: 'Frühlingsbilder und Basteleien aller Kinder — ausgestellt im Eingangsbereich.',
    schritte: [
      { text: 'Werke gesammelt', erledigt: true },
      { text: 'Ausstellung aufgebaut', erledigt: true },
      { text: 'Eltern eingeladen', erledigt: true },
    ],
  },
]

export default function KreativprojektePage() {
  const [expanded, setExpanded] = useState<string | null>('k1')
  const [filterTyp, setFilterTyp] = useState<'alle' | ProjektTyp>('alle')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const gefiltert = INIT_PROJEKTE.filter(p => filterTyp === 'alle' || p.typ === filterTyp)
  const aktive = INIT_PROJEKTE.filter(p => p.status === 'aktiv').length
  const offeneSchritte = INIT_PROJEKTE.filter(p => p.status === 'aktiv').flatMap(p => p.schritte).filter(s => !s.erledigt).length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${aktive} aktive Projekte, ${offeneSchritte} offene Schritte. Nächste Priorität: "${INIT_PROJEKTE.find(p=>p.status==='aktiv')?.titel}" — ${INIT_PROJEKTE.find(p=>p.status==='aktiv')?.schritte.filter(s=>!s.erledigt)[0]?.text ?? 'kein offener Schritt'}. Empfehlung: Kostüme für Theater-Aufführung bis Ende Mai fertigstellen.`)
      setKiLaedt(false)
    }, 900)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <span className="text-2xl">🎨</span> Kreativprojekte
        </h1>
        <p className="text-sm text-amber-700/70 mt-0.5">Kunst · Theater · Musik · Natur · Dokumentation</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Projekte', val: INIT_PROJEKTE.length,       color: 'text-amber-700' },
          { label: 'Aktiv',    val: aktive,                     color: aktive > 0 ? 'text-green-600' : 'text-gray-400' },
          { label: 'Offen',    val: offeneSchritte,             color: offeneSchritte > 0 ? 'text-orange-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-amber-200 bg-amber-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-amber-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[9px] font-bold text-amber-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Überblick</p>
          <p className="text-xs text-amber-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-amber-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Projektüberblick'}
        </button>
      )}

      <div className="flex gap-1.5 flex-wrap">
        <button onClick={() => setFilterTyp('alle')}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === 'alle' ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          Alle
        </button>
        {(Object.keys(TYP_CFG) as ProjektTyp[]).map(t => (
          <button key={t} onClick={() => setFilterTyp(t)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors ${filterTyp === t ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {TYP_CFG[t].emoji} {TYP_CFG[t].label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {gefiltert.map(p => {
          const tCfg = TYP_CFG[p.typ]
          const isOpen = expanded === p.id
          const erledigte = p.schritte.filter(s => s.erledigt).length
          const pct = p.schritte.length > 0 ? Math.round((erledigte / p.schritte.length) * 100) : 100
          return (
            <div key={p.id} className={`rounded-2xl border overflow-hidden ${tCfg.bg}`}>
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:opacity-90 transition-opacity">
                <span className="text-xl shrink-0">{tCfg.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-900">{p.titel}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-amber-600">{p.zeitraum}</span>
                    {p.kinderzahl && <span className="text-[9px] text-amber-500"><Users className="w-2.5 h-2.5 inline" /> {p.kinderzahl}</span>}
                    <span className={`text-[9px] font-semibold ${STATUS_CFG[p.status].farbe}`}>{STATUS_CFG[p.status].label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-amber-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[9px] text-amber-500 shrink-0">{pct}%</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-amber-400" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-amber-200/50 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[10px] text-amber-800">{p.beschreibung}</p>
                  <div className="flex items-center gap-2 text-[9px] text-amber-600">
                    <Clock className="w-2.5 h-2.5" /> {p.leitung}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">Projektschritte</p>
                    {p.schritte.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${s.erledigt ? 'text-green-500' : 'text-amber-200'}`} />
                        <p className={`text-[10px] ${s.erledigt ? 'line-through text-amber-500' : 'text-amber-900'}`}>{s.text}</p>
                      </div>
                    ))}
                  </div>
                  {p.materialien && (
                    <div className="flex items-start gap-1">
                      <Star className="w-2.5 h-2.5 text-amber-400 mt-0.5 shrink-0" />
                      <p className="text-[9px] text-amber-700">{p.materialien}</p>
                    </div>
                  )}
                  {p.notiz && <p className="text-[9px] text-amber-600 italic">{p.notiz}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
