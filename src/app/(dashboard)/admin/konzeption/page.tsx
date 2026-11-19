'use client'

import { useState } from 'react'
import { BookHeart, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Konzeption — kids-mindry ──────────────────────────────────────────────────
// Pädagogisches Konzept · Bildungsbereiche · Leitbild · Qualitätsentwicklung

type KonzTyp = 'leitbild' | 'bildungsbereich' | 'methodik' | 'inklusion' | 'qualitaet' | 'fortschreibung' | 'extern'
type KonzStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface KonzEintrag {
  id: string
  typ: KonzTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: KonzStatus
  punkte: string[]
}

const TYP_CFG: Record<KonzTyp, { label: string; farbe: string }> = {
  leitbild:      { label: 'Leitbild',           farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  bildungsbereich:{ label: 'Bildungsbereiche',  farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  methodik:      { label: 'Methodik',            farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  inklusion:     { label: 'Inklusion/Vielfalt',  farbe: 'bg-green-50 text-green-700 border-green-200' },
  qualitaet:     { label: 'Qualitätsentwickl.',  farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  fortschreibung:{ label: 'Fortschreibung',      farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  extern:        { label: 'Extern/Träger',       farbe: 'bg-rose-50 text-rose-700 border-rose-200' },
}

const STATUS_CFG: Record<KonzStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: KonzEintrag[] = [
  {
    id: 'konz1', typ: 'leitbild', titel: 'Leitbild & Grundhaltung',
    datum: 'Leitbild 2023', verantwortlich: 'Kita-Ltg. + Team', status: 'aktiv',
    punkte: [
      'Leitbild: "Das Kind als Akteur seiner Bildung" (verabschiedet 2023, Kita + Träger)',
      'Grundhaltung: bedürfnisorientiert, partizipativ, inklusiv',
      'Aushang: Leitbild sichtbar im Eingangsbereich + Website',
      'Team-Verankerung: Leitbild-Tag jährlich (letzter Sep 2025, nächster Sep 2026)',
      'Elterninformation: Leitbild Teil der Erstelterngespräche (alle Neuaufnahmen)',
    ],
  },
  {
    id: 'konz2', typ: 'bildungsbereich', titel: 'Bildungsbereiche KiBiz NRW',
    datum: 'Alle 10 Bereiche abgedeckt', verantwortlich: 'Pädagog. Team', status: 'aktiv',
    punkte: [
      'Bewegung: tägl. Bewegungszeit (Garten + Turnraum, min. 60 Min.)',
      'Sprache: Sprachförderung tägl. integriert (DaZ + SISMIK, s. Sprachförd.-Seite)',
      'Mathematik/Natur: Forscher-Ecke + Gartenprojekt (Kl.3, aktiv)',
      'Musik/Kunst: wöchentl. Musik-Kreis + Atelier-Raum (Kl.2, Dienstag)',
      'Soziale Kompetenz: Morgenkreis tägl. (alle Gruppen), Kinderkonferenz 1×/Monat',
    ],
  },
  {
    id: 'konz3', typ: 'methodik', titel: 'Methodische Ansätze & Raumkonzept',
    datum: 'Konzept 2023', verantwortlich: 'Pädagog. Team', status: 'aktiv',
    punkte: [
      'Hauptansatz: Offene Arbeit (teiloffen, Stammgruppen bleiben erhalten)',
      'Funktionsräume: Bauraum, Atelier, Rollenspielraum, Forscherraum, Lesehöhle',
      'Tagesstruktur: Bring-Zeit 7–9h, Freispiel, Angebote, Mahlzeiten, Abholzeit',
      'Projektarbeit: 1–2 Projekte/Gruppe/Jahr (aktuell: Wasserprojekt Gr.2)',
      'Raumkonzept-Review: Sep 2026 (nach Umbau Forscherraum — Planung Jun)',
    ],
  },
  {
    id: 'konz4', typ: 'inklusion', titel: 'Inklusion & Vielfalt',
    datum: 'Integrationskonzept 2024', verantwortlich: 'Kita-Ltg. + Fachberatung', status: 'aktiv',
    punkte: [
      'I-Kinder: 3 Kinder mit Integrationsbescheid (Einzelfallhilfe, Fachkraft je 20h)',
      'Kulturen: 28% Kinder mit Migrationshintergrund (24% DaZ — Sprachförderkonzept)',
      'Inklusion religiöse Vielfalt: Feste aller Kulturen werden gefeiert (Kalender)',
      'Barrierefreiheit: Kita barrierefrei (Rampe, breite Türen, Rollstuhl Gr.1)',
      'Antidiskriminierung: Schulung Team 2024 (Diversitätssensible Pädagogik)',
    ],
  },
  {
    id: 'konz5', typ: 'fortschreibung', titel: 'Konzeptfortschreibung & Qualitätszirkel',
    datum: 'Fortschreibung fällig!', verantwortlich: 'Kita-Ltg. + Team + Träger', status: 'faellig',
    punkte: [
      'Konzeption: zuletzt vollständig überarbeitet 2023 — Fortschreibung 2026 fällig',
      'Fortschreibungsprozess: Träger-Vorgabe alle 3 Jahre (Frist: Dez 2026)',
      'Qualitätszirkel: 4×/Jahr (nächster Jun 2026 — TOP: Konzeptfortschreibung starten)',
      'Externe Evaluation: KES-R 2024 (nächste 2027) — Ergebnisse in Konzept einarbeiten',
      'Beteiligung: Elternbeirat + Team bei Fortschreibung (partizipativ)',
    ],
  },
]

export default function KonzeptionPage() {
  const [expanded, setExpanded] = useState<string | null>('konz5')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Konzeptfortschreibung 2026 fällig (Qualitätszirkel Jun starten). 3 I-Kinder. 10 KiBiz-Bildungsbereiche abgedeckt. Leitbild 2023 aktiv.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <BookHeart className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Konzeption
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Leitbild · Bildungsbereiche · Methodik · Inklusion · Fortschreibung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'I-Kinder',    val: 3, color: '#0d9488' },
          { label: 'Fortschr.',   val: '2026', color: '#f97316' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Konzeptfortschreibung 2026 bis Dez — Qualitätszirkel Jun starten — KES-R-Ergebnisse einarbeiten</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Konzeptionsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Konzeptionsübersicht'}
        </button>
      )}

      <div className="space-y-2">
        {EINTRAEGE.map(e => {
          const isOpen = expanded === e.id
          const tCfg = TYP_CFG[e.typ]
          const sCfg = STATUS_CFG[e.status]
          return (
            <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <button onClick={() => setExpanded(isOpen ? null : e.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span>
                    <span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p>
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p>
                </div>
                {isOpen
                  ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
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
