'use client';

import { useState } from 'react';
import { Heart, Users, FileText, CheckCircle2, AlertCircle, BookOpen, Plus, Brain, Eye, Ear, Activity, Info } from 'lucide-react';

// ── Inklusion & Förderplanung — kids.mindry.de ─────────────────────────────────
// SGB VIII §22a, UN-Behindertenrechtskonvention, KitaG Inklusion

type FoerderStatus = 'aktiv' | 'planung' | 'abgeschlossen';
type Bereich = 'Sprache' | 'Motorik' | 'Sozial-emotional' | 'Kognition' | 'Wahrnehmung' | 'Selbstversorgung';

interface FoerderKind {
  id: number;
  name: string;
  alter: string;
  gruppe: string;
  bedarfe: Bereich[];
  massnahmen: string[];
  status: FoerderStatus;
  naechsteUeberpruefung: string;
  therapeuten: string[];
  eingliederungshilfe: boolean;
}

const KINDER: FoerderKind[] = [
  {
    id: 1,
    name: 'Max L.',
    alter: '4 J.',
    gruppe: 'Sonnenkäfer',
    bedarfe: ['Sprache', 'Sozial-emotional'],
    massnahmen: ['Logopädie 2x/Woche', 'Sprachfördergruppe intern', 'Elterngespräch monatlich'],
    status: 'aktiv',
    naechsteUeberpruefung: '2025-06-15',
    therapeuten: ['Logopädie-Praxis Müller'],
    eingliederungshilfe: true,
  },
  {
    id: 2,
    name: 'Lara P.',
    alter: '3 J.',
    gruppe: 'Marienkäfer',
    bedarfe: ['Motorik', 'Selbstversorgung'],
    massnahmen: ['Ergotherapie 1x/Woche', 'Feinmotorik-Förderung täglich'],
    status: 'aktiv',
    naechsteUeberpruefung: '2025-07-01',
    therapeuten: ['Ergotherapie Praxis Schneider'],
    eingliederungshilfe: false,
  },
  {
    id: 3,
    name: 'Noah S.',
    alter: '5 J.',
    gruppe: 'Schmetterlinge',
    bedarfe: ['Kognition', 'Wahrnehmung'],
    massnahmen: ['Frühförderstelle 2x/Monat', 'Differenzierte Aufgaben im Alltag'],
    status: 'planung',
    naechsteUeberpruefung: '2025-05-20',
    therapeuten: ['Frühförderstelle Stadt'],
    eingliederungshilfe: false,
  },
];

const BEREICH_ICONS: Record<Bereich, React.ReactNode> = {
  'Sprache':          <BookOpen className="w-3.5 h-3.5" />,
  'Motorik':          <Activity className="w-3.5 h-3.5" />,
  'Sozial-emotional': <Heart className="w-3.5 h-3.5" />,
  'Kognition':        <Brain className="w-3.5 h-3.5" />,
  'Wahrnehmung':      <Eye className="w-3.5 h-3.5" />,
  'Selbstversorgung': <Users className="w-3.5 h-3.5" />,
};

const STATUS_CONFIG: Record<FoerderStatus, { label: string; bg: string; text: string }> = {
  aktiv:         { label: 'Aktiv',         bg: 'bg-green-50',  text: 'text-green-700' },
  planung:       { label: 'In Planung',    bg: 'bg-yellow-50', text: 'text-yellow-700' },
  abgeschlossen: { label: 'Abgeschlossen', bg: 'bg-gray-100',  text: 'text-gray-600' },
};

const CHECKLISTE = [
  { item: 'Förderpläne für alle Inklusionskinder aktuell', done: true },
  { item: 'Eingliederungshilfe-Anträge eingereicht (§35a SGB VIII)', done: true },
  { item: 'Kooperationsvereinbarung mit Frühförderstelle', done: true },
  { item: 'UN-BRK-konforme Raumgestaltung dokumentiert', done: false },
  { item: 'Barrierefreier Zugang für alle Bereiche', done: true },
  { item: 'Teamfortbildung Inklusion (aktuelles Jahr)', done: false },
  { item: 'Individuelle Hilfepläne (§36 SGB VIII) vorhanden', done: true },
];

export default function InclusionPage() {
  const [kinder] = useState(KINDER);
  const [selected, setSelected] = useState<number | null>(null);

  const aktiv = kinder.filter(k => k.status === 'aktiv').length;
  const egh = kinder.filter(k => k.eingliederungshilfe).length;
  const done = CHECKLISTE.filter(c => c.done).length;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Heart className="w-6 h-6 text-pink-600" /> Inklusion & Förderplanung
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          SGB VIII §22a · UN-BRK · Individuelle Förderpläne
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Inklusionskinder', value: kinder.length, color: 'text-pink-600' },
          { label: 'Aktive Förderpläne', value: aktiv, color: 'text-green-600' },
          { label: 'Mit EGH-Antrag', value: egh, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4 text-center"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Children cards */}
      <div>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Inklusionskinder</h2>
        <div className="space-y-3">
          {kinder.map(kind => {
            const sc = STATUS_CONFIG[kind.status];
            const isOpen = selected === kind.id;
            return (
              <div key={kind.id} className="rounded-2xl border overflow-hidden"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <button className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setSelected(isOpen ? null : kind.id)}>
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{kind.name}</p>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{kind.alter} · {kind.gruppe}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {kind.bedarfe.map(b => (
                        <span key={b} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">
                          {BEREICH_ICONS[b]} {b}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="grid sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <p className="text-xs font-bold uppercase mb-2" style={{ color: 'var(--color-text-faint)' }}>Maßnahmen</p>
                        <ul className="space-y-1">
                          {kind.massnahmen.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                              <span style={{ color: 'var(--color-text)' }}>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-faint)' }}>Therapeuten</p>
                          {kind.therapeuten.map(t => (
                            <p key={t} className="text-sm" style={{ color: 'var(--color-text)' }}>{t}</p>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--color-text-faint)' }}>Nächste Überprüfung</p>
                          <p className="text-sm" style={{ color: 'var(--color-text)' }}>{kind.naechsteUeberpruefung}</p>
                        </div>
                        {kind.eingliederungshilfe && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            <FileText className="w-3 h-3" /> Eingliederungshilfe aktiv
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-xl bg-pink-600 text-white text-xs font-semibold">
                        Förderplan bearbeiten
                      </button>
                      <button className="px-3 py-1.5 rounded-xl border text-xs font-medium"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                        PDF exportieren
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Inklusions-Compliance</h2>
          <span className="text-sm font-bold text-green-600">{done}/{CHECKLISTE.length}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 mb-4">
          <div className="h-full rounded-full bg-pink-500 transition-all"
            style={{ width: `${(done / CHECKLISTE.length) * 100}%` }} />
        </div>
        <div className="space-y-2">
          {CHECKLISTE.map((c, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border p-3"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              {c.done
                ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                : <AlertCircle className="w-5 h-5 text-orange-400 shrink-0" />}
              <p className="text-sm" style={{ color: 'var(--color-text)' }}>{c.item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Legal */}
      <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 flex gap-3">
        <Info className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
        <p className="text-xs text-pink-800">
          <strong>§22a SGB VIII:</strong> Kindertageseinrichtungen sollen Kinder mit und ohne Behinderung gemeinsam fördern. Der Förderungsauftrag umfasst Erziehung, Bildung und Betreuung des Kindes und bezieht sich auf die soziale, emotionale, körperliche und geistige Entwicklung.
        </p>
      </div>
    </div>
  );
}
