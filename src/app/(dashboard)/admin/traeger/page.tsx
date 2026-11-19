'use client';

import { useState } from 'react';
import { Building2, Users, TrendingUp, Euro, Settings, Shield, MapPin, BarChart3, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';

// ── Träger-Dashboard — kids.mindry.de ─────────────────────────────────────────
// Multi-Standort-Verwaltung für Träger von Kindertageseinrichtungen

interface Einrichtung {
  id: string;
  name: string;
  ort: string;
  gruppen: number;
  kinder: number;
  kapazitaet: number;
  personal: number;
  auslastung: number;
  offeneAufgaben: number;
  status: 'aktiv' | 'warnung' | 'kritisch';
}

const EINRICHTUNGEN: Einrichtung[] = [
  { id: 'e1', name: 'Kita Sonnenschein', ort: 'Hamburg-Altona', gruppen: 4, kinder: 78, kapazitaet: 80, personal: 12, auslastung: 97.5, offeneAufgaben: 2, status: 'aktiv' },
  { id: 'e2', name: 'Kita Regenbogen', ort: 'Hamburg-Eimsbüttel', gruppen: 3, kinder: 55, kapazitaet: 60, personal: 9, auslastung: 91.7, offeneAufgaben: 0, status: 'aktiv' },
  { id: 'e3', name: 'Kita Waldwichtel', ort: 'Hamburg-Wandsbek', gruppen: 2, kinder: 28, kapazitaet: 30, personal: 5, auslastung: 93.3, offeneAufgaben: 5, status: 'warnung' },
  { id: 'e4', name: 'Kita Seestern', ort: 'Hamburg-Harburg', gruppen: 5, kinder: 94, kapazitaet: 100, personal: 15, auslastung: 94.0, offeneAufgaben: 1, status: 'aktiv' },
];

const KPI = [
  { label: 'Einrichtungen', value: '4', sub: 'aktiv', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Kinder gesamt', value: '255', sub: '+12 ggü. Vormonat', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Ø Auslastung', value: '94.1%', sub: 'Kapazität: 270', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
  { label: 'Personal gesamt', value: '41', sub: '3 Stellen offen', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const FINANZEN = [
  { label: 'Monatliche Förderung', value: '€ 38.250', delta: '+2.1%', positive: true },
  { label: 'Elternbeiträge (Plan)', value: '€ 12.750', delta: '98.3% erhoben', positive: true },
  { label: 'Personalkosten', value: '€ 41.800', delta: '+1.8%', positive: false },
  { label: 'Saldo', value: '€ 9.200', delta: '+€ 1.100', positive: true },
];

const AUFGABEN = [
  { text: 'Personalschlüssel Kita Waldwichtel prüfen', einrichtung: 'Waldwichtel', prio: 'hoch', faellig: '2025-04-28' },
  { text: 'Hygienebegehung Kita Sonnenschein', einrichtung: 'Sonnenschein', prio: 'mittel', faellig: '2025-05-05' },
  { text: 'Jahresbericht 2024 an Jugendamt einreichen', einrichtung: 'Alle', prio: 'hoch', faellig: '2025-04-30' },
  { text: 'AVV-Aktualisierung DSGVO 2025', einrichtung: 'Alle', prio: 'mittel', faellig: '2025-05-15' },
  { text: 'Fortbildungsplanung Q3 abschließen', einrichtung: 'Alle', prio: 'niedrig', faellig: '2025-06-01' },
  { text: 'Betriebserlaubnis Kita Seestern verlängern', einrichtung: 'Seestern', prio: 'hoch', faellig: '2025-05-31' },
];

const STATUS_MAP = {
  aktiv:    { dot: 'bg-green-500', text: 'text-green-600' },
  warnung:  { dot: 'bg-yellow-500', text: 'text-yellow-600' },
  kritisch: { dot: 'bg-red-500', text: 'text-red-600' },
};

const PRIO_MAP: Record<string, string> = {
  hoch:    'bg-red-100 text-red-700',
  mittel:  'bg-yellow-100 text-yellow-700',
  niedrig: 'bg-gray-100 text-gray-600',
};

export default function TraegerDashboard() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Building2 className="w-6 h-6 text-blue-600" /> Träger-Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Gesamtübersicht für Träger — alle Einrichtungen auf einen Blick
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KPI.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-2xl border p-4"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <p className={`text-2xl font-extrabold ${k.color}`}>{k.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{k.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Einrichtungen */}
      <div>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Einrichtungen</h2>
        <div className="space-y-2">
          {EINRICHTUNGEN.map(e => {
            const sm = STATUS_MAP[e.status];
            const isOpen = expanded === e.id;
            return (
              <div key={e.id} className="rounded-2xl border overflow-hidden"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <button className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : e.id)}>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sm.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{e.name}</p>
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      <MapPin className="w-3 h-3" /> {e.ort}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right hidden sm:block">
                      <p className={`font-bold ${sm.text}`}>{e.auslastung.toFixed(1)}%</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{e.kinder}/{e.kapazitaet} Kinder</p>
                    </div>
                    {e.offeneAufgaben > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {e.offeneAufgaben}
                      </span>
                    )}
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      {[
                        { label: 'Gruppen', value: e.gruppen },
                        { label: 'Kinder', value: `${e.kinder}/${e.kapazitaet}` },
                        { label: 'Personal', value: e.personal },
                        { label: 'Auslastung', value: `${e.auslastung.toFixed(1)}%` },
                      ].map(s => (
                        <div key={s.label} className="rounded-xl border p-3 text-center"
                          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                          <p className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{s.value}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">
                        Einrichtung öffnen
                      </button>
                      <button className="px-3 py-1.5 rounded-xl border text-xs font-medium"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                        Bericht exportieren
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Finanzen */}
      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Euro className="w-5 h-5 text-green-600" /> Finanzübersicht (April 2025)
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {FINANZEN.map(f => (
            <div key={f.label} className="rounded-2xl border p-4 flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{f.label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{f.value}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {f.delta}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Offene Aufgaben */}
      <div>
        <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <AlertTriangle className="w-5 h-5 text-orange-500" /> Offene Aufgaben
        </h2>
        <div className="space-y-2">
          {AUFGABEN.map((a, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border p-3"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${PRIO_MAP[a.prio]}`}>
                {a.prio}
              </span>
              <div className="flex-1">
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{a.text}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{a.einrichtung} · fällig {a.faellig}</p>
              </div>
              <button className="p-1 rounded-lg hover:bg-green-50 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-gray-300 hover:text-green-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
