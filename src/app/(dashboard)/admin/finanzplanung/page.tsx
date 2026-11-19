'use client'

import { useState } from 'react'
import { Wallet, ChevronDown, ChevronUp, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react'

// ── Finanzplanung — kids-mindry ──────────────────────────────────────────────
// Budget · Sachkosten · Investitionen · Rücklagen · Jahresplanung

type FPTyp = 'budget' | 'sachkosten' | 'investition' | 'ruecklagen' | 'foerderung' | 'abrechnung' | 'planung'
type FPStatus = 'aktiv' | 'faellig' | 'geplant' | 'abgeschlossen' | 'handlungsbedarf'

interface FPEintrag {
  id: string; typ: FPTyp; titel: string; datum?: string; verantwortlich: string; status: FPStatus; punkte: string[]
}

const TYP_CFG: Record<FPTyp, { label: string; farbe: string }> = {
  budget:     { label: 'Kita-Budget',     farbe: 'bg-green-50 text-green-700 border-green-200' },
  sachkosten: { label: 'Sachkosten',      farbe: 'bg-blue-50 text-blue-700 border-blue-200' },
  investition:{ label: 'Investitionen',   farbe: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  ruecklagen: { label: 'Rücklagen',       farbe: 'bg-teal-50 text-teal-700 border-teal-200' },
  foerderung: { label: 'Förderung',       farbe: 'bg-purple-50 text-purple-700 border-purple-200' },
  abrechnung: { label: 'Abrechnung',      farbe: 'bg-amber-50 text-amber-700 border-amber-200' },
  planung:    { label: 'Jahresplanung',   farbe: 'bg-red-50 text-red-700 border-red-200' },
}
const STATUS_CFG: Record<FPStatus, { label: string; farbe: string }> = {
  aktiv: { label: 'Aktiv', farbe: 'text-teal-600' }, faellig: { label: 'Fällig', farbe: 'text-red-500' },
  geplant: { label: 'Geplant', farbe: 'text-blue-400' }, abgeschlossen: { label: 'Abgeschl.', farbe: 'text-gray-400' },
  handlungsbedarf: { label: 'Handlungsbedarf', farbe: 'text-orange-500' },
}

const EINTRAEGE: FPEintrag[] = [
  { id: 'fp1', typ: 'budget', titel: 'Kita-Jahresbudget 2026', datum: 'Trägerzuweisung', verantwortlich: 'Träger + Kita-Ltg.', status: 'aktiv',
    punkte: ['Jahresbudget 2026: 94.200€ (Trägerzuweisung inkl. 4% Steigerung vs. Vorjahr)',
      'Verbrauch Stand Apr: 58.700€ (62,3%) — Restbudget 35.500€', 'Haushaltsjahr: Jan–Dez (Träger-Buchungssystem, monatl. Abgleich)',
      'Notfall-Reserve: 5.000€ gesperrt (Träger-Vorgabe, nur mit Genehmigung abrufbar)', 'Budget-Report: monatl. Träger-Controlling (Kita-Ltg. erhält Ausdruck bis 10.)'] },
  { id: 'fp2', typ: 'sachkosten', titel: 'Sachkosten & laufende Ausgaben', datum: 'Größte Posten', verantwortlich: 'Kita-Ltg. + Träger', status: 'aktiv',
    punkte: ['Verbrauchsmaterial (Basteln, Hygiene, Büro): 8.400€/Jahr (Ø 700€/Mon.)',
      'Lebensmittel Mittagessen: 24.600€/Jahr (Caterer Vertrag bis Dez, Neuausschreibung!)', 'Spielmaterial + Außengelände: 6.200€ (Haushaltsposten, 3 FKs Anträge ausstehend)',
      'Fortbildung Personal: 3.800€ (anteilig Träger-Bildungsbudget + Eigenmittel)', 'Energie (Strom/Heizung): Träger-Direkt (kein Kita-Budget, separates Trägerkonto)'] },
  { id: 'fp3', typ: 'investition', titel: 'Investitionen & Anschaffungen', datum: 'Antrag bis Jun', verantwortlich: 'Kita-Ltg. + Träger', status: 'geplant',
    punkte: ['Investitionsantrag SJ 2026/27: bis 30.06.2026 (Träger-Formular, Prioritätenliste)',
      'Geplant: 2 neue Hochbetten Krippe (1.800€) + Außenspielpodest Umbau (3.200€)', 'Digitalisierung: 1 Tablet-Wagen 6 iPads (2.400€, Beantragt bei Träger und KiTa-NRW)',
      'Kühlschrank-Ersatz Küche: dringend! (Schäden sichtbar, Kosten ca. 800€, Eilantrag)', 'Prioritätenliste: von Kita-Ltg. + Team bis 15.06. erstellen (Trägerversammlung Jun)'] },
  { id: 'fp4', typ: 'foerderung', titel: 'Fördermittel & Drittmittel', datum: 'SJ: 8.600€', verantwortlich: 'Träger + Kita-Ltg.', status: 'aktiv',
    punkte: ['Drittmittel gesamt: 8.600€ (Sprachförderung 4.200€, Inklusion LVR 2.800€, Sonstiges 1.600€)',
      'Sprachförderpauschale: 4.200€ (Rucksack-Programm, Antrag Träger — bewilligt lfd.)', 'KiTa-NRW Qualitätsprogramm: 2.800€ (Qualitätsentwicklung, Träger-Abrechnung Dez)',
      'Aktion Mensch-Kleinprojekt: 1.600€ (Inklusion Spielmaterial, bis Okt abrechnen)', 'Neuer Antrag: Digitalisierungsmittel NRW (Träger stellt Aug 2026, Kita-Ltg. liefert Bedarf)'] },
  { id: 'fp5', typ: 'planung', titel: 'Jahresabschluss & Planung 2027', datum: 'Planung ab Sep', verantwortlich: 'Träger-Buchhaltung', status: 'geplant',
    punkte: ['Jahresabschluss 2025: abgeschlossen (Steuerberater Apr 2026, Überschuss 2.400€)',
      'Haushaltsplanung 2027: Träger erarbeitet Sep–Nov (Kita-Ltg. liefert Bedarfsliste Okt)', 'Rücklagen Träger für Kita: 15.000€ (Satzung, Liquiditätsreserve — ausreichend)',
      'Wirtschaftlichkeitsbericht: jährl. Mitgliederversammlung (Träger e.V., Jun 2026)', 'Kassenführung Kita: Handkasse 200€ (Auslagen, Einzelbelege, monatl. Abrechnung Träger)'] },
]

export default function FinanzplanungPage() {
  const [expanded, setExpanded] = useState<string | null>('fp1')
  const [kiText, setKiText] = useState('')
  const [kiLaedt, setKiLaedt] = useState(false)
  function kiAnfordern() { setKiLaedt(true); setTimeout(() => { setKiText(`${EINTRAEGE.length} Bereiche. Budget 62% verbraucht, 35.500€ frei. Kühlschrank-Eilantrag! Investitionsantrag bis 30.06. Caterer-Neuausschreibung.`); setKiLaedt(false) }, 950) }
  return (
    <div className="space-y-5 pb-24" style={{ color: 'var(--color-text)' }}>
      <div><h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}><Wallet className="w-6 h-6" style={{ color: 'var(--color-primary)' }} /> Finanzplanung</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Budget · Sachkosten · Investitionen · Fördermittel · Jahresplanung</p></div>
      <div className="grid grid-cols-3 gap-2">
        {[{ label: 'Bereiche', val: EINTRAEGE.length, color: 'var(--color-primary)' }, { label: 'Budget €', val: '94.2K', color: '#0d9488' }, { label: 'Restbud. €', val: '35.5K', color: '#f97316' }].map(k => (
          <div key={k.label} className="rounded-2xl p-2.5 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-lg font-bold" style={{ color: k.color }}>{k.val}</p><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p></div>))}
      </div>
      <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: '#f97316' }} />
        <p className="text-[10px] font-semibold" style={{ color: '#c2410c' }}>Kühlschrank Eilantrag! — Investitionsantrag bis 30.06. — Caterer-Neuausschreibung Dez</p></div>
      {kiText ? (<div className="rounded-2xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}><p className="text-[9px] font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-2.5 h-2.5" /> KI-Finanzübersicht</p><p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{kiText}</p></div>
      ) : (<button onClick={kiAnfordern} disabled={kiLaedt} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--color-primary)' }}><Sparkles className="w-3.5 h-3.5" />{kiLaedt ? 'KI analysiert...' : 'KI-Finanzübersicht'}</button>)}
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
