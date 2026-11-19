'use client';

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, FileText, Bell, Users, Calendar, Info, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface MeldepflichtigeKrankheit {
  name: string;
  paragraph: string;
  inkubation: string;
  ausschluss: string;
  massnahme: string;
  meldepflichtig: boolean;
}

const KRANKHEITEN: MeldepflichtigeKrankheit[] = [
  { name: 'Masern',            paragraph: '§ 34 Abs. 1 IfSG', inkubation: '8–14 Tage',  ausschluss: 'Bis 5 Tage nach Ausbruch des Ausschlags',           massnahme: 'Sofortige Meldung Gesundheitsamt; Ausschluss nicht geimpfter Kontaktpersonen', meldepflichtig: true },
  { name: 'Scharlach',         paragraph: '§ 34 Abs. 1 IfSG', inkubation: '2–4 Tage',   ausschluss: 'Bis 24h nach Beginn der Antibiotikabehandlung',      massnahme: 'Wiederaufnahme nach ärztlicher Unbedenklichkeitsbescheinigung', meldepflichtig: false },
  { name: 'Norovirus',         paragraph: '§ 34 Abs. 1 IfSG', inkubation: '6–50 Std.',  ausschluss: 'Bis 48h nach letztem Erbrechen/Durchfall',          massnahme: 'Hygienemaßnahmen; Info an Eltern; ggf. Sammelunterricht',  meldepflichtig: true },
  { name: 'COVID-19',          paragraph: '§ 34 Abs. 1 IfSG', inkubation: '1–14 Tage',  ausschluss: 'Gemäß aktueller RKI-Empfehlung',                    massnahme: 'Info an Gesundheitsamt; aktuelles RKI-Merkblatt beachten', meldepflichtig: true },
  { name: 'Keuchhusten',       paragraph: '§ 34 Abs. 1 IfSG', inkubation: '7–20 Tage',  ausschluss: 'Bis 5 Tage nach Beginn der Antibiotikatherapie',     massnahme: 'Meldung; Absonderung nicht geimpfter Kontaktpersonen', meldepflichtig: true },
  { name: 'Windpocken',        paragraph: '§ 34 Abs. 1 IfSG', inkubation: '10–21 Tage', ausschluss: 'Bis alle Bläschen verkrustet sind (ca. 7 Tage)',     massnahme: 'Info an Eltern; Schwangere und Immunsupprimierte schützen', meldepflichtig: false },
  { name: 'Läuse (Pediculosis)',paragraph: '§ 34 Abs. 1 IfSG', inkubation: 'Direktkontakt', ausschluss: 'Bis nach erster Behandlung; befallsfrei',         massnahme: 'Elterninfo; Klasse kontrollieren; keine Meldepflicht ans GA', meldepflichtig: false },
  { name: 'Salmonellen',       paragraph: '§ 34 Abs. 1 IfSG', inkubation: '6–72 Std.',  ausschluss: 'Bis 3 aufeinanderfolgende neg. Stuhlproben (Kinder <6)', massnahme: 'Sofortige Meldung Gesundheitsamt; strenge Hygiene', meldepflichtig: true },
];

interface Vorfall {
  id: string;
  datum: string;
  kind: string;
  gruppe: string;
  krankheit: string;
  status: 'aktiv' | 'abgeschlossen' | 'gemeldet';
}

const VORFAELLE: Vorfall[] = [
  { id: '1', datum: '22.04.2026', kind: 'Leonie M.', gruppe: 'Sonnenkinder', krankheit: 'Scharlach', status: 'abgeschlossen' },
  { id: '2', datum: '24.04.2026', kind: 'Noah K.',   gruppe: 'Sternschnuppen', krankheit: 'Norovirus', status: 'aktiv' },
  { id: '3', datum: '18.04.2026', kind: 'Emma S.',   gruppe: 'Regenbogen',    krankheit: 'Windpocken', status: 'gemeldet' },
];

const STATUS_CFG = {
  aktiv:          { label: 'Aktiv',         color: 'bg-red-100 text-red-700' },
  abgeschlossen:  { label: 'Abgeschlossen', color: 'bg-green-100 text-green-700' },
  gemeldet:       { label: 'Gemeldet',      color: 'bg-blue-100 text-blue-700' },
};

export default function IfsgPage() {
  const [tab, setTab] = useState<'uebersicht' | 'vorfaelle' | 'belehrung'>('uebersicht');
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Infektionsschutz (IfSG §34)</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Meldepflichtige Erkrankungen, Ausschlussfristen und Gesundheitsamt-Meldungen
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border-l-4 border-red-500 p-4 flex gap-3" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>§ 34 Abs. 5 IfSG — Belehrungspflicht</p>
          <p>Beim erstmaligen Besuch einer Gemeinschaftseinrichtung müssen Eltern eine schriftliche Belehrung erhalten und bestätigen. Mitarbeitende erhalten die Belehrung nach § 35 IfSG vor Aufnahme der Tätigkeit.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <AlertTriangle className="w-4 h-4" />, label: 'Aktive Fälle', value: VORFAELLE.filter(v => v.status === 'aktiv').length, color: 'text-red-600' },
          { icon: <Bell className="w-4 h-4" />, label: 'Meldungen (April)', value: VORFAELLE.filter(v => v.status === 'gemeldet').length, color: 'text-blue-600' },
          { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Belehrungen vollständig', value: '47 / 48', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4 flex items-center gap-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className={s.color}>{s.icon}</div>
            <div>
              <p className={`text-xl font-bold leading-tight ${s.color}`}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', width: 'fit-content' }}>
        {(['uebersicht', 'vorfaelle', 'belehrung'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-red-600 text-white' : ''}`}
            style={tab !== t ? { color: 'var(--color-text-muted)' } : {}}>
            {{ uebersicht: 'Krankheiten §34', vorfaelle: 'Vorfälle', belehrung: 'Belehrungen' }[t]}
          </button>
        ))}
      </div>

      {/* Übersicht Tab */}
      {tab === 'uebersicht' && (
        <div className="space-y-2">
          {KRANKHEITEN.map(k => (
            <div key={k.name} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setExpanded(expanded === k.name ? null : k.name)}
                className="w-full flex items-center justify-between p-4 text-left"
                style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-3">
                  {k.meldepflichtig
                    ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    : <Info className="w-4 h-4 text-blue-500 shrink-0" />}
                  <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{k.name}</span>
                  {k.meldepflichtig && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Meldepflichtig</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs hidden md:block" style={{ color: 'var(--color-text-muted)' }}>{k.paragraph}</span>
                  {expanded === k.name ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
              </button>
              {expanded === k.name && (
                <div className="px-4 pb-4 pt-2 space-y-2 border-t text-sm" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>INKUBATIONSZEIT</p>
                      <p style={{ color: 'var(--color-text)' }}>{k.inkubation}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>AUSSCHLUSSFRIST</p>
                      <p style={{ color: 'var(--color-text)' }}>{k.ausschluss}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text-muted)' }}>MASSNAHMEN</p>
                    <p style={{ color: 'var(--color-text)' }}>{k.massnahme}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
              <Download className="w-4 h-4" /> RKI-Merkblätter herunterladen
            </button>
          </div>
        </div>
      )}

      {/* Vorfälle Tab */}
      {tab === 'vorfaelle' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{VORFAELLE.length} erfasste Fälle</p>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">
              <AlertTriangle className="w-4 h-4" /> Vorfall melden
            </button>
          </div>
          {VORFAELLE.map(v => (
            <div key={v.id} className="rounded-xl border p-4 flex items-center gap-4 flex-wrap" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div className="flex-1 min-w-[150px]">
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{v.kind}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{v.gruppe} · {v.datum}</p>
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{v.krankheit}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CFG[v.status].color}`}>
                {STATUS_CFG[v.status].label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Belehrung Tab */}
      {tab === 'belehrung' && (
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FileText className="w-4 h-4 text-blue-600" /> Eltern-Belehrung § 34 Abs. 5 IfSG
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              47 von 48 Familien haben die Belehrung unterschrieben. 1 ausstehend: Familie Öztürk (Noah, Sternschnuppen — erhalten 21.04.2026, Rücklauf ausstehend).
            </p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              <Download className="w-4 h-4" /> Vorlage herunterladen (PDF)
            </button>
          </div>
          <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Users className="w-4 h-4 text-blue-600" /> Mitarbeiter-Belehrung § 35 IfSG
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Alle 6 Fachkräfte haben die Belehrung erhalten und bestätigt. Nächste jährliche Wiederholung: November 2026.
            </p>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              <Calendar className="w-4 h-4" /> Erinnerung setzen
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
