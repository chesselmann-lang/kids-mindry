'use client'

import { useState } from 'react'
import { TrendingUp, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Personalentwicklung — kids-mindry ──────────────────────────────────────────
// Mitarbeitergespräche · Fortbildung · Teamentwicklung · Supervision · Karriere

type PETyp = 'mitarbeitergesprach' | 'fortbildung' | 'teamentwicklung' | 'supervision' | 'karriere' | 'feedback' | 'wohlbefinden'
type PEStatus = 'aktiv' | 'geplant' | 'faellig' | 'abgeschlossen' | 'laufend'

interface PEEintrag {
  id: string
  typ: PETyp
  titel: string
  datum?: string
  verantwortlich: string
  status: PEStatus
  punkte: string[]
}

const TYP_CFG: Record<PETyp, { label: string; farbe: string }> = {
  mitarbeitergesprach:{ label: 'MA-Gespräch',       farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  fortbildung:        { label: 'Fortbildung',        farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  teamentwicklung:    { label: 'Teamentwicklung',    farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  supervision:        { label: 'Supervision',        farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  karriere:           { label: 'Karriere/Aufstieg',  farbe: 'bg-green-50 text-green-700 border-green-200' },
  feedback:           { label: 'Feedback-Kultur',    farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  wohlbefinden:       { label: 'MA-Wohlbefinden',    farbe: 'bg-pink-50 text-pink-700 border-pink-200' },
}

const STATUS_CFG: Record<PEStatus, { label: string; farbe: string }> = {
  aktiv:        { label: 'Aktiv',       farbe: 'text-teal-600' },
  geplant:      { label: 'Geplant',     farbe: 'text-blue-400' },
  faellig:      { label: 'Fällig',      farbe: 'text-red-500' },
  abgeschlossen:{ label: 'Abgeschl.',   farbe: 'text-gray-400' },
  laufend:      { label: 'Laufend',     farbe: 'text-purple-500' },
}

const EINTRAEGE: PEEintrag[] = [
  {
    id: 'pe1', typ: 'mitarbeitergesprach', titel: 'Mitarbeitergespräche (MAG)',
    datum: 'Jährl. Zyklus: Okt–Feb', verantwortlich: 'KiTa-Leitung', status: 'abgeschlossen',
    punkte: [
      'MAG SJ 2025/26: alle 12 pädagogischen MA abgeschlossen (Feb 2026)',
      'Inhalte: Arbeitszufriedenheit, Ziele, Fortbildungswünsche, Feedback',
      'Protokoll: vertraulich (je 1 Exemplar Leitung + MA)',
      'Fortbildungswünsche: Traumapädagogik (4 MA), Lernwerkstatt (2 MA)',
      'Nächster MAG-Zyklus: Okt–Feb 2026/27',
    ],
  },
  {
    id: 'pe2', typ: 'fortbildung', titel: 'Fortbildungsplan & Jahresübersicht',
    datum: 'Budget: 600 € (lfd.)', verantwortlich: 'KiTa-Leitung', status: 'aktiv',
    punkte: [
      'Fortbildungsbudget SJ: 600 € (Träger AWO), 380 € verbraucht, 220 € frei',
      'Abgeschlossene FBs: DaZ-Kurs, Erste-Hilfe, Ernährungsberatung LEAA',
      'Laufende FBs: "Traumapädagogik" (Fr. Hoffmann, 3 Termine, 2 noch offen)',
      'Geplant: "Lernwerkstatt" (Sep 2026, 3 MA, Anmeldung bis Jul)',
      'Bundesfortbildung AWO: Jahrestagung Aug 2026 (1 Platz, Anmeldung läuft)',
    ],
  },
  {
    id: 'pe3', typ: 'supervision', titel: 'Supervision & Reflexion im Team',
    datum: 'Alle 6 Wochen (nächste 14.05.)', verantwortlich: 'Supervisorin Fr. Altmann', status: 'laufend',
    punkte: [
      'Supervision: alle 6 Wochen (externe Supervisorin Fr. Altmann, 2h)',
      'Nächste Sitzung: 14.05.2026 (Thema: Teamdynamik nach Neuzugängen)',
      'Fallbesprechungen: nach Bedarf (anonymisiert, in Supervision integriert)',
      'Teilnahme: alle pädagogischen FK verpflichtend (Ausnahme: Krankenvertretung)',
      'Kosten: Träger AWO trägt vollständig (kein Budget-Posten für Leitung)',
    ],
  },
  {
    id: 'pe4', typ: 'teamentwicklung', titel: 'Teamentwicklung & Klausurtag',
    datum: 'Klausurtag: 17.07.2026', verantwortlich: 'KiTa-Leitung + Moderation', status: 'geplant',
    punkte: [
      'Klausurtag: 17.07.2026 (Hof Osterberg Wuppertal, 9–17h, alle pädagog. MA)',
      'Thema: Leitbild-Überarbeitung + Konzeptkapitel Inklusion',
      'Methode: World-Café + Gruppenarbeit (externe Moderation geplant)',
      'Kosten: ca. 800 € (Raummiete + Verpflegung, beantragt beim Träger)',
      'Vorbereitung: 3 Teamgespräche Mai/Jun zur Themensammlung',
    ],
  },
  {
    id: 'pe5', typ: 'wohlbefinden', titel: 'MA-Wohlbefinden & Gesundheitsschutz',
    datum: 'Lfd. + BGF-Maßnahmen', verantwortlich: 'KiTa-Leitung + Betriebsarzt', status: 'faellig',
    punkte: [
      'Krankheitsquote SJ: 8,2% (Vorjahr 9,7%) — Verbesserung, Trend beobachten',
      'BGF-Maßnahmen (Betriebliche Gesundheitsförderung): Planung für 2026/27 fällig',
      'Ergonomische Arbeitsplätze: 2 Stühle defekt (Antrag Träger gestellt)',
      'Stressbelastung: Urlaubsvertretung Jul/Aug — frühzeitige Planung Mai',
      'Gesundheitscheck Betriebsarzt: überfällig für 4 MA (Einladung bis 01.06.)',
    ],
  },
]

export default function PersonalentwicklungPage() {
  const [expanded, setExpanded] = useState<string | null>('pe5')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. MAG alle abgeschlossen. Supervision 14.05. Klausurtag 17.07. (Leitbild). BGF-Planung + Betriebsarzt 4 MA fällig. Fortbildungsbudget 220 € frei.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <TrendingUp className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Personalentwicklung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>MA-Gespräche · Fortbildung · Supervision · Teamentwicklung · Wohlbefinden</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'MAGs erledigt', val: '12/12', color: '#0d9488' },
          { label: 'FB-Budget', val: '220€', color: '#d97706' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>BGF-Planung fällig — Betriebsarzt 4 MA bis 01.06. — Supervision 14.05. — Klausurtag 17.07.</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Personal-Übersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Personal-Übersicht'}
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
