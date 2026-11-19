'use client'

import { useState } from 'react'
import { Users, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Elternbeirat Kita — kids-mindry ─────────────────────────────────────────
// Elternbeirat · Mitarbeit · Sitzungen · Beschwerden · Recht

type EBTyp = 'beirat' | 'sitzung' | 'mitarbeit' | 'kommunikation' | 'beschwerde' | 'recht' | 'projekte'
type EBStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface EBEintrag {
  id: string; typ: EBTyp; titel: string; datum?: string; verantwortlich: string; status: EBStatus; punkte: string[]
}

const TYP_CFG: Record<EBTyp, { label: string; farbe: string }> = {
  beirat:       { label: 'Elternbeirat',   farbe: 'bg-green-50 text-green-700 border-green-200' },
  sitzung:      { label: 'Sitzungen',      farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  mitarbeit:    { label: 'Mitarbeit',      farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kommunikation:{ label: 'Kommunikation',  farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  beschwerde:   { label: 'Beschwerden',    farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  recht:        { label: 'Rechtliches',    farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  projekte:     { label: 'Projekte',       farbe: 'bg-red-50 text-red-700 border-red-200' },
}
const STATUS_CFG: Record<EBStatus, { label: string; farbe: string }> = {
  aktiv: { label: 'Aktiv', farbe: 'text-teal-600' }, faellig: { label: 'Fällig', farbe: 'text-red-500' },
  geplant: { label: 'Geplant', farbe: 'text-blue-400' }, abgeschlossen: { label: 'Abgeschl.', farbe: 'text-gray-400' },
  handlungsbedarf: { label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: EBEintrag[] = [
  { id: 'eb1', typ: 'beirat', titel: 'Elternbeirat 2025/26', datum: 'Wahl Sep 2025', verantwortlich: 'Elternbeirat + Kita-Ltg.', status: 'aktiv',
    punkte: ['Elternbeirat: 5 Mitglieder (Vors. Frau Schneider, Stv. Hr. Yildiz, 3 Beisitzer)',
      'Wahl: Sep 2025, Amtszeit 1 Jahr (Neuwahl Sep 2026 — Einladung Aug vorbereiten)', 'Beschlüsse: protokollpflichtig, Einsicht für alle Familien auf Anfrage',
      'Trägergespräch: jährl. (EB + Träger, letztes Gespräch Feb 2026, nächstes Sep)', 'Abberufung: nur bei wichtigem Grund (KiBiz § 9, Träger-Satzung)'] },
  { id: 'eb2', typ: 'sitzung', titel: 'Sitzungsrhythmus & Protokolle', datum: '6 Sitzungen/Jahr', verantwortlich: 'Elternbeirat-Vors.', status: 'aktiv',
    punkte: ['Sitzungen: 6×/Jahr (2-monatl., Kita-Räume, abends 19 Uhr)',
      'Nächste Sitzung: 12.05.2026 (Themen: Sommerfest, Beitragserhöhung Jul, Herbstflohmarkt)', 'Protokoll: Elternbeirats-Vors. (binnen 2 Wochen, Aushang Foyer + KitaPlus-Elternportal)',
      'Einladung: mind. 5 Werktage vorher (KitaPlus-Nachricht + Aushang)', 'Teilnahme Kita-Ltg.: beratend (kein Stimmrecht, Informationspflicht gegenüber EB)'] },
  { id: 'eb3', typ: 'mitarbeit', titel: 'Elterliche Mitarbeit & Aktionen', datum: 'Schulfest 21.06.', verantwortlich: 'EB + Kita-Ltg.', status: 'aktiv',
    punkte: ['Sommerfest 21.06.2026: EB organisiert (Helfer-Liste offen, mind. 12 Eltern nötig!)',
      'Herbst-Flohmarkt: EB-Termin Sep 2026 (Kita-Spende 20%, Eltern-Erlös 80%)', 'Kita-Werkstatt: monatl. Samstag (4 Eltern-Teams, Reparaturen + Gartenpflege)',
      'Buchpaten: 8 Eltern (Vorlese-Aktionen 1×/Monat, Terminkoordination EB)', 'Eltern-Café: quartalsweise (Kita-Ltg. + EB, Austausch + Themenabend)'] },
  { id: 'eb4', typ: 'beschwerde', titel: 'Beschwerden & Konfliktmanagement', datum: 'Verfahren klar', verantwortlich: 'Kita-Ltg. + EB', status: 'handlungsbedarf',
    punkte: ['Beschwerdeverfahren: schriftl. an Kita-Ltg. (Antwort binnen 10 Werktagen, Protokoll)',
      'Laufende Beschwerden: 2 (1 Essensqualität — Caterer angeschrieben, 1 Gruppengestaltung)', 'EB als Mittler: bei Beschwerden gegen Kita-Ltg. (Träger einschalten, protokollieren)',
      'Anonymes Feedback: Briefkasten Foyer (EB leert monatl., Auswertung Sitzung)', 'Eskalation: 0 Fälle ans Jugendamt SJ — Verfahren greifen (Qualitätsindikator)'] },
  { id: 'eb5', typ: 'recht', titel: 'Rechte & Mitwirkung KiBiz', datum: 'KiBiz § 9', verantwortlich: 'Träger + Kita-Ltg.', status: 'aktiv',
    punkte: ['Mitwirkungsrechte EB: KiBiz § 9 (Anhörung bei Personalfragen, Konzeptänderungen)',
      'Informationspflicht: Kita-Ltg. informiert EB über wesentliche Änderungen (4 Wochen)', 'Zustimmungspflichtig: Öffnungszeitenänderung, Beitragserhöhung (EB-Beschluss nötig)',
      'DSGVO EB: Mitgliederliste nur intern, keine Weitergabe ohne Einwilligung', 'Schulung EB: jährl. Angebot Träger (Elternbeirats-Schulung LWL-Fortbildung, angeboten Apr)'] },
]

export default function ElternbeiratKitaPage() {
  const [expanded, setExpanded] = useState<string | null>('eb3')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)
  function kiAnfordern() { setKiLaedt(true); setTimeout(() => { setKiText(`${EINTRAEGE.length} Bereiche. Sommerfest 21.06. — Helfer-Liste offen! 2 laufende Beschwerden. Nächste Sitzung 12.05.`); setKiLaedt(false) }, 950) }
  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div><h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}><Users className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Elternbeirat</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Elternbeirat · Sitzungen · Mitarbeit · Beschwerden · Recht</p></div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: 'Bereiche', val: EINTRAEGE.length, color: 'var(--color-primary)' }, { label: 'Sitzungen', val: '6/Jahr', color: '#0d9488' }, { label: 'Beschwerden', val: 2, color: '#f97316' }].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p></div>))}
      </div>
      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Sommerfest 21.06. — Helferliste noch offen! — Nächste Sitzung 12.05. — 2 Beschwerden laufend</p></div>
      {kiText ? (<div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}><p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Elternbeirat-Übersicht</p><p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p></div>
      ) : (<button onClick={kiAnfordern} disabled={kiLaedt} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-3.5 h-3.5" />{kiLaedt ? 'KI analysiert...' : 'KI-Elternbeirat-Übersicht'}</button>)}
      <div className="space-y-2">{EINTRAEGE.map(e => { const isOpen = expanded === e.id; const tCfg = TYP_CFG[e.typ]; const sCfg = STATUS_CFG[e.status]; return (
          <div key={e.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <button onClick={() => setExpanded(isOpen ? null : e.id)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left">
              <div className="flex-1 min-w-0"><div className="flex items-center gap-1.5"><span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-semibold ${tCfg.farbe}`}>{tCfg.label}</span><span className={`text-[8px] font-semibold ${sCfg.farbe}`}>{sCfg.label}</span></div>
                <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--color-text)' }}>{e.titel}</p><p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{e.verantwortlich}{e.datum ? ` · ${e.datum}` : ''}</p></div>
              {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
            </button>
            {isOpen && (<div className="px-3 pb-3 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--color-border)' }}>{e.punkte.map((p, i) => (<div key={i} className="flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--color-primary)' }} /><p className="text-[9px]" style={{ color: 'var(--color-text)' }}>{p}</p></div>))}</div>)}
          </div>)})}
      </div>
    </div>
  )
}
