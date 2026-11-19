'use client'

import { useState } from 'react'
import { Receipt, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Trägerabrechnung — kids-mindry ──────────────────────────────────────────��─
// Beiträge · Abrechnung · Jugendamt · KiBiz · Landeszuschuss

type TRTyp = 'beitraege' | 'abrechnung' | 'jugendamt' | 'kibiz' | 'landeszuschuss' | 'sonderleistung' | 'dsgvo'
type TRStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface TREintrag {
  id: string; typ: TRTyp; titel: string; datum?: string; verantwortlich: string; status: TRStatus; punkte: string[]
}

const TYP_CFG: Record<TRTyp, { label: string; farbe: string }> = {
  beitraege:    { label: 'Elternbeiträge',   farbe: 'bg-green-50 text-green-700 border-green-200' },
  abrechnung:   { label: 'Abrechnung',       farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  jugendamt:    { label: 'Jugendamt',        farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  kibiz:        { label: 'KiBiz NRW',        farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  landeszuschuss:{ label: 'Landesförderung', farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  sonderleistung:{ label: 'Sonderleistg.',  farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  dsgvo:        { label: 'Datenschutz',      farbe: 'bg-red-50 text-red-700 border-red-200' },
}
const STATUS_CFG: Record<TRStatus, { label: string; farbe: string }> = {
  aktiv: { label: 'Aktiv', farbe: 'text-teal-600' }, faellig: { label: 'Fällig', farbe: 'text-red-500' },
  geplant: { label: 'Geplant', farbe: 'text-blue-400' }, abgeschlossen: { label: 'Abgeschl.', farbe: 'text-gray-400' },
  handlungsbedarf: { label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: TREintrag[] = [
  { id: 'tr1', typ: 'beitraege', titel: 'Elternbeiträge & Beitragsstruktur', datum: 'Monatl. Einzug', verantwortlich: 'Träger + Kita-Ltg.', status: 'aktiv',
    punkte: ['Beitragsstruktur: einkommensabhängig (Jugendamt-Tabelle, Träger-Satzung)', 'Beitragsfrei: ab 3. Kind + U3 in vielen Fällen (KiBiz-Regelung NRW)',
      'SEPA-Mandate: alle 73 Familien erteilt (Träger-Buchung zum 1./15. des Monats)', 'Indexanpassung Jul 2026: +3,2% (Träger-Beschluss, Eltern informiert Mai-Brief)',
      'Zahlungsrückstand: 2 Familien (Träger-Mahnwesen, Kita-Ltg. informiert)'] },
  { id: 'tr2', typ: 'kibiz', titel: 'KiBiz-Abrechnung & Belegungsnachweis', datum: 'Frist 15.06.!', verantwortlich: 'Kita-Ltg. + Träger', status: 'faellig',
    punkte: ['KiBiz-Jahresabrechnung: Frist 15.06.2026 (Belegungsnachweis + Stundenabrechnung)', 'Belegungszahl: 73 Kinder (Krippe 15, Kita 58) — amtl. Stichtagsmeldung 15.03.',
      'Betreuungsumfang: Ø 38,2h/Woche (KiBiz-Stundenmeldung korrekt)', 'Fördersumme KiBiz: 186.400€/SJ (Träger-Bescheid vorliegend)',
      'Nachweisführung: Anwesenheitslisten KitaPlus (tägl., Archivierung 10 Jahre)'] },
  { id: 'tr3', typ: 'jugendamt', titel: 'Jugendamt & Betriebserlaubnis', datum: 'Erlaubnis aktuell', verantwortlich: 'Träger + Kita-Ltg.', status: 'aktiv',
    punkte: ['Betriebserlaubnis: erteilt (letzte Überprüfung Feb 2026, keine Beanstandungen)', 'Jugendamt-Begehung: alle 3 Jahre (nächste Feb 2029, Protokoll archiviert)',
      'Meldepflichten: Kapazitätsänderungen + Personalwechsel (Jugendamt binnen 4 Wochen)', 'Belegungsnachweis: monatl. an Jugendamt (KitaPlus-Export, Träger versendet)',
      'Bauliche Anforderungen: erfüllt (Flächennachweis, Sanitär, Ruheräume — Protokoll Feb)'] },
  { id: 'tr4', typ: 'landeszuschuss', titel: 'Landesförderung & Sonderprogramme', datum: 'SJ-Zuschüsse', verantwortlich: 'Träger', status: 'aktiv',
    punkte: ['Sprachförderpauschale: 4.200€ (Rucksack-Programm + DaZ, Träger-Antrag gestellt)', 'Fachkraftoffensive NRW: 2 MA-Stellen mit Förderanteil (laufend bis 2027)',
      'U3-Ausbau-Investitionsprogramm: abgeschlossen (2022, Krippen-Ausbau finanziert)', 'KiTa-Qualitätsgesetz: Umsetzung laufend (Inklusion + Qualitätsrahmen bis 2026)',
      'Bildungsschecks LK: 3 MA beantragt (500€/MA für externe Fortbildung)'] },
  { id: 'tr5', typ: 'abrechnung', titel: 'Monatsabrechnung & Rechnungslegung', datum: 'Monatl. Abschluss', verantwortlich: 'Träger-Buchhaltung', status: 'aktiv',
    punkte: ['Monatsabrechnung: Träger-Buchhaltung (Kita-Ltg. prüft Plausibilität bis 5.),', 'Jahresabschluss: Apr/Mai (Steuerberater, Kita-Ltg. liefert Belege bis 31.03.)',
      'Kassenführung Kita: Handkasse 300€ (Auslagen, Einzelbelege, monatl. Abrechnung)', 'Rücklagen Träger: 15.000€ (Liquiditätsreserve, Satzungsregelung)',
      'Wirtschaftlichkeitsbericht: jährl. Mitgliederversammlung (Träger e.V., Jun)'] },
]

export default function TraegerrechnungPage() {
  const [expanded, setExpanded] = useState<string | null>('tr2')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)
  function kiAnfordern() { setKiLaedt(true); setTimeout(() => { setKiText(`${EINTRAEGE.length} Bereiche. KiBiz-Frist 15.06.! 73 Kinder, 186.400€ KiBiz. 2 Zahlungsrückstände. Indexanpassung Jul +3,2%.`); setKiLaedt(false) }, 950) }
  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div><h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}><Receipt className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Trägerabrechnung</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Beiträge · KiBiz · Jugendamt · Landesförderung · Abrechnung</p></div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: 'Bereiche', val: EINTRAEGE.length, color: 'var(--color-primary)' }, { label: 'KiBiz €', val: '186K', color: '#0d9488' }, { label: 'Frist!', val: '15.06.', color: '#ef4444' }].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p></div>))}
      </div>
      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#ef4444' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#b91c1c' }}>KiBiz-Jahresabrechnung bis 15.06. einreichen! — 2 Zahlungsrückstände — Beitrag Jul +3,2%</p></div>
      {kiText ? (<div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}><p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Trägerübersicht</p><p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p></div>
      ) : (<button onClick={kiAnfordern} disabled={kiLaedt} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-3.5 h-3.5" />{kiLaedt ? 'KI analysiert...' : 'KI-Trägerübersicht'}</button>)}
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
