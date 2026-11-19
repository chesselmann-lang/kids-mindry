'use client'

import { useState } from 'react'
import { FileText, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Jahresbericht — kids-mindry ────────────────────────────────────────────────
// Qualitätsbericht · Belegung · Personal · Konzept · Träger · Behörde

type JBTyp = 'belegung' | 'personal' | 'qualitaet' | 'finanzen' | 'konzept' | 'behoerde' | 'traeger'
type JBStatus = 'aktuell' | 'inarbeit' | 'faellig' | 'abgeschlossen' | 'geplant'

interface JBEintrag {
  id: string
  typ: JBTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: JBStatus
  punkte: string[]
}

const TYP_CFG: Record<JBTyp, { label: string; farbe: string }> = {
  belegung:  { label: 'Belegungsstatistik', farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  personal:  { label: 'Personal',           farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  qualitaet: { label: 'Qualitätsbericht',   farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  finanzen:  { label: 'Finanzen/Budget',    farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  konzept:   { label: 'Konzeptionsentw.',   farbe: 'bg-green-50 text-green-700 border-green-200' },
  behoerde:  { label: 'Behördenmeldungen',  farbe: 'bg-rose-50 text-rose-700 border-rose-200' },
  traeger:   { label: 'Trägerkommunikation',farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
}

const STATUS_CFG: Record<JBStatus, { label: string; farbe: string }> = {
  aktuell:      { label: 'Aktuell',     farbe: 'text-teal-600' },
  inarbeit:     { label: 'In Arbeit',   farbe: 'text-blue-400' },
  faellig:      { label: 'Fällig',      farbe: 'text-red-500' },
  abgeschlossen:{ label: 'Abgeschl.',   farbe: 'text-gray-400' },
  geplant:      { label: 'Geplant',     farbe: 'text-orange-400' },
}

const EINTRAEGE: JBEintrag[] = [
  {
    id: 'jb1', typ: 'belegung', titel: 'Belegungsstatistik SJ 2025/26',
    datum: 'Stichtag 01.03.2026', verantwortlich: 'KiTa-Leitung', status: 'aktuell',
    punkte: [
      'Gesamtkapazität: 75 Plätze (5 Gruppen), Auslastung 98% (73/75)',
      'Altersstruktur: U3 = 22 Kinder (29%), Ü3 = 51 Kinder (71%)',
      'Betreuungszeiten: 25h = 28 Kinder, 35h = 38 Kinder, 45h = 7 Kinder',
      'Warteliste: 34 Kinder (Stand Apr, davon 11 U3-Plätze gesucht)',
      'Abmeldungen Sep 2026: 14 Kinder (Schulstart) — 15 Neuzugänge geplant',
    ],
  },
  {
    id: 'jb2', typ: 'personal', titel: 'Personalstatistik & Jahresauswertung',
    datum: 'Jahresbericht Frist: 30.06.2026', verantwortlich: 'KiTa-Leitung + Träger AWO', status: 'inarbeit',
    punkte: [
      'Personalbestand: 12 pädagogische FK (VZÄ: 9,5), 2 Hauswirtschaft, 1 Leitung',
      'Fluktuation SJ: 1 Abgang (Elternzeit), 2 Zugänge (Nowak + Diaz)',
      'Krankheitsquote SJ: 8,2% (Vorjahr 9,7%) — deutliche Verbesserung',
      'Fortbildungsstunden: Ø 24h/MA (Ziel 20h erreicht)',
      'Offene Stellen: 0 (Vollbesetzung seit Nov 2025)',
    ],
  },
  {
    id: 'jb3', typ: 'qualitaet', titel: 'Qualitätsbericht & Elternbefragung',
    datum: 'Befragung Apr 2026 abgeschlossen', verantwortlich: 'Qualitätsbeauftragte Fr. Koch', status: 'inarbeit',
    punkte: [
      'Elternbefragung: 68/73 Rückmeldungen (93%) — Note Ø 1,8',
      'Top-Bewertungen: Fürsorge, Kommunikation, Sauberkeit',
      'Verbesserungspotenzial: Außengelände (43% wünschen mehr Spielgeräte)',
      'Beschwerdemanagement: 4 Beschwerden SJ (alle bearbeitet, 2 strukturell)',
      'QM-Bericht: Vorlage für Träger + Jahresberricht bis 30.06.',
    ],
  },
  {
    id: 'jb4', typ: 'behoerde', titel: 'Behördliche Jahres- und Stichtagsmeldungen',
    datum: 'Verschiedene Fristen', verantwortlich: 'KiTa-Leitung', status: 'faellig',
    punkte: [
      'KiBiz-Meldung (Stichtag 15.03.2026): abgeschlossen ✓',
      'Betriebserlaubnis: Prüfung Jugendamt ausstehend (Termin Jun 2026)',
      'Personalnachweis Jahresbericht: bis 30.06. (Fachkraftquote dokumentieren)',
      'Unfallmeldungen: 2 an GUV (beide fristgerecht)',
      'Hygiene-Selbstauskunft Gesundheitsamt: bis 15.05. (noch nicht eingereicht!)',
    ],
  },
  {
    id: 'jb5', typ: 'traeger', titel: 'Jahresbericht für Träger AWO',
    datum: 'Abgabe: 30.06.2026', verantwortlich: 'KiTa-Leitung', status: 'geplant',
    punkte: [
      'Jahresbericht-Vorlage: AWO-Standard (Ordner Träger → Berichte)',
      'Kapitel: Belegung, Personal, Qualität, Konzept, Besonderes SJ',
      'Besondere Ereignisse SJ: Umbau Eingangsbereich (Sep), neues Außengelände',
      'Konzeptüberarbeitung: Kapitel "Inklusion" + "Digitale Medien" neu (Fr. Koch)',
      'Jahresbericht-Präsentation: Trägerkonferenz 10.07. (KiTa-Leitung vor Ort)',
    ],
  },
]

export default function JahresberichtPage() {
  const [expanded, setExpanded] = useState<string | null>('jb4')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. Belegung 98% (73/75), Warteliste 34 Kinder. Hygiene-Selbstauskunft bis 15.05. ausstehend! Jahresbericht Träger: 30.06. Personal vollbesetzt.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <FileText className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Jahresbericht
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Belegung · Personal · Qualität · Behörden · Träger</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',   val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Fällig',     val: EINTRAEGE.filter(e => e.status === 'faellig').length, color: '#ef4444' },
          { label: 'Belegung',   val: '98%', color: '#0d9488' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Hygiene-Selbstauskunft bis 15.05. — Personalnachweis 30.06. — Träger-Jahresbericht 30.06.</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Jahresberichtsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Jahresberichtsübersicht'}
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
