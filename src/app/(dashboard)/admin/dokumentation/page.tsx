'use client'

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Dokumentation — kids-mindry ───────────────────────────────────────────────
// Entwicklungsberichte · Beobachtungsbögen · DSGVO · Archiv · Übergabe

type DokuTyp = 'entwicklungsbericht' | 'beobachtung' | 'portfolio' | 'uebergabe' | 'foerderplan' | 'dsgvo' | 'archiv'
type DokuStatus = 'aktuell' | 'faellig' | 'in_bearbeitung' | 'archiviert' | 'kritisch'

interface DokuEintrag {
  id: string
  typ: DokuTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: DokuStatus
  punkte: string[]
}

const TYP_CFG: Record<DokuTyp, { label: string; emoji: string; farbe: string }> = {
  entwicklungsbericht: { label: 'Entwicklungsbericht', emoji: '📊', farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  beobachtung:         { label: 'Beobachtung',         emoji: '👁️', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  portfolio:           { label: 'Portfolio',           emoji: '📂', farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  uebergabe:           { label: 'Übergabe GS',         emoji: '🎒', farbe: 'bg-green-50 text-green-700 border-green-200' },
  foerderplan:         { label: 'Förderplan',          emoji: '⭐', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  dsgvo:               { label: 'DSGVO/Datenschutz',  emoji: '🔒', farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  archiv:              { label: 'Archiv',              emoji: '🗄️', farbe: 'bg-gray-50 text-gray-600 border-gray-200' },
}

const STATUS_CFG: Record<DokuStatus, { label: string; farbe: string }> = {
  aktuell:       { label: 'Aktuell',         farbe: 'text-green-600' },
  faellig:       { label: 'Fällig',          farbe: 'text-orange-500' },
  in_bearbeitung:{ label: 'In Bearbeitung',  farbe: 'text-teal-600' },
  archiviert:    { label: 'Archiviert',      farbe: 'text-gray-400' },
  kritisch:      { label: 'Kritisch!',       farbe: 'text-red-600' },
}

const EINTRAEGE: DokuEintrag[] = [
  {
    id: 'dk1', typ: 'entwicklungsbericht', titel: 'Entwicklungsberichte Halbjahr 2025/26',
    datum: 'Abgabe: 30.05.2026', verantwortlich: 'Alle Gruppenerzieher:innen', status: 'in_bearbeitung',
    punkte: ['24 Berichte (alle Kinder ab 2 Jahren)', 'Formular: KiBiz-konformes Formblatt (Träger genehmigt)', 'Elterngespräche: Mai–Jun (Termine ab 12.05. buchbar)', 'Bildungsbereiche: Sprache, Motorik, Sozialverhalten, Kreativität', 'Abgabe an SL: bis 30.05.2026'],
  },
  {
    id: 'dk2', typ: 'beobachtung', titel: 'Beobachtungsbögen — BaSiK / Sismik',
    datum: 'Aktualisierung: Apr 2026', verantwortlich: 'Gruppenerzieher:innen', status: 'aktuell',
    punkte: ['BaSiK (Basiskompetenzen): alle U3-Kinder (8 Bögen)', 'Sismik: Sprachstandserhebung Migrationshintergrund (4 Kinder)', 'Aktualisierungsrhythmus: halbjährlich (Jan + Jun)', 'Bögen: Papier + digital (Träger-Software)', 'Datenschutz: Bögen nicht im Portfolio — getrennte Ablage'],
  },
  {
    id: 'dk3', typ: 'uebergabe', titel: 'Übergangsportfolio → Grundschule Jun 2026',
    datum: 'Übergabe: 15.06.2026', verantwortlich: 'Fr. Wagner + SL', status: 'in_bearbeitung',
    punkte: ['8 Kinder wechseln Jun 2026 zur GS', 'Übergangsportfolio: Fotos + Lerngeschichten (§ 14 KiBiz NRW)', 'Einverständnis Eltern: Formular verschickt (6/8 zurück)', 'Übergabegespräch mit GS Am Park: 15.06.2026 (Fr. Wagner + GS-KL)', 'Resterende Einverständnisse: bis 07.06. einfordern!'],
  },
  {
    id: 'dk4', typ: 'dsgvo', titel: 'Datenschutz & Dokumentenarchivierung',
    datum: 'Lfd. Pflege', verantwortlich: 'SL (Datenschutzbeauftragte)', status: 'aktuell',
    punkte: ['Aufbewahrungsfristen: Entwicklungsberichte 5 Jahre, Unfallmeldungen 30 Jahre', 'Digitale Ablage: passwortgeschützt (Träger-Cloud, ISO 27001)', 'Einwilligungen Fotos/Videos: Sammeleinwilligung je Kitajahr', 'Datenweitergabe an Dritte: nur schriftlich + dokumentiert', 'DSGVO-Schulung Fachkräfte: letzte Schulung Feb 2026'],
  },
  {
    id: 'dk5', typ: 'foerderplan', titel: 'Förderpläne — Kinder mit erhöhtem Förderbedarf',
    datum: 'Review: Jun 2026', verantwortlich: 'Inklusionsfachkraft + Gruppenteam', status: 'faellig',
    punkte: ['3 Kinder mit Integrationsstatus (KiBiz §16a)', 'Förderpläne: letzte Fortschreibung Dez 2025 (fällig Jun!)', 'Zusammenarbeit SPZ: Förderberichte Apr empfangen', 'Elterneinbeziehung: Zielvereinbarungsgespräch bis 30.05.', 'Interdisziplinäre Fachkonferenz: 04.06.2026 (SPZ + Kita)'],
  },
]

export default function DokumentationPage() {
  const [expanded, setExpanded] = useState<string | null>('dk1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  const faellig = EINTRAEGE.filter(e => e.status === 'faellig' || e.status === 'kritisch').length
  const aktuell = EINTRAEGE.filter(e => e.status === 'aktuell').length

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Dokumentationsbereiche. Entwicklungsberichte bis 30.05. (24 Kinder). Übergangsportfolio: 2 Einverständnisse fehlen noch. Förderpläne Jun fällig.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <FileText className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Dokumentation
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Entwicklungsberichte · Beobachtung · DSGVO · Übergabe GS</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche', val: EINTRAEGE.length, color: 'text-blue-600' },
          { label: 'Aktuell',  val: aktuell,          color: 'text-green-600' },
          { label: 'Fällig',   val: faellig,          color: 'text-orange-500' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className={`text-lg font-bold ${k.color}`}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {faellig > 0 && (
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: 'rgb(255 247 237)', border: '1px solid rgb(253 186 116)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <p className="text-[10px] text-orange-700 font-semibold">Förderpläne Jun fällig — Zielvereinbarungsgespräche bis 30.05. führen!</p>
        </div>
      )}

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Dokumentationsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Dokumentationsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: `1px solid ${e.status === 'faellig' ? 'rgb(253 186 116)' : 'var(--color-border)'}` }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  {tCfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p>
                </div>
                {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>
                  {e.punkte.map((p, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{p}</p>
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
