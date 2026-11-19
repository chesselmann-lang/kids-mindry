'use client'

import { useState } from 'react'
import { HeartHandshake, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Inklusionsplan — kids-mindry ──────────────────────────────────────────────
// I-Kinder · Förderpläne · Fachberatung · Elternarbeit · Netzwerk

type IPTyp = 'ikinder' | 'foerderplan' | 'fachberatung' | 'raumkonzept' | 'eltern' | 'netzwerk' | 'recht'
type IPStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface IPEintrag {
  id: string
  typ: IPTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: IPStatus
  punkte: string[]
}

const TYP_CFG: Record<IPTyp, { label: string; farbe: string }> = {
  ikinder:    { label: 'I-Kinder',         farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  foerderplan:{ label: 'Förderplanung',    farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  fachberatung:{ label: 'Fachberatung',   farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  raumkonzept:{ label: 'Raumkonzept',     farbe: 'bg-green-50 text-green-700 border-green-200' },
  eltern:     { label: 'Elternarbeit',    farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  netzwerk:   { label: 'Netzwerk',        farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  recht:      { label: 'Rechtl. Rahmen',  farbe: 'bg-red-50 text-red-700 border-red-200' },
}

const STATUS_CFG: Record<IPStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: IPEintrag[] = [
  {
    id: 'ip1', typ: 'ikinder', titel: 'I-Kinder & Bedarfsprofile',
    datum: 'Aktuell: 5 I-Kinder', verantwortlich: 'Kita-Ltg. + Sonderpäd.', status: 'aktiv',
    punkte: [
      'I-Kinder aktuell: 5 (Entwicklungsverzögerung 2, Sprache 1, Motorik 1, Autismus-Spektrum 1)',
      'Integrationsstellen: 3,5 Fachkraftstellen (Träger-Zuweisung, LVR-Finanzierung)',
      'Schuljahres-Aufnahme: 2 neue I-Kinder Aug 2026 (Bewilligungen Jugendamt vorliegend)',
      'Einzelintegration: alle 5 Kinder in Regelgruppen (kein Sonderbereich)',
      'I-Kinder-Übersicht: anonymisiert in Trägerbericht (jährl., Datenschutz)',
    ],
  },
  {
    id: 'ip2', typ: 'foerderplan', titel: 'Individuelle Förderpläne',
    datum: 'Aktualisierung bis 01.06.!', verantwortlich: 'Gruppenleitung + Sonderpäd.', status: 'faellig',
    punkte: [
      'Förderpläne: für alle 5 I-Kinder (Halbjahres-Aktualisierung bis 01.06. fällig!)',
      'Förderplan-Vorlage: Träger-Standard (Ziele SMART, Maßnahmen, Evaluation)',
      'Elternbeteiligung: Förderplan mit Eltern besprechen + unterschreiben (jedes Hj.)',
      'Zielerreichung: Evaluation im Förderplan-Gespräch (Jun + Dez je Kind)',
      'Dokumentation: KitaPlus-Fördermodul (passwortgeschützt, nur zugewiesene MA)',
    ],
  },
  {
    id: 'ip3', typ: 'fachberatung', titel: 'Fachberatung & externe Unterstützung',
    datum: 'Reg. Termine', verantwortlich: 'Kita-Ltg. + Fachberater/in', status: 'aktiv',
    punkte: [
      'LVR-Inklusionsbegleitung: Fr. Dr. Kern (2× jährl. Beratung + Fallevaluation)',
      'Frühförderstelle: 3 Kinder in Frühförderung (parallel zur Kita, Terminabst.)',
      'Logopädie/Ergotherapie: 2 Kinder externe Therapie (Eltern organisiert, Kita-Info)',
      'SPZ-Anbindung: 1 Kind SPZ-Diagnose (Kinderklinik, Kita koordiniert Arztbriefe)',
      'Fachberatung Autismus: Autismus-Therapie-Zentrum Beratung (Mai 2026)',
    ],
  },
  {
    id: 'ip4', typ: 'eltern', titel: 'Elternarbeit I-Kinder',
    datum: '4–6 Gespräche/Kind/SJ', verantwortlich: 'Gruppenleitung + Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Elterngespräche: 4–6 Mal/SJ je I-Kind (Förderplan + Entwicklung + Übergänge)',
      'Willkommensgespräch neue I-Kinder: Aug 2026 (Bedarf erfassen, MA vorstellen)',
      'Informationsrecht: Eltern über alle Maßnahmen + Förderberichte informiert',
      'Übergangs-Gespräch Grundschule: Sep/Okt (Abstimmung Sonderpäd. + Eltern + GS)',
      'Gesprächsdokumentation: KitaPlus (Datum, Teilnehmer, Ergebnis, nächste Schritte)',
    ],
  },
  {
    id: 'ip5', typ: 'netzwerk', titel: 'Inklusionsnetzwerk & Kooperation',
    datum: 'Aktive Vernetzung', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Runder Tisch Inklusion: Jugendamt + LVR + Kita + Frühförderstelle (2× jährl.)',
      'Grundschule: Übergangskonzept I-Kinder (gemeinsames Protokoll, stv. Beschluss)',
      'Jugendamt-Beratung: bei Neuanträgen + Verlängerungen (LVR-Kostenerstattung)',
      'Elterntreff I-Kinder: 1× jährl. (Austausch Eltern untereinander, Kita-Moderation)',
      'Fortbildung Inklusion: 2 MA für Fachtagung Sep 2026 angemeldet (LVR-gefördert)',
    ],
  },
]

export default function InklusionsplanPage() {
  const [expanded, setExpanded] = useState<string | null>('ip2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. 5 I-Kinder (2 neue ab Aug). Förderpläne bis 01.06. aktualisieren! 3,5 Integrationsstellen. LVR-Beratung aktiv.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <HeartHandshake className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Inklusionsplan
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>I-Kinder · Förderpläne · Fachberatung · Elternarbeit · Netzwerk</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',  val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'I-Kinder', val: 5, color: '#0d9488' },
          { label: 'Pläne!',   val: '01.06.', color: '#ef4444' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#ef4444' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#b91c1c' }}>Alle 5 Förderpläne bis 01.06. aktualisieren! — Willkommensgespräche neue I-Kinder Aug</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Inklusionsübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Inklusionsübersicht'}
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
