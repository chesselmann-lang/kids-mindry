'use client'

import { useState } from 'react'
import { FolderOpen, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Clock, Star } from 'lucide-react'

// ── Projektdokumentation — Mindry Kids Admin ──────────────────────────────────
// Kita-Projekte dokumentieren · Lernspuren · Fotos · Ergebnisse

type ProjektKategorie = 'natur' | 'kreativ' | 'sprache' | 'bewegung' | 'soziales' | 'community'
type ProjektStatus = 'planung' | 'laufend' | 'abgeschlossen' | 'archiviert'

interface ProjektEintrag {
  datum: string
  beschreibung: string
  beteiligte: string
  medien: number
}

interface KitaProjekt {
  id: string
  titel: string
  kategorie: ProjektKategorie
  status: ProjektStatus
  beginn: string
  ende?: string
  gruppen: string[]
  leiterin: string
  ziele: string[]
  eintraege: ProjektEintrag[]
  ergebnis?: string
}

const KAT_CFG: Record<ProjektKategorie, { label: string; emoji: string; farbe: string }> = {
  natur:     { label: 'Natur & Umwelt', emoji: '🌱', farbe: 'bg-lime-50 text-lime-700' },
  kreativ:   { label: 'Kreativität',    emoji: '🎨', farbe: 'bg-pink-50 text-pink-700' },
  sprache:   { label: 'Sprache',        emoji: '💬', farbe: 'bg-blue-50 text-blue-700' },
  bewegung:  { label: 'Bewegung',       emoji: '🏃', farbe: 'bg-green-50 text-green-700' },
  soziales:  { label: 'Soziales',       emoji: '🤝', farbe: 'bg-orange-50 text-orange-700' },
  community: { label: 'Gemeinschaft',   emoji: '🏘️', farbe: 'bg-teal-50 text-teal-700' },
}

const STATUS_CFG: Record<ProjektStatus, { label: string; farbe: string; dot: string }> = {
  planung:      { label: 'Planung',      farbe: 'text-gray-500',   dot: 'bg-gray-400' },
  laufend:      { label: 'Laufend',      farbe: 'text-blue-600',   dot: 'bg-blue-400' },
  abgeschlossen:{ label: 'Fertig',       farbe: 'text-green-600',  dot: 'bg-green-400' },
  archiviert:   { label: 'Archiv',       farbe: 'text-gray-400',   dot: 'bg-gray-300' },
}

const PROJEKTE: KitaProjekt[] = [
  {
    id: 'pj1', titel: 'Unser Gemüsegarten — Vom Samen zur Ernte',
    kategorie: 'natur', status: 'laufend',
    beginn: 'März 2026', gruppen: ['Alle'], leiterin: 'Fr. Hartmann',
    ziele: ['Naturwissen', 'Verantwortung', 'Geduld', 'Gesundes Essen kennenlernen'],
    eintraege: [
      { datum: '15.03.2026', beschreibung: 'Beete angelegt, erste Samen gesät (Radieschen, Kresse).', beteiligte: 'Alle Kinder', medien: 5 },
      { datum: '01.04.2026', beschreibung: 'Erste Keimsprossen entdeckt — großes Staunen!', beteiligte: 'Alle Kinder', medien: 3 },
      { datum: '22.04.2026', beschreibung: 'Kresse geerntet und auf Brot gegessen.', beteiligte: 'Alle Kinder', medien: 4 },
    ],
  },
  {
    id: 'pj2', titel: 'Unser Kinderbuch — "Die Abenteuer der Schmetterlinge"',
    kategorie: 'sprache', status: 'abgeschlossen',
    beginn: 'Jan. 2026', ende: 'März 2026', gruppen: ['Schmetterlinge'], leiterin: 'Fr. Klein',
    ziele: ['Erzählen und Fantasie', 'Schriftsprache kennenlernen', 'Stolz auf eigenes Werk'],
    eintraege: [
      { datum: '15.01.2026', beschreibung: 'Geschichte gemeinsam entwickelt: Charaktere + Plot.', beteiligte: 'Gruppe Schmetterlinge', medien: 2 },
      { datum: '10.02.2026', beschreibung: 'Jedes Kind hat eine Seite gezeichnet + diktiert.', beteiligte: 'Gruppe Schmetterlinge', medien: 8 },
      { datum: '05.03.2026', beschreibung: 'Buch gedruckt und gebunden — Buchpräsentation für Eltern!', beteiligte: 'Alle Familien', medien: 6 },
    ],
    ergebnis: 'Buch liegt in der Kita-Bibliothek aus. 2 Exemplare für die Gruppenbibliothek.',
  },
  {
    id: 'pj3', titel: 'Kita-Olympiade — Sport und Teamgeist',
    kategorie: 'bewegung', status: 'planung',
    beginn: 'Mai 2026', gruppen: ['Alle'], leiterin: 'Fr. Hartmann + Fr. Becker',
    ziele: ['Bewegungsfreude', 'Teamarbeit', 'Fairplay', 'Gemeinschaftsgefühl stärken'],
    eintraege: [
      { datum: '22.04.2026', beschreibung: 'Planungstreffen: Stationen festgelegt (Sackhüpfen, Weitwurf, Balancieren).', beteiligte: 'Team', medien: 0 },
    ],
  },
]

export default function ProjektdokumentationPage() {
  const [expanded, setExpanded] = useState<string | null>('pj1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const laufend = PROJEKTE.filter(p => p.status === 'laufend').length
  const abgeschlossen = PROJEKTE.filter(p => p.status === 'abgeschlossen').length
  const gesamtFotos = PROJEKTE.flatMap(p => p.eintraege).reduce((s, e) => s + e.medien, 0)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${PROJEKTE.length} Projekte: ${laufend} laufend, ${abgeschlossen} abgeschlossen. Gemüsegarten läuft prima. Kinderbuch fertig — toll für Portfolios! Olympiade in Planung für Mai.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-teal-500" /> Projektdokumentation
        </h1>
        <p className="text-sm text-teal-700/70 mt-0.5">Kita-Projekte · Lernspuren · Einträge · Ergebnisse</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Projekte',   val: PROJEKTE.length, color: 'text-teal-700' },
          { label: 'Laufend',    val: laufend,         color: 'text-blue-600' },
          { label: '📷 Fotos',   val: gesamtFotos,     color: 'text-purple-600' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border border-teal-100 bg-teal-50 p-2.5 text-center">
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-teal-700/60">{k.label}</p>
          </div>
        ))}
      </div>

      {kiText ? (
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-3">
          <p className="text-[9px] font-bold text-teal-700 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> KI-Projektüberblick</p>
          <p className="text-xs text-teal-900 leading-relaxed">{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold text-teal-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Projektüberblick'}
        </button>
      )}

      <div className="space-y-2">
        {PROJEKTE.map(p => {
          const isOpen = expanded === p.id
          const kCfg = KAT_CFG[p.kategorie]
          const stCfg = STATUS_CFG[p.status]
          return (
            <div key={p.id} className="rounded-2xl border border-teal-100 bg-white overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-teal-50/50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-lg">
                  {kCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${kCfg.farbe}`}>{kCfg.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`} />
                    <span className={`text-[8px] font-semibold ${stCfg.farbe}`}>{stCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-teal-900 mt-0.5 truncate">{p.titel}</p>
                  <p className="text-[9px] text-teal-400"><Clock className="w-2.5 h-2.5 inline mr-0.5" />{p.beginn}{p.ende ? ` – ${p.ende}` : ''} · {p.leiterin}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3 text-teal-300" /> : <ChevronDown className="w-3 h-3 text-teal-300" />}
              </button>

              {isOpen && (
                <div className="border-t border-teal-100 px-3 pb-3 pt-2 space-y-2">
                  {/* Ziele */}
                  <div className="flex flex-wrap gap-1">
                    {p.ziele.map((z, i) => (
                      <span key={i} className="text-[8px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full">{z}</span>
                    ))}
                  </div>

                  {/* Einträge */}
                  <div>
                    <p className="text-[9px] font-bold text-teal-500 uppercase tracking-wide mb-1">Dokumentationseinträge</p>
                    {p.eintraege.map((e, i) => (
                      <div key={i} className="flex items-start gap-1.5 mb-1.5">
                        <Star className="w-3 h-3 text-teal-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] text-teal-900">{e.beschreibung}</p>
                          <p className="text-[8px] text-teal-400">{e.datum} · {e.beteiligte}{e.medien > 0 ? ` · 📷 ${e.medien}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {p.ergebnis && (
                    <div className="bg-green-50 border border-green-100 rounded-lg px-2 py-1.5">
                      <p className="text-[9px] text-green-700"><CheckCircle2 className="w-2.5 h-2.5 inline mr-1" />{p.ergebnis}</p>
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
