'use client'

import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, Clock, AlertTriangle, Star, Users } from 'lucide-react'

// ── Lernwerkstatt — Mindry Kids Admin ─────────────────────────────────────────
// Materialien · Bereiche · Angebote · Belegungsübersicht · KI-Empfehlungen

type WerkstattBereich = 'mathematik' | 'sprache' | 'natur' | 'kunst' | 'musik' | 'bewegung' | 'bauen' | 'rollenspiel'
type MaterialStatus = 'vorhanden' | 'verliehen' | 'beschaedigt' | 'bestellt' | 'fehlt'

interface Material {
  name: string
  anzahl: number
  status: MaterialStatus
  altersgruppe: string
}

interface WerkstattAngebot {
  id: string
  titel: string
  bereich: WerkstattBereich
  beschreibung: string
  altersgruppe: string
  materialien: Material[]
  letzteNutzung: string
  beliebtheit: 1 | 2 | 3 | 4 | 5
  aktiv: boolean
}

const BEREICH_CFG: Record<WerkstattBereich, { label: string; farbe: string; emoji: string }> = {
  mathematik: { label: 'Mathematik', farbe: 'bg-blue-50 text-blue-700 border-blue-200',    emoji: '🔢' },
  sprache:    { label: 'Sprache',    farbe: 'bg-purple-50 text-purple-700 border-purple-200', emoji: '📖' },
  natur:      { label: 'Natur & WU', farbe: 'bg-green-50 text-green-700 border-green-200',  emoji: '🌱' },
  kunst:      { label: 'Kunst',      farbe: 'bg-pink-50 text-pink-700 border-pink-200',     emoji: '🎨' },
  musik:      { label: 'Musik',      farbe: 'bg-orange-50 text-orange-700 border-orange-200',emoji: '🎵' },
  bewegung:   { label: 'Bewegung',   farbe: 'bg-red-50 text-red-700 border-red-200',        emoji: '🏃' },
  bauen:      { label: 'Bauen & Konstruieren', farbe: 'bg-amber-50 text-amber-700 border-amber-200', emoji: '🧱' },
  rollenspiel:{ label: 'Rollenspiel',farbe: 'bg-teal-50 text-teal-700 border-teal-200',    emoji: '🎭' },
}

const ANGEBOTE: WerkstattAngebot[] = [
  {
    id: 'lw1', titel: 'Mengenlehre mit Montessori-Material', bereich: 'mathematik',
    beschreibung: 'Zählen, Sortieren und erste Rechenoperationen mit Perlen, Steckwürfeln und Zahlenkarten. Freies Erkunden der Mengen 1–100.',
    altersgruppe: '3–6 Jahre', letzteNutzung: '23.04.2026', beliebtheit: 5, aktiv: true,
    materialien: [
      { name: 'Montessori-Perlen (100er-Kette)', anzahl: 2, status: 'vorhanden', altersgruppe: '4–6' },
      { name: 'Zahlenkarten 1–100', anzahl: 1, status: 'vorhanden', altersgruppe: '3–6' },
      { name: 'Steckwürfel (Holz)', anzahl: 60, status: 'vorhanden', altersgruppe: '2–5' },
      { name: 'Mengenkarten laminiert', anzahl: 30, status: 'beschaedigt', altersgruppe: '3–6' },
    ],
  },
  {
    id: 'lw2', titel: 'Buchstaben-Werkstatt', bereich: 'sprache',
    beschreibung: 'Laut-Buchstaben-Zuordnung, Anlauttabelle, Sandplatte zum Schreiben, Buchstabenformen fühlen.',
    altersgruppe: '4–6 Jahre', letzteNutzung: '22.04.2026', beliebtheit: 4, aktiv: true,
    materialien: [
      { name: 'Anlauttabelle laminiert (A2)', anzahl: 4, status: 'vorhanden', altersgruppe: '4–6' },
      { name: 'Sandplatte mit Rahmen', anzahl: 2, status: 'vorhanden', altersgruppe: '3–6' },
      { name: 'Fühlbuchstaben Holz', anzahl: 26, status: 'verliehen', altersgruppe: '4–6' },
      { name: 'Bildkarten Anlaute', anzahl: 50, status: 'vorhanden', altersgruppe: '3–5' },
    ],
  },
  {
    id: 'lw3', titel: 'Bauwerkstatt Holz & Magnete', bereich: 'bauen',
    beschreibung: 'Freies Konstruieren mit Holzklötzen, Magnetbausteinen und Balancierblöcken. Fördert räumliches Denken und Feinmotorik.',
    altersgruppe: '2–6 Jahre', letzteNutzung: '21.04.2026', beliebtheit: 5, aktiv: true,
    materialien: [
      { name: 'Magnetbausteine Groß (Connetix)', anzahl: 1, status: 'bestellt', altersgruppe: '3–6' },
      { name: 'Holzklötze Baustein-Set', anzahl: 3, status: 'vorhanden', altersgruppe: '2–6' },
      { name: 'Balancierblöcke', anzahl: 20, status: 'vorhanden', altersgruppe: '2–5' },
    ],
  },
  {
    id: 'lw4', titel: 'Natur-Forscherwerkstatt', bereich: 'natur',
    beschreibung: 'Lupe, Mikroskop, Naturmaterialien, Steine und Pflanzen untersuchen. Sachbücher und Bestimmungskarten für kleine Forscher.',
    altersgruppe: '3–6 Jahre', letzteNutzung: '18.04.2026', beliebtheit: 3, aktiv: true,
    materialien: [
      { name: 'Kindermikroskop', anzahl: 1, status: 'vorhanden', altersgruppe: '4–6' },
      { name: 'Lupen (groß)', anzahl: 6, status: 'vorhanden', altersgruppe: '3–6' },
      { name: 'Naturmaterial-Kiste', anzahl: 1, status: 'vorhanden', altersgruppe: '2–6' },
      { name: 'Bestimmungskarten Tiere', anzahl: 30, status: 'fehlt', altersgruppe: '4–6' },
    ],
  },
]

export default function LernwerkstattPage() {
  const [expanded, setExpanded] = useState<string | null>('lw1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const beschaedigt = ANGEBOTE.flatMap(a => a.materialien).filter(m => m.status === 'beschaedigt' || m.status === 'fehlt').length
  const bestellt = ANGEBOTE.flatMap(a => a.materialien).filter(m => m.status === 'bestellt').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${ANGEBOTE.length} Lernwerkstatt-Angebote aktiv: ${ANGEBOTE.filter(a => a.beliebtheit >= 4).length} sehr beliebt. ${beschaedigt} Material(ien) beschädigt/fehlend — Nachbestellung prüfen. Bestimmungskarten Natur fehlen ganz. Magnetbausteine sind bereits bestellt.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-teal-500" /> Lernwerkstatt
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Materialien · Bereiche · Angebote</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Angebote',   val: ANGEBOTE.length, color: 'text-teal-700' },
          { label: 'Bestellt',   val: bestellt, color: bestellt > 0 ? 'text-blue-600' : 'text-gray-400' },
          { label: 'Probleme',   val: beschaedigt, color: beschaedigt > 0 ? 'text-orange-600' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Lernwerkstatt-Tipp</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Lernwerkstatt-Tipp'}
        </button>
      )}

      <div className="space-y-2">
        {ANGEBOTE.map(a => {
          const isOpen = expanded === a.id
          const bereichCfg = BEREICH_CFG[a.bereich]
          const problemMaterial = a.materialien.filter(m => m.status === 'beschaedigt' || m.status === 'fehlt').length
          return (
            <div key={a.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : a.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 text-lg">
                  {bereichCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${bereichCfg.farbe}`}>{bereichCfg.label}</span>
                    <span className="text-[8px] text-teal-400">{a.altersgruppe}</span>
                    {problemMaterial > 0 && <AlertTriangle className="w-2.5 h-2.5 text-orange-400" />}
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{a.titel}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-amber-400 text-[10px]">{'★'.repeat(a.beliebtheit)}</span>
                    <span className="text-[9px] text-teal-400">Zuletzt: {a.letzteNutzung}</span>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  <p className="text-[10px] text-teal-700 leading-relaxed">{a.beschreibung}</p>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wide">Materialien</p>
                    {a.materialien.map((m, i) => {
                      const statusFarbe = m.status === 'vorhanden' ? 'text-green-500' : m.status === 'verliehen' ? 'text-blue-500' : m.status === 'bestellt' ? 'text-orange-400' : 'text-red-500'
                      const statusLabel = m.status === 'vorhanden' ? 'OK' : m.status === 'verliehen' ? 'verliehen' : m.status === 'bestellt' ? 'bestellt' : m.status === 'beschaedigt' ? 'beschädigt' : 'fehlt'
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <p className="text-[10px] text-teal-900">{m.name} ({m.anzahl}×)</p>
                          <span className={`text-[8px] font-semibold ${statusFarbe}`}>{statusLabel}</span>
                        </div>
                      )
                    })}
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
