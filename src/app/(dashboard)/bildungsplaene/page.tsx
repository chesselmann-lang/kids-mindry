'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Globe, Check, Info, Download, Filter } from 'lucide-react';

/**
 * Bildungspläne der 16 Bundesländer — kids.mindry.de
 * Vollständige Übersicht der verbindlichen Bildungspläne für
 * Kindertageseinrichtungen in allen deutschen Bundesländern (Stand: 2024)
 */

type Bereich =
  | 'Sprache & Kommunikation'
  | 'Mathematik & Naturwissenschaft'
  | 'Bewegung & Gesundheit'
  | 'Soziales & Emotionales'
  | 'Kunst, Kultur & Kreativität'
  | 'Natur & Umwelt'
  | 'Medien & Digitales'
  | 'Religiöse & ethische Erziehung';

type Region = 'Ost' | 'West' | 'Nord' | 'Süd' | 'Stadtstaaten';

interface BildungsplanItem {
  bereich: Bereich;
  beschreibung: string;
  ziele: string[];
}

interface Bundesland {
  id: string;
  name: string;
  kuerzel: string;
  planName: string;
  erscheinungsjahr: number;
  letzteAktualisierung: string;
  region: Region;
  altersspanne: string;
  verpflichtend: boolean;
  bereiche: BildungsplanItem[];
  besonderheiten: string;
  farbe: string;
  url: string;
}

// ── Daten ─────────────────────────────────────────────────────────────────────

const BUNDESLAENDER: Bundesland[] = [
  {
    id: 'bw',
    name: 'Baden-Württemberg',
    kuerzel: 'BW',
    planName: 'Orientierungsplan für Bildung und Erziehung',
    erscheinungsjahr: 2011,
    letzteAktualisierung: '2022',
    region: 'Süd',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Ko-Konstruktivistischer Ansatz; Bildungs- & Entwicklungsfelder',
    farbe: 'bg-yellow-100 text-yellow-800',
    url: 'https://km-bw.de',
    bereiche: [
      { bereich: 'Sprache & Kommunikation', beschreibung: 'Frühe Literacy und Mehrsprachigkeit', ziele: ['Sprachbewusstsein entwickeln', 'Gespräche führen', 'Interesse an Schriftsprache'] },
      { bereich: 'Mathematik & Naturwissenschaft', beschreibung: 'Entdeckendes Lernen in Alltagssituationen', ziele: ['Mengen erfassen', 'Muster erkennen', 'Naturphänomene erforschen'] },
      { bereich: 'Bewegung & Gesundheit', beschreibung: 'Ganzheitliche Körperwahrnehmung', ziele: ['Grob- und Feinmotorik stärken', 'Gesunde Ernährung', 'Körpergefühl entwickeln'] },
    ],
  },
  {
    id: 'by',
    name: 'Bayern',
    kuerzel: 'BY',
    planName: 'Bayerischer Bildungs- und Erziehungsplan (BEP)',
    erscheinungsjahr: 2003,
    letzteAktualisierung: '2021',
    region: 'Süd',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Basiskompetenzen des Kindes; Übergänge; Portfolio-Verpflichtung (Susi-Buch)',
    farbe: 'bg-blue-100 text-blue-800',
    url: 'https://www.stmas.bayern.de',
    bereiche: [
      { bereich: 'Sprache & Kommunikation', beschreibung: 'Sprachliche Bildung von Geburt an', ziele: ['Kommunikationsfreude', 'Sprachverständnis', 'Vorlesesituationen'] },
      { bereich: 'Mathematik & Naturwissenschaft', beschreibung: 'Mathematisch-naturwissenschaftliche Grundlagen', ziele: ['Zählen & Rechnen', 'Messen & Vergleichen', 'Forschen & Experimentieren'] },
      { bereich: 'Soziales & Emotionales', beschreibung: 'Werte und Basiskompetenzen', ziele: ['Empathiefähigkeit', 'Selbstregulation', 'Werteorientierung'] },
    ],
  },
  {
    id: 'be',
    name: 'Berlin',
    kuerzel: 'BE',
    planName: 'Berliner Bildungsprogramm (BBP)',
    erscheinungsjahr: 2004,
    letzteAktualisierung: '2023',
    region: 'Stadtstaaten',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Stärkt Rechte der Kinder; Inklusion prominent; Demokratiepädagogik',
    farbe: 'bg-red-100 text-red-800',
    url: 'https://www.berlin.de/sen/jugend',
    bereiche: [
      { bereich: 'Soziales & Emotionales', beschreibung: 'Kinderrechte und Demokratiepädagogik', ziele: ['Partizipation', 'Konfliktlösung', 'Gemeinschaftsgefühl'] },
      { bereich: 'Sprache & Kommunikation', beschreibung: 'Mehrsprachigkeit als Ressource', ziele: ['Erstsprache stärken', 'DaZ-Förderung', 'Schriftsprachbewusstsein'] },
      { bereich: 'Kunst, Kultur & Kreativität', beschreibung: 'Ästhetik und kulturelle Bildung', ziele: ['Ausdrucksformen erkunden', 'Kulturelle Vielfalt', 'Kreativität entfalten'] },
    ],
  },
  {
    id: 'bb',
    name: 'Brandenburg',
    kuerzel: 'BB',
    planName: 'Grundsätze elementarer Bildung in Einrichtungen der Kindertagesbetreuung',
    erscheinungsjahr: 2004,
    letzteAktualisierung: '2020',
    region: 'Ost',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Bildungsbereiche + Lernmethoden; Selbstbildung im Mittelpunkt',
    farbe: 'bg-orange-100 text-orange-800',
    url: 'https://www.mbjs.brandenburg.de',
    bereiche: [
      { bereich: 'Natur & Umwelt', beschreibung: 'Entdeckungsreisen in der Natur', ziele: ['Umweltbewusstsein', 'Nachhaltigkeit', 'Natursensorik'] },
      { bereich: 'Bewegung & Gesundheit', beschreibung: 'Bewegung als Lernform', ziele: ['Bewegungsräume', 'Psychomotorische Förderung', 'Gesundheitsbewusstsein'] },
    ],
  },
  {
    id: 'hb',
    name: 'Bremen',
    kuerzel: 'HB',
    planName: 'Rahmenplan für Bildung und Erziehung im Elementarbereich',
    erscheinungsjahr: 2004,
    letzteAktualisierung: '2019',
    region: 'Stadtstaaten',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Kinderrechte zentral; Demokratische Bildung; Ko-Konstruktion',
    farbe: 'bg-teal-100 text-teal-800',
    url: 'https://www.bildung.bremen.de',
    bereiche: [
      { bereich: 'Soziales & Emotionales', beschreibung: 'Demokratische Teilhabe von Anfang an', ziele: ['Partizipationsrechte', 'Mitgestaltung', 'Empowerment'] },
    ],
  },
  {
    id: 'hh',
    name: 'Hamburg',
    kuerzel: 'HH',
    planName: 'Hamburger Bildungsempfehlungen für die Bildung und Erziehung von Kindern',
    erscheinungsjahr: 2005,
    letzteAktualisierung: '2022',
    region: 'Stadtstaaten',
    altersspanne: '0–6 Jahre',
    verpflichtend: false,
    besonderheiten: 'Empfehlungscharakter; Bildungsbereiche + Querschnittsthemen; Transition',
    farbe: 'bg-red-100 text-red-700',
    url: 'https://www.hamburg.de/jugendamt',
    bereiche: [
      { bereich: 'Medien & Digitales', beschreibung: 'Medienkompetenz im Kita-Alltag', ziele: ['Digitale Werkzeuge', 'Medienkritik', 'Kreative Mediennutzung'] },
    ],
  },
  {
    id: 'he',
    name: 'Hessen',
    kuerzel: 'HE',
    planName: 'Hessischer Bildungs- und Erziehungsplan (HeBEP)',
    erscheinungsjahr: 2007,
    letzteAktualisierung: '2021',
    region: 'West',
    altersspanne: '0–10 Jahre',
    verpflichtend: true,
    besonderheiten: 'Erstmals 0–10 J. umfassend; Schulübergang zentral; Elternbildung',
    farbe: 'bg-red-100 text-red-800',
    url: 'https://soziales.hessen.de',
    bereiche: [
      { bereich: 'Sprache & Kommunikation', beschreibung: 'Durchgängige Sprachbildung 0–10', ziele: ['Mehrsprachigkeit', 'Literacy', 'Schulvorbereitung'] },
    ],
  },
  {
    id: 'mv',
    name: 'Mecklenburg-Vorpommern',
    kuerzel: 'MV',
    planName: 'Bildungskonzeption für 0- bis 10-jährige Kinder',
    erscheinungsjahr: 2004,
    letzteAktualisierung: '2018',
    region: 'Ost',
    altersspanne: '0–10 Jahre',
    verpflichtend: true,
    besonderheiten: 'Starke Naturorientierung; Regionalbezug Ostseeküste',
    farbe: 'bg-blue-100 text-blue-700',
    url: 'https://www.regierung-mv.de',
    bereiche: [
      { bereich: 'Natur & Umwelt', beschreibung: 'Naturpädagogik als Kernelement', ziele: ['Waldexkursionen', 'Meeresökologie', 'Nachhaltigkeit'] },
    ],
  },
  {
    id: 'ni',
    name: 'Niedersachsen',
    kuerzel: 'NI',
    planName: 'Orientierungsplan für Bildung und Erziehung (NiedOP)',
    erscheinungsjahr: 2005,
    letzteAktualisierung: '2022',
    region: 'Nord',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Niedersächsisches Beobachtungsverfahren NiKo; Übergangsmanagement',
    farbe: 'bg-yellow-100 text-yellow-700',
    url: 'https://www.mk.niedersachsen.de',
    bereiche: [
      { bereich: 'Mathematik & Naturwissenschaft', beschreibung: 'Mathematisches Denken und MINT-Förderung', ziele: ['Zählen & Messen', 'Geometrie entdecken', 'Experimente'] },
    ],
  },
  {
    id: 'nrw',
    name: 'Nordrhein-Westfalen',
    kuerzel: 'NRW',
    planName: 'Bildungsgrundsätze für Kinder von 0 bis 10 Jahren (BGS)',
    erscheinungsjahr: 2010,
    letzteAktualisierung: '2021',
    region: 'West',
    altersspanne: '0–10 Jahre',
    verpflichtend: true,
    besonderheiten: 'Bildungsbereiche + Übergangsmanagement; DOSiS-Beobachtungsbogen',
    farbe: 'bg-green-100 text-green-800',
    url: 'https://www.mfkjks.nrw.de',
    bereiche: [
      { bereich: 'Sprache & Kommunikation', beschreibung: 'Alltagsintegrierte Sprachförderung', ziele: ['Wortschatz', 'Erzählen', 'Zweitsprache'] },
      { bereich: 'Mathematik & Naturwissenschaft', beschreibung: 'MINT im Kita-Alltag', ziele: ['Zählen', 'Messen', 'Phänomene'] },
      { bereich: 'Bewegung & Gesundheit', beschreibung: 'Bewegung als Lerngrundlage', ziele: ['Grobmotorik', 'Ausdauer', 'Körperbewusstsein'] },
    ],
  },
  {
    id: 'rp',
    name: 'Rheinland-Pfalz',
    kuerzel: 'RP',
    planName: 'Bildungs- und Erziehungsempfehlungen für Kindertagesstätten (BEE)',
    erscheinungsjahr: 2004,
    letzteAktualisierung: '2020',
    region: 'West',
    altersspanne: '0–6 Jahre',
    verpflichtend: false,
    besonderheiten: 'Empfehlungscharakter; Kinder als Akteure; Portfolioarbeit',
    farbe: 'bg-orange-100 text-orange-700',
    url: 'https://kita.rlp.de',
    bereiche: [
      { bereich: 'Kunst, Kultur & Kreativität', beschreibung: 'Ästhetisches Lernen', ziele: ['Bildnerisches Gestalten', 'Musikalische Früherziehung', 'Theater'] },
    ],
  },
  {
    id: 'sl',
    name: 'Saarland',
    kuerzel: 'SL',
    planName: 'Bildungsprogramm für saarländische Kindertagesstätten',
    erscheinungsjahr: 2006,
    letzteAktualisierung: '2019',
    region: 'West',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Grenzregion Frankreich: Zweisprachigkeit als Chance; kulturelle Vielfalt',
    farbe: 'bg-blue-100 text-blue-800',
    url: 'https://www.saarland.de/soziales',
    bereiche: [
      { bereich: 'Sprache & Kommunikation', beschreibung: 'Deutsch-Französische Sprachförderung', ziele: ['Frühe Zweisprachigkeit', 'Kulturelle Brücken', 'Sprachbewusstsein'] },
    ],
  },
  {
    id: 'sn',
    name: 'Sachsen',
    kuerzel: 'SN',
    planName: 'Sächsischer Bildungsplan (SBP)',
    erscheinungsjahr: 2006,
    letzteAktualisierung: '2019',
    region: 'Ost',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Stärkt Partizipation; Sorbische Minderheit berücksichtigt; Sachkunde früh',
    farbe: 'bg-green-100 text-green-700',
    url: 'https://www.smk.sachsen.de',
    bereiche: [
      { bereich: 'Natur & Umwelt', beschreibung: 'Sachkunde als Bildungsbereich', ziele: ['Heimatkunde', 'Ökologie', 'Naturforschung'] },
    ],
  },
  {
    id: 'st',
    name: 'Sachsen-Anhalt',
    kuerzel: 'ST',
    planName: 'Bildungsprogramm für Kindertageseinrichtungen (BPKL)',
    erscheinungsjahr: 2004,
    letzteAktualisierung: '2018',
    region: 'Ost',
    altersspanne: '0–6 Jahre',
    verpflichtend: true,
    besonderheiten: 'Selbstbildungskonzept; Kooperation Kita-Schule stark verankert',
    farbe: 'bg-yellow-100 text-yellow-800',
    url: 'https://ms.sachsen-anhalt.de',
    bereiche: [
      { bereich: 'Mathematik & Naturwissenschaft', beschreibung: 'Naturwissenschaftliche Bildung früh', ziele: ['Forschen & Entdecken', 'Mathematisches Denken', 'Technikinteresse'] },
    ],
  },
  {
    id: 'sh',
    name: 'Schleswig-Holstein',
    kuerzel: 'SH',
    planName: 'Leitlinien zum Bildungsauftrag in Kindertageseinrichtungen',
    erscheinungsjahr: 2004,
    letzteAktualisierung: '2020',
    region: 'Nord',
    altersspanne: '0–6 Jahre',
    verpflichtend: false,
    besonderheiten: 'Dänische Minderheit; maritime Prägung; Norddeutsche Kooperation',
    farbe: 'bg-blue-100 text-blue-700',
    url: 'https://www.schleswig-holstein.de',
    bereiche: [
      { bereich: 'Natur & Umwelt', beschreibung: 'Nordsee und Ostsee als Lernort', ziele: ['Meeresökologie', 'Wattwanderungen', 'Nachhaltigkeit'] },
    ],
  },
  {
    id: 'th',
    name: 'Thüringen',
    kuerzel: 'TH',
    planName: 'Thüringer Bildungsplan bis 18 Jahre (TBP-18)',
    erscheinungsjahr: 2008,
    letzteAktualisierung: '2015',
    region: 'Ost',
    altersspanne: '0–18 Jahre',
    verpflichtend: true,
    besonderheiten: 'Einziger Bundesplan von 0–18 Jahren; Lebensweltorientierung; Partizipation',
    farbe: 'bg-red-100 text-red-800',
    url: 'https://bildung.thueringen.de',
    bereiche: [
      { bereich: 'Soziales & Emotionales', beschreibung: 'Lebenslanges Lernen und Partizipation', ziele: ['Demokratische Bildung', 'Selbstwirksamkeit', 'Verantwortung'] },
    ],
  },
];

const REGIONEN: Region[] = ['Nord', 'West', 'Süd', 'Ost', 'Stadtstaaten'];

const REGION_COLOR: Record<Region, string> = {
  Nord: 'bg-blue-100 text-blue-800',
  West: 'bg-green-100 text-green-800',
  Süd: 'bg-orange-100 text-orange-800',
  Ost: 'bg-yellow-100 text-yellow-800',
  Stadtstaaten: 'bg-purple-100 text-purple-800',
};

export default function BildungsplaenePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<Region | 'alle'>('alle');
  const [filterVerpflichtend, setFilterVerpflichtend] = useState<boolean | 'alle'>('alle');

  const filtered = BUNDESLAENDER.filter(bl => {
    if (filterRegion !== 'alle' && bl.region !== filterRegion) return false;
    if (filterVerpflichtend !== 'alle' && bl.verpflichtend !== filterVerpflichtend) return false;
    return true;
  });

  const verpflichtendCount = BUNDESLAENDER.filter(b => b.verpflichtend).length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Bildungspläne 16 Bundesländer</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Verbindliche Bildungsrahmen für Kindertageseinrichtungen in Deutschland (Stand: 2024)
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Alle Bundesländer haben eigene Bildungspläne für die Elementarpädagogik.
          <strong style={{ color: 'var(--color-text)' }}> {verpflichtendCount} von 16</strong> sind rechtlich verbindlich.
          Die Pläne definieren Bildungsbereiche, Beobachtungsaufgaben und Qualitätsstandards.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Bundesländer', value: '16', color: 'text-emerald-600' },
          { label: 'Verbindlich', value: String(verpflichtendCount), color: 'text-green-600' },
          { label: 'Empfehlungen', value: String(16 - verpflichtendCount), color: 'text-amber-600' },
          { label: 'Ø Aktualisierung', value: '2020', color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        <div className="flex gap-1">
          {(['alle', ...REGIONEN] as const).map(r => (
            <button
              key={r}
              onClick={() => setFilterRegion(r as Region | 'alle')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterRegion === r ? 'bg-emerald-600 text-white' : ''}`}
              style={filterRegion !== r ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)', border: '1px solid' } : {}}
            >
              {r === 'alle' ? 'Alle Regionen' : r}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-2">
          {([['alle', 'Alle'], [true, 'Verbindlich'], [false, 'Empfehlung']] as const).map(([val, label]) => (
            <button
              key={String(val)}
              onClick={() => setFilterVerpflichtend(val as boolean | 'alle')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterVerpflichtend === val ? 'bg-emerald-600 text-white' : ''}`}
              style={filterVerpflichtend !== val ? { borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)', border: '1px solid' } : {}}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{filtered.length} Bundesländer angezeigt</p>

      {/* Liste */}
      <div className="space-y-2">
        {filtered.map(bl => (
          <div key={bl.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setExpandedId(expandedId === bl.id ? null : bl.id)}
              className="w-full flex items-start gap-4 p-4 text-left"
              style={{ background: 'var(--color-surface)' }}
            >
              {/* Kürzel-Badge */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${bl.farbe}`}>
                {bl.kuerzel}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{bl.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${REGION_COLOR[bl.region]}`}>{bl.region}</span>
                  {bl.verpflichtend
                    ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Verbindlich</span>
                    : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Empfehlung</span>
                  }
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{bl.altersspanne}</span>
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{bl.planName}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Erschienen {bl.erscheinungsjahr} · Aktualisiert {bl.letzteAktualisierung}
                </p>
              </div>
              <div className="flex-shrink-0">
                {expandedId === bl.id
                  ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
              </div>
            </button>

            {expandedId === bl.id && (
              <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', background: 'var(--color-bg)' }}>

                {/* Besonderheiten */}
                <div className="rounded-lg p-3 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Besonderheiten</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{bl.besonderheiten}</p>
                </div>

                {/* Bildungsbereiche */}
                {bl.bereiche.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                      Bildungsbereiche ({bl.bereiche.length} detailliert)
                    </p>
                    <div className="space-y-2">
                      {bl.bereiche.map(b => (
                        <div key={b.bereich} className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)' }}>
                          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{b.bereich}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{b.beschreibung}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {b.ziele.map(z => (
                              <span key={z} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-2.5 h-2.5" />{z}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <Download className="w-3 h-3" /> PDF herunterladen
                  </button>
                  <a
                    href={bl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                  >
                    <Globe className="w-3 h-3" /> Ministerium
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
