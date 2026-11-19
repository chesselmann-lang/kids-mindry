'use client'

import { useState } from 'react'
import { ClipboardList, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Aufnahmeverfahren — kids-mindry ───────────────────────────────────────────
// Aufnahmeantrag · Warteliste · Platzvergabe · Vertragsabschluss · Eingewöhnung

type AVTyp = 'antrag' | 'warteliste' | 'vergabe' | 'vertrag' | 'eingewoehnung' | 'abmeldung' | 'recht'
type AVStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface AVEintrag {
  id: string
  typ: AVTyp
  titel: string
  datum?: string
  verantwortlich: string
  status: AVStatus
  punkte: string[]
}

const TYP_CFG: Record<AVTyp, { label: string; farbe: string }> = {
  antrag:       { label: 'Aufnahmeantrag',   farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  warteliste:   { label: 'Warteliste',       farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  vergabe:      { label: 'Platzvergabe',     farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  vertrag:      { label: 'Betreuungsvertrag',farbe: 'bg-green-50 text-green-700 border-green-200' },
  eingewoehnung:{ label: 'Eingewöhnung',     farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  abmeldung:    { label: 'Abmeldungen',      farbe: 'bg-red-50 text-red-700 border-red-200' },
  recht:        { label: 'Rechtl. Grundlagen',farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const STATUS_CFG: Record<AVStatus, { label: string; farbe: string }> = {
  aktiv:          { label: 'Aktiv',           farbe: 'text-teal-600' },
  faellig:        { label: 'Fällig',          farbe: 'text-red-500' },
  geplant:        { label: 'Geplant',         farbe: 'text-blue-400' },
  abgeschlossen:  { label: 'Abgeschl.',       farbe: 'text-gray-400' },
  handlungsbedarf:{ label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: AVEintrag[] = [
  {
    id: 'av1', typ: 'antrag', titel: 'Aufnahmeanträge & Bewerbungsverfahren',
    datum: 'Bewerbungsphase: Nov–Jan', verantwortlich: 'Kita-Ltg.', status: 'abgeschlossen',
    punkte: [
      'Aufnahmeanträge SJ 2026/27: 47 eingegangen (Bewerbungsphase Nov–Jan)',
      'Antragsformular: digital via Website + Kita-Navigator Stadt (dual track)',
      'Vollständigkeit: 44/47 vollständig (3 Nachforderungen verschickt, 2 beantwortet)',
      'Bewerbungsphase 2027/28: Nov 2026 (Kita-Navigator-Eintrag bis Sep)',
      'DSGVO-Einwilligung: alle Antragsformulare mit Datenschutzerklärung versehen',
    ],
  },
  {
    id: 'av2', typ: 'warteliste', titel: 'Warteliste & Prioritäten',
    datum: 'Warteliste: 34 Kinder', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Warteliste aktuell: 34 Kinder (Stand Mai 2026, nach Vergabe SJ 2026/27)',
      'Prioritätskriterien: Alter + Berufstätigkeit Eltern + Geschwisterkind (Träger-Vorgabe)',
      'Wartelistenverwaltung: KitaPlus-Software (automatische Punkteberechnung)',
      'Benachrichtigung: Wartelisten-Update 2× jährlich (Feb + Aug) an alle Eltern',
      'Transparenz: keine Platznummern herausgegeben (diskrete Rangfolge, Träger-Policy)',
    ],
  },
  {
    id: 'av3', typ: 'vergabe', titel: 'Platzvergabe SJ 2026/27',
    datum: 'Vergabe abgeschlossen', verantwortlich: 'Kita-Ltg. + Träger', status: 'abgeschlossen',
    punkte: [
      'Freie Plätze SJ 2026/27: 12 Plätze (8 aus Abgänge + 4 neu durch Kapazitätserweitung)',
      'Vergabe: 12 Zusagen verschickt (Apr 2026) — 11 bestätigt, 1 Absage',
      'Absagen-Nachbesetzung: 1 Platz nachbesetzt (Warteliste Position 1 nachgerückt)',
      'Abgelehnte Bewerber: 35 Absagen (Standardbrief + Wartelistenangebot)',
      'Beleg Vergabe-Protokoll: Träger + Kita-Ltg. (Dokumentation DSGVO-konform)',
    ],
  },
  {
    id: 'av4', typ: 'vertrag', titel: 'Betreuungsverträge & Vertragsabschluss',
    datum: 'Neue Kinder: 12 Verträge', verantwortlich: 'Kita-Ltg.', status: 'aktiv',
    punkte: [
      'Vertragsabschluss: 12 neue Verträge für SJ 2026/27 (alle unterschrieben bis Mai)',
      'Vertragsinhalte: Betreuungszeit, Beiträge, Kündigung, Hausordnung, Datenschutz',
      'Beitragsänderung: Indexanpassung Jul 2026 (Träger-Schreiben, LK informiert)',
      'Kündigungsfristen: 4 Wochen zum Monatsende (Vertrag § 7)',
      'SEPA-Mandat: alle 12 neuen Familien Bankdaten eingereicht (Träger verarbeitet)',
    ],
  },
  {
    id: 'av5', typ: 'eingewoehnung', titel: 'Eingewöhnungsplanung Neu-Kinder Aug/Sep',
    datum: 'Start: 01.08.2026', verantwortlich: 'Gruppenleitung + Kita-Ltg.', status: 'geplant',
    punkte: [
      'Eingewöhnung: Berliner Modell (2–4 Wochen, Eltern begleiten anfangs)',
      'Eingewöhnungsplan: für alle 12 Kinder ab 01.08.2026 (Terminplan bis Jun)',
      'Info-Abend: 25.06.2026 für alle neuen Familien (Konzept, Fragen, Gruppenvorst.)',
      'Gruppenaufteilung: 5 Kinder Gr.1, 4 Kinder Gr.2, 3 Kinder Gr.3 (Alters-Mix)',
      'Übergabe-Checkliste: Impfausweis, Allergieformular, Notfallkontakte (bis 25.06.)',
    ],
  },
]

export default function AufnahmeverfahrenPage() {
  const [expanded, setExpanded] = useState<string | null>('av2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)

  function kiAnfordern() {
    setKiLaedt(true)
    setTimeout(() => {
      setKiText(`${EINTRAEGE.length} Bereiche. 12 neue Kinder SJ 2026/27 (alle Verträge). Warteliste 34. Info-Abend 25.06. Eingewöhnung ab 01.08. Bewerbungsphase 2027/28 Nov.`)
      setKiLaedt(false)
    }, 950)
  }

  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <ClipboardList className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Aufnahmeverfahren
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Anträge · Warteliste · Platzvergabe · Vertrag · Eingewöhnung</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Bereiche',    val: EINTRAEGE.length, color: 'var(--color-primary)' },
          { label: 'Warteliste',  val: 34, color: '#f97316' },
          { label: 'Neue Kinder', val: 12, color: '#0d9488' },
        ].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p>
            <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#16a34a' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#15803d' }}>Info-Abend 25.06. — Eingewöhnung ab 01.08. — Bewerbungsphase 2027/28 im Nov einrichten</p>
      </div>

      {kiText ? (
        <div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Aufnahmeübersicht</p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p>
        </div>
      ) : (
        <button onClick={kiAnfordern} disabled={kiLaedt}
          className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}>
          <Sparkles className="w-3.5 h-3.5" />
          {kiLaedt ? 'KI analysiert...' : 'KI-Aufnahmeübersicht'}
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
