'use client'

import { useState } from 'react'
import { LayoutGrid, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Raumkonzept — kids-mindry ──────────────────────────────────────────────────
// Raumplanung · Lernumgebungen · Raumnutzung · Ausstattung · Konzept

type RaumTyp = 'gruppenraum' | 'schlafraum' | 'kueche' | 'aussenbereich' | 'sanitaer' | 'bewegungsraum' | 'buero'
type RaumStatus = 'in_ordnung' | 'massnahme_geplant' | 'umbau' | 'gesperrt'

interface RaumEintrag {
  id: string
  typ: RaumTyp
  bezeichnung: string
  qm?: number
  kapazitaet?: number
  status: RaumStatus
  verantwortlich: string
  letzteInspektion?: string
  naechstePruefung?: string
  details: string[]
}

const TYP_CFG: Record<RaumTyp, { label: string; emoji: string; farbe: string }> = {
  gruppenraum:    { label: 'Gruppenraum',     emoji: '🏠', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  schlafraum:     { label: 'Schlaf-/Ruheraum',emoji: '🛏️', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  kueche:         { label: 'Küche/Essraum',   emoji: '🍽️', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  aussenbereich:  { label: 'Außenbereich',    emoji: '🌳', farbe: 'bg-green-50 text-green-700 border-green-200' },
  sanitaer:       { label: 'Sanitärbereich',  emoji: '🚿', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  bewegungsraum:  { label: 'Bewegungsraum',   emoji: '⚽', farbe: 'bg-orange-50 text-orange-700 border-orange-200' },
  buero:          { label: 'Büro/Verwaltung', emoji: '💼', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<RaumStatus, { label: string; farbe: string }> = {
  in_ordnung:       { label: 'In Ordnung',      farbe: 'text-green-600' },
  massnahme_geplant:{ label: 'Maßnahme geplant',farbe: 'text-orange-500' },
  umbau:            { label: 'Umbau/Renovierung',farbe: 'text-blue-500' },
  gesperrt:         { label: 'Gesperrt',         farbe: 'text-red-600' },
}

const RAEUME: RaumEintrag[] = [
  {
    id: 'rk1', typ: 'gruppenraum', bezeichnung: 'Gruppenraum Sonnenschein (EG)',
    qm: 65, kapazitaet: 18, status: 'in_ordnung', verantwortlich: 'Gruppenteam',
    letzteInspektion: 'Apr 2026',
    details: ['Ausstattung: Bauecke, Rollenspielbereich, Atelier, Leseecke', 'Letzte Möblierungsänderung: Feb 2026 (Atelier erweitert)', 'Sicherheitsbegehung: bestanden Apr 2026', 'Wandfarbe: neues Konzept Herbst 2026 geplant', 'Raumthema: Natur/Wald (saisonal wechselnd)'],
  },
  {
    id: 'rk2', typ: 'aussenbereich', bezeichnung: 'Außengelände gesamt (620 m²)',
    qm: 620, status: 'massnahme_geplant', verantwortlich: 'Leitung',
    letzteInspektion: 'Mär 2026', naechstePruefung: 'Mai 2026',
    details: ['Frühlingscheck ausstehend: Spielgeräte + Belag (Mai 2026)', 'EN 1176 Prüfung: fällig Jun 2026 (TÜV-Termin: 12.06.)', 'Klettergerüst: 1 Schraube locker (Meldung eingegangen)', 'Maßnahme: Instandsetzung bis 30.04. (Hausmeister)', 'Sonnenschutzsegel Sandkasten: montiert Apr 2026'],
  },
  {
    id: 'rk3', typ: 'schlafraum', bezeichnung: 'Schlafraum Krippengruppe Regenbogen',
    qm: 24, kapazitaet: 10, status: 'in_ordnung', verantwortlich: 'Krippenteam',
    letzteInspektion: 'Jan 2026',
    details: ['10 Feldbetten + Schlafkisten pro Kind', 'Raumlüftung: täglich geprüft (Protokoll)', 'Beleuchtung: abgedunkelt (Rollläden neu Apr 2025)', 'Schlaflisten: täglich geführt + digital gesichert', 'Hygiene: Bettzeug wöchentlich gewaschen'],
  },
  {
    id: 'rk4', typ: 'bewegungsraum', bezeichnung: 'Bewegungsraum (1. OG)',
    qm: 45, status: 'umbau', verantwortlich: 'Träger + Leitung',
    naechstePruefung: 'Jun 2026 (Abnahme)',
    details: ['Umbau: Apr–Mai 2026 (Bodenbelag + Wandpolster)', 'Nutzungspause: 01.04.–31.05.2026', 'Interim: Turnstunden im Flur (begrenzt)', 'Abnahme geplant: 01.06.2026', 'Budget: 3.800 € (Träger genehmigt)'],
  },
  {
    id: 'rk5', typ: 'kueche', bezeichnung: 'Küche + Essbereich (EG)',
    qm: 28, status: 'in_ordnung', verantwortlich: 'Küchenbeauftrage Fr. Schmidt',
    letzteInspektion: 'Feb 2026',
    details: ['HACCP-Konzept: aktuell (Stand Jan 2026)', 'Lebensmittelhygiene: Schulung Team Feb 2026', 'Kühlung: Temperaturdokumentation täglich', 'Geschirrspüler: Wartung Apr 2026 durchgeführt', 'DGE-Qualitätsstandard: erfüllt (32% Bio)'],
  },
]

export default function RaumkonzeptPage() {
  const [expanded, setExpanded] = useState<string | null>('rk2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const massnahmen = RAEUME.filter(r => r.status === 'massnahme_geplant' || r.status === 'umbau').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${RAEUME.length} Räume/Bereiche. Außengelände: Frühlingscheck + EN-1176-Prüfung Jun 2026. Bewegungsraum: Umbau bis Mai (Abnahme Jun). Klettergerüst-Schraube: bis 30.04. reparieren!`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <LayoutGrid className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Raumkonzept
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Räume · Ausstattung · EN 1176 · HACCP · Raumplanung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Räume',       val: RAEUME.length, color: 'text-teal-600' },
          { label: 'OK',          val: RAEUME.filter(r => r.status === 'in_ordnung').length, color: 'text-green-600' },
          { label: 'Maßnahme',    val: massnahmen,    color: massnahmen > 0 ? 'text-orange-500' : 'text-gray-400' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2 bg-orange-50 border border-orange-200">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <p className="text-[10px] text-orange-700 font-semibold">Außengelände: Klettergerüst-Schraube locker — Instandsetzung bis 30.04.!</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Raumübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Raumübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {RAEUME.map(r => {
          const isOpen = expanded === r.id
          const tCfg = TYP_CFG[r.typ]
          const sCfg = STATUS_CFG[r.status]
          return (
            <div key={r.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${r.status === 'gesperrt' ? 'rgb(252 165 165)' : r.status === 'massnahme_geplant' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{r.bezeichnung}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{r.qm ? `${r.qm} m²` : ''}{r.kapazitaet ? ` · ${r.kapazitaet} Kinder` : ''} · {r.verantwortlich}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {r.naechstePruefung && (
                    <p className="text-[9px] font-semibold" style={{ color: 'var(--color-primary)' }}>Nächste Prüfung: {r.naechstePruefung}</p>
                  )}
                  {r.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{d}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
