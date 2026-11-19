'use client';

import { useState } from 'react';
import {
  Heart, Users, FileText, ChevronDown, ChevronUp, Info,
  Brain, Eye, Ear, Activity, Globe, Shield, Download,
  CheckCircle2, AlertCircle, Clock, Plus, BarChart2
} from 'lucide-react';

/**
 * Inklusion & Teilhabe — kids.mindry.de
 * Rechtliche Grundlagen: BTHG (Bundesteilhabegesetz), DaZ (Deutsch als Zweitsprache),
 * ICF-CY (Internationale Klassifikation), UN-BRK, §22a SGB VIII
 */

// ── Types ───────────────────────────────────────────────────────────────────

type BedurfnisBereich =
  | 'Körperfunktionen'
  | 'Aktivitäten & Teilhabe'
  | 'Umweltfaktoren'
  | 'DaZ'
  | 'Sozial-emotional';

type FoerderStatus = 'aktiv' | 'planung' | 'abgeschlossen' | 'evaluation';

interface ICFMassnahme {
  id: string;
  bereich: BedurfnisBereich;
  ziel: string;
  massnahme: string;
  zustaendig: string;
  frist: string;
  status: FoerderStatus;
}

interface InklusionsKind {
  id: string;
  name: string;
  alter: string;
  gruppe: string;
  bedarf: BedurfnisBereich[];
  dazStufe?: 1 | 2 | 3 | 4 | 5; // DaZ-Spracherwerbsstufe
  bthgStatus?: 'beantragt' | 'bewilligt' | 'laufend';
  massnahmen: ICFMassnahme[];
  letzteAktualisierung: string;
}

// ── Demo-Daten ───────────────────────────────────────────────────────────────

const KINDER: InklusionsKind[] = [
  {
    id: 'k1',
    name: 'Kerim A.',
    alter: '4;8',
    gruppe: 'Sternschnuppen',
    bedarf: ['DaZ', 'Sprache' as never, 'Aktivitäten & Teilhabe'],
    dazStufe: 2,
    massnahmen: [
      {
        id: 'm1', bereich: 'DaZ',
        ziel: 'Grundwortschatz Deutsch (200 Wörter) bis zum Jahresende',
        massnahme: 'Tägliche DaZ-Förderstunde + Bildkarten-Routine beim Morgenkreis',
        zustaendig: 'Lisa M. (Kita-Leitung)', frist: '2025-07-31', status: 'aktiv',
      },
      {
        id: 'm2', bereich: 'Aktivitäten & Teilhabe',
        ziel: 'Aktive Beteiligung an Gruppenaktivitäten',
        massnahme: 'Peer-Tandem mit deutschsprachigem Kind, visuelle Tagesstruktur',
        zustaendig: 'Jana K. (Erzieherin)', frist: '2025-06-30', status: 'aktiv',
      },
    ],
    letzteAktualisierung: '2025-04-10',
  },
  {
    id: 'k2',
    name: 'Mia S.',
    alter: '5;2',
    gruppe: 'Regenbogen',
    bedarf: ['Körperfunktionen', 'Aktivitäten & Teilhabe'],
    bthgStatus: 'bewilligt',
    massnahmen: [
      {
        id: 'm3', bereich: 'Körperfunktionen',
        ziel: 'Verbesserung der Feinmotorik (Stift halten, Schere)',
        massnahme: 'Ergotherapie 2×/Woche + Feinmotorik-Stationen in der Gruppe',
        zustaendig: 'Praxis Müller (extern) + Tim B.', frist: '2025-09-30', status: 'aktiv',
      },
      {
        id: 'm4', bereich: 'Aktivitäten & Teilhabe',
        ziel: 'Selbstständige Nutzung der Sanitäranlagen',
        massnahme: 'Bildschritt-Anleitung + ggf. Pflegehilfsmittel nach §78 SGB IX',
        zustaendig: 'Tim B. (Integrationskraft)', frist: '2025-05-31', status: 'evaluation',
      },
    ],
    letzteAktualisierung: '2025-04-15',
  },
  {
    id: 'k3',
    name: 'Leon F.',
    alter: '3;11',
    gruppe: 'Sonnenkinder',
    bedarf: ['Sozial-emotional', 'Aktivitäten & Teilhabe'],
    massnahmen: [
      {
        id: 'm5', bereich: 'Sozial-emotional',
        ziel: 'Regulationsstrategien bei Überforderung kennen und nutzen',
        massnahme: 'Ruhezone einrichten, Ampel-System, Kitapsych-Konsultation',
        zustaendig: 'Anna R. (Gruppenleitung)', frist: '2025-06-15', status: 'planung',
      },
    ],
    letzteAktualisierung: '2025-04-18',
  },
];

// ── Rechtliche Grundlagen ────────────────────────────────────────────────────

interface RechtsGrundlage {
  id: string;
  titel: string;
  kurz: string;
  beschreibung: string;
  color: string;
}

const RECHTLICHE_GRUNDLAGEN: RechtsGrundlage[] = [
  {
    id: 'bthg',
    titel: 'BTHG',
    kurz: 'Bundesteilhabegesetz (2017, §§ Reform SGB IX)',
    beschreibung: 'Stärkt die Selbstbestimmung von Menschen mit Behinderung. Frühförderung als Komplexleistung (§§ 79–84 SGB IX). Eingliederungshilfe wird aus der Sozialhilfe herausgelöst.',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'icf',
    titel: 'ICF-CY',
    kurz: 'Internationale Klassifikation der Funktionsfähigkeit (Kinder & Jugendliche)',
    beschreibung: 'WHO-Klassifikationssystem für Gesundheitszustände. Biopsychosoziales Modell: Körperfunktionen, Aktivitäten, Teilhabe, Kontextfaktoren. Basis für Förderplanung.',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'daz',
    titel: 'DaZ',
    kurz: 'Deutsch als Zweitsprache — Spracherwerbsstufen 1–5',
    beschreibung: 'Strukturierter Sprachförderansatz für Kinder mit Migrationshintergrund. Stufe 1: Kein Deutsch. Stufe 5: Altersgemäße Kompetenz. Erfassung via SELDAK/SISMIK.',
    color: 'bg-green-100 text-green-800',
  },
  {
    id: 'unbrk',
    titel: 'UN-BRK',
    kurz: 'UN-Behindertenrechtskonvention (in Deutschland seit 2009)',
    beschreibung: 'Art. 24: Recht auf inklusive Bildung ohne Ausgrenzung. Art. 7: Besonderer Schutz für Kinder mit Behinderung. Verpflichtung zur "angemessenen Vorkehrung".',
    color: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'sgb8',
    titel: '§22a SGB VIII',
    kurz: 'Kinder- und Jugendhilfe — Förderungsauftrag',
    beschreibung: 'Kindertageseinrichtungen fördern alle Kinder unabhängig von Behinderung, Herkunft, Sprache. Kooperation mit Frühförderstellen, Gesundheitsämtern, Jugendamt verpflichtend.',
    color: 'bg-rose-100 text-rose-800',
  },
  {
    id: 'frühfoerd',
    titel: 'FrühV',
    kurz: 'Frühförderungsverordnung (2003/2019)',
    beschreibung: 'Regelt heilpädagogische Frühförderung und Sozialpädiatrische Zentren (SPZ). Komplexleistung aus medizinisch-therapeutischen und heilpädagogischen Maßnahmen.',
    color: 'bg-teal-100 text-teal-800',
  },
];

// ── DaZ-Stufen ───────────────────────────────────────────────────────────────

const DAZ_STUFEN = [
  { stufe: 1, label: 'Kein Deutsch', beschreibung: 'Vorsprachliche Kommunikation, nonverbal', color: 'bg-red-100 text-red-700' },
  { stufe: 2, label: 'Grundkenntnisse', beschreibung: 'Einzelwörter, Alltagsformeln, passives Verstehen', color: 'bg-orange-100 text-orange-700' },
  { stufe: 3, label: 'Elementar', beschreibung: 'Einfache Sätze, bekannte Themen', color: 'bg-yellow-100 text-yellow-700' },
  { stufe: 4, label: 'Aufbau', beschreibung: 'Selbstständige Kommunikation, eingeschränkter Wortschatz', color: 'bg-blue-100 text-blue-700' },
  { stufe: 5, label: 'Altersgemäß', beschreibung: 'Altersgemäße Kompetenz in allen Bereichen', color: 'bg-green-100 text-green-700' },
];

// ── Status-Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<FoerderStatus, { label: string; color: string }> = {
  aktiv:        { label: 'Aktiv',        color: 'text-green-700 bg-green-50 border-green-200' },
  planung:      { label: 'Planung',      color: 'text-blue-700 bg-blue-50 border-blue-200' },
  evaluation:   { label: 'Evaluation',  color: 'text-amber-700 bg-amber-50 border-amber-200' },
  abgeschlossen:{ label: 'Abgeschlossen',color: 'text-gray-600 bg-gray-50 border-gray-200' },
};

const BEREICH_ICON: Record<BedurfnisBereich, React.ComponentType<{ className?: string; size?: number }>> = {
  'Körperfunktionen': Activity,
  'Aktivitäten & Teilhabe': Users,
  'Umweltfaktoren': Globe,
  'DaZ': Globe,
  'Sozial-emotional': Heart,
};

// ── Component ────────────────────────────────────────────────────────────────

export default function InklusionPage() {
  const [selectedKind, setSelectedKind] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'kinder' | 'rechtlich' | 'daz' | 'statistik'>('kinder');
  const [expandedGrundlage, setExpandedGrundlage] = useState<string | null>(null);

  const selectedKindData = KINDER.find(k => k.id === selectedKind);

  const stats = {
    gesamt: KINDER.length,
    mitBTHG: KINDER.filter(k => k.bthgStatus).length,
    mitDaZ: KINDER.filter(k => k.dazStufe !== undefined).length,
    aktiveM: KINDER.flatMap(k => k.massnahmen).filter(m => m.status === 'aktiv').length,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Inklusion & Teilhabe</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            BTHG · ICF-CY · DaZ · UN-BRK · §22a SGB VIII — Individuelle Förderplanung
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border p-4 flex gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Inklusive Förderplanung nach dem biopsychosozialen Modell der <strong style={{ color: 'var(--color-text)' }}>ICF-CY</strong> (WHO).
          BTHG-konforme Dokumentation der Eingliederungshilfe. DaZ-Stufen 1–5 für Kinder mit Migrationshintergrund.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Kinder gesamt', value: stats.gesamt, icon: Users, color: 'text-indigo-600' },
          { label: 'Mit BTHG-Leistung', value: stats.mitBTHG, icon: Shield, color: 'text-blue-600' },
          { label: 'DaZ-Förderung', value: stats.mitDaZ, icon: Globe, color: 'text-green-600' },
          { label: 'Aktive Maßnahmen', value: stats.aktiveM, icon: Activity, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-3 text-center" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        {(['kinder', 'rechtlich', 'daz', 'statistik'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-indigo-600 text-white' : ''}`}
            style={activeTab !== tab ? { color: 'var(--color-text-muted)' } : {}}
          >
            {tab === 'kinder' ? 'Kinder' : tab === 'rechtlich' ? 'Rechtlich' : tab === 'daz' ? 'DaZ' : 'Statistik'}
          </button>
        ))}
      </div>

      {/* Tab: Kinder */}
      {activeTab === 'kinder' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Förderkinder</h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium">
              <Plus className="w-3.5 h-3.5" /> Kind hinzufügen
            </button>
          </div>
          {KINDER.map(kind => (
            <div
              key={kind.id}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <button
                onClick={() => setSelectedKind(selectedKind === kind.id ? null : kind.id)}
                className="w-full flex items-start gap-4 p-4 text-left"
                style={{ background: 'var(--color-surface)' }}
              >
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                  {kind.name.split(' ')[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{kind.name}</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{kind.alter} J. · {kind.gruppe}</span>
                    {kind.bthgStatus && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        BTHG {kind.bthgStatus}
                      </span>
                    )}
                    {kind.dazStufe && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DAZ_STUFEN[kind.dazStufe - 1].color}`}>
                        DaZ Stufe {kind.dazStufe}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {kind.bedarf.map(b => (
                      <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{kind.massnahmen.length} Maßnahmen</span>
                  {selectedKind === kind.id
                    ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
              </button>

              {selectedKind === kind.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', background: 'var(--color-bg)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>Fördermaßnahmen (ICF-CY)</span>
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Aktualisiert: {kind.letzteAktualisierung}
                    </span>
                  </div>
                  {kind.massnahmen.map(m => (
                    <div key={m.id} className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">{m.bereich}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[m.status].color}`}>
                              {STATUS_CONFIG[m.status].label}
                            </span>
                          </div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>🎯 {m.ziel}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>📋 {m.massnahme}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span>👤 {m.zustaendig}</span>
                        <span>📅 Frist: {m.frist}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                      <Plus className="w-3 h-3" /> Maßnahme
                    </button>
                    <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                      <Download className="w-3 h-3" /> Förderplan PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Rechtlich */}
      {activeTab === 'rechtlich' && (
        <div className="space-y-2">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Maßgebliche Rechtsgrundlagen für inklusive Förderung in Kindertageseinrichtungen.
          </p>
          {RECHTLICHE_GRUNDLAGEN.map(g => (
            <div key={g.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setExpandedGrundlage(expandedGrundlage === g.id ? null : g.id)}
                className="w-full flex items-center justify-between p-4"
                style={{ background: 'var(--color-surface)' }}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${g.color}`}>{g.titel}</span>
                  <span className="text-sm text-left" style={{ color: 'var(--color-text)' }}>{g.kurz}</span>
                </div>
                {expandedGrundlage === g.id
                  ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />}
              </button>
              {expandedGrundlage === g.id && (
                <div className="px-4 pb-4" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', background: 'var(--color-bg)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{g.beschreibung}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: DaZ */}
      {activeTab === 'daz' && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>DaZ-Spracherwerbsstufen (1–5)</h3>
            <div className="space-y-2">
              {DAZ_STUFEN.map(s => (
                <div key={s.stufe} className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${s.color}`}>Stufe {s.stufe}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{s.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{s.beschreibung}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>DaZ-Kinder in der Einrichtung</h3>
            {KINDER.filter(k => k.dazStufe !== undefined).map(kind => (
              <div key={kind.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{kind.name}</span>
                  <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>{kind.gruppe}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${DAZ_STUFEN[(kind.dazStufe ?? 1) - 1].color}`}>
                  Stufe {kind.dazStufe}
                </span>
              </div>
            ))}
            {KINDER.filter(k => k.dazStufe !== undefined).length === 0 && (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Keine DaZ-Kinder erfasst.</p>
            )}
          </div>

          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>Rechtliche Grundlage DaZ</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Sprachförderung für Kinder mit Migrationshintergrund ist in den Bildungsplänen aller 16 Bundesländer verankert.
              Die SELDAK/SISMIK-Bögen sind speziell für DaZ-Kinder konzipiert. Förderangebote werden über Landesmittel
              (z. B. "Sprachkitas" BMFSFJ) oder kommunale Programme finanziert.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Statistik */}
      {activeTab === 'statistik' && (
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Bedarfsübersicht</span>
            </div>
            {(['Körperfunktionen', 'Aktivitäten & Teilhabe', 'DaZ', 'Sozial-emotional', 'Umweltfaktoren'] as BedurfnisBereich[]).map(bereich => {
              const count = KINDER.filter(k => k.bedarf.includes(bereich)).length;
              const pct = Math.round((count / KINDER.length) * 100);
              return (
                <div key={bereich} className="flex items-center gap-3 mb-2">
                  <span className="text-xs w-36 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{bereich}</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right text-indigo-600">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Maßnahmenstatus</span>
            </div>
            {(['aktiv', 'planung', 'evaluation', 'abgeschlossen'] as FoerderStatus[]).map(status => {
              const count = KINDER.flatMap(k => k.massnahmen).filter(m => m.status === status).length;
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{count}</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium">
              <Download className="w-4 h-4" /> Inklusionsbericht exportieren
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
