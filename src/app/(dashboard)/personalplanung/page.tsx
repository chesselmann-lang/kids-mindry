'use client';

import { useState, useMemo } from 'react';
import {
  Users, Calendar, Clock, Plus, Edit2, CheckCircle2, AlertTriangle,
  Coffee, Star, BarChart3, Download, Shield, ChevronDown, ChevronUp,
  Sun, AlertCircle, Award, Heart, TrendingUp, FileText, Bell
} from 'lucide-react';

// ── Kita Personalplanung — Personalschlüssel · Dienstplan · Fortbildung ──────

type Rolle = 'Leitung' | 'Erzieherin' | 'Kinderpflegerin' | 'FSJ' | 'Praktikant' | 'Integrationskraft';
type Status = 'aktiv' | 'krank' | 'urlaub' | 'fortbildung';

interface Fachkraft {
  id: string;
  name: string;
  rolle: Rolle;
  stunden: number;
  urlaubGesamt: number;
  urlaubGenommen: number;
  krankTage: number;
  gruppe: string;
  qualifikation: string;
  status: Status;
  fortbildungStunden: number;
  eintrittsdatum: string;
}

interface SchichtSlot {
  name: string;
  start: string;
  ende: string;
}

const TEAM: Fachkraft[] = [
  {
    id: '1', name: 'Monika Braun',     rolle: 'Leitung',          stunden: 40,
    urlaubGesamt: 30, urlaubGenommen: 12, krankTage: 2,  gruppe: 'Leitung',
    qualifikation: 'Staatl. anerk. Erzieherin + Leitungsqualifikation', status: 'aktiv',
    fortbildungStunden: 32, eintrittsdatum: '2018-09-01',
  },
  {
    id: '2', name: 'Sandra Klein',     rolle: 'Erzieherin',        stunden: 35,
    urlaubGesamt: 28, urlaubGenommen: 8,  krankTage: 0,  gruppe: 'Sonnenkinder',
    qualifikation: 'Staatl. anerk. Erzieherin (B.A. Soziale Arbeit)', status: 'aktiv',
    fortbildungStunden: 18, eintrittsdatum: '2020-03-01',
  },
  {
    id: '3', name: 'Julia Müller',     rolle: 'Erzieherin',        stunden: 30,
    urlaubGesamt: 28, urlaubGenommen: 14, krankTage: 5,  gruppe: 'Sternschnuppen',
    qualifikation: 'Staatl. anerk. Erzieherin', status: 'krank',
    fortbildungStunden: 12, eintrittsdatum: '2019-08-01',
  },
  {
    id: '4', name: 'Petra Schmidt',    rolle: 'Kinderpflegerin',   stunden: 25,
    urlaubGesamt: 24, urlaubGenommen: 6,  krankTage: 1,  gruppe: 'Regenbogen',
    qualifikation: 'Staatl. anerk. Kinderpflegerin', status: 'aktiv',
    fortbildungStunden: 6, eintrittsdatum: '2021-11-01',
  },
  {
    id: '5', name: 'Lisa Wagner',      rolle: 'FSJ',               stunden: 20,
    urlaubGesamt: 20, urlaubGenommen: 4,  krankTage: 0,  gruppe: 'Sonnenkinder',
    qualifikation: 'FSJ Soziales (bis 08/2026)', status: 'aktiv',
    fortbildungStunden: 4, eintrittsdatum: '2025-09-01',
  },
  {
    id: '6', name: 'Max Becker',       rolle: 'Praktikant',        stunden: 39,
    urlaubGesamt: 0,  urlaubGenommen: 0,  krankTage: 0,  gruppe: 'Sternschnuppen',
    qualifikation: 'Anerkennungspraktikum (bis 07/2026)', status: 'aktiv',
    fortbildungStunden: 8, eintrittsdatum: '2025-09-01',
  },
  {
    id: '7', name: 'Hanna Richter',    rolle: 'Integrationskraft', stunden: 20,
    urlaubGesamt: 20, urlaubGenommen: 2,  krankTage: 3,  gruppe: 'Regenbogen',
    qualifikation: 'Heilpädagogik B.A. — SGB IX Eingliederungshilfe', status: 'aktiv',
    fortbildungStunden: 16, eintrittsdatum: '2022-04-01',
  },
];

const DIENSTPLAN: { tag: string; frueh: string[]; spaet: string[] }[] = [
  { tag: 'Montag',    frueh: ['Sandra Klein', 'Monika Braun', 'Max Becker'],        spaet: ['Julia Müller', 'Petra Schmidt'] },
  { tag: 'Dienstag',  frueh: ['Monika Braun', 'Sandra Klein', 'Hanna Richter'],     spaet: ['Petra Schmidt', 'Lisa Wagner'] },
  { tag: 'Mittwoch',  frueh: ['Sandra Klein', 'Max Becker', 'Hanna Richter'],       spaet: ['Petra Schmidt', 'Lisa Wagner'] },
  { tag: 'Donnerstag',frueh: ['Monika Braun', 'Max Becker', 'Lisa Wagner'],         spaet: ['Julia Müller', 'Hanna Richter'] },
  { tag: 'Freitag',   frueh: ['Monika Braun', 'Sandra Klein', 'Petra Schmidt'],     spaet: ['Max Becker'] },
];

// Personalschlüssel nach Bundesland (Kinder je Fachkraft)
const SCHLUESSEL_NORM = { krippe: 3.5, kita: 8.5 }; // Bayern
const KINDER_GESAMT = { krippe: 12, kita: 48 };

const FORTBILDUNGS_PFLICHT = 24; // Stunden/Jahr laut AVPfleWoG / LZP

const ROLLE_COLOR: Record<Rolle, string> = {
  Leitung:          'bg-purple-100 text-purple-800 border-purple-200',
  Erzieherin:       'bg-blue-100 text-blue-800 border-blue-200',
  Kinderpflegerin:  'bg-green-100 text-green-800 border-green-200',
  FSJ:              'bg-yellow-100 text-yellow-800 border-yellow-200',
  Praktikant:       'bg-gray-100 text-gray-700 border-gray-200',
  Integrationskraft:'bg-pink-100 text-pink-800 border-pink-200',
};

const STATUS_CFG: Record<Status, { label: string; dot: string; bg: string }> = {
  aktiv:       { label: 'Anwesend',     dot: 'bg-green-400',  bg: 'bg-green-50' },
  krank:       { label: 'Krank',        dot: 'bg-red-400',    bg: 'bg-red-50' },
  urlaub:      { label: 'Urlaub',       dot: 'bg-yellow-400', bg: 'bg-yellow-50' },
  fortbildung: { label: 'Fortbildung',  dot: 'bg-blue-400',   bg: 'bg-blue-50' },
};

type Tab = 'team' | 'dienstplan' | 'schluessel' | 'fortbildung';

export default function PersonalplanungPage() {
  const [tab, setTab] = useState<Tab>('team');
  const [expanded, setExpanded] = useState<string | null>(null);

  // ── Kennzahlen ────────────────────────────────────────────────────────────
  const anwesend  = TEAM.filter(f => f.status === 'aktiv').length;
  const krank     = TEAM.filter(f => f.status === 'krank').length;
  const gesamtStunden = TEAM.reduce((s, f) => s + f.stunden, 0);
  const urlaubRest = TEAM.reduce((s, f) => s + (f.urlaubGesamt - f.urlaubGenommen), 0);

  // Personalschlüssel-Berechnung
  const fkKrippe = useMemo(() => {
    const vollzeit = TEAM.filter(f => ['Erzieherin', 'Leitung'].includes(f.rolle) && f.stunden >= 38.5).length;
    return (KINDER_GESAMT.krippe / (vollzeit || 1)).toFixed(1);
  }, []);
  const fkKita = useMemo(() => {
    const gew = TEAM.reduce((s, f) => {
      if (['Erzieherin', 'Leitung'].includes(f.rolle)) return s + (f.stunden / 38.5);
      if (f.rolle === 'Kinderpflegerin') return s + (f.stunden / 38.5) * 0.75;
      return s;
    }, 0);
    return (KINDER_GESAMT.kita / Math.max(gew, 0.1)).toFixed(1);
  }, []);

  const schluesselOk = parseFloat(fkKita) <= SCHLUESSEL_NORM.kita;
  const fortbildungMaengel = TEAM.filter(f => f.status === 'aktiv' && f.fortbildungStunden < FORTBILDUNGS_PFLICHT).length;

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Users className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
            Personalplanung
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Kita Sonnenschein · 7 Fachkräfte · KW 17/2026
          </p>
        </div>
        <button className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}>
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      {/* KPI-Kacheln */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: CheckCircle2, label: 'Anwesend heute', val: `${anwesend}/${TEAM.length}`, color: '#16a34a', alert: false },
          { icon: AlertTriangle, label: 'Krank gemeldet', val: krank, color: krank > 0 ? '#dc2626' : '#9ca3af', alert: krank > 0 },
          { icon: Clock, label: 'Wochenstunden gesamt', val: `${gesamtStunden} h`, color: 'var(--color-primary)', alert: false },
          { icon: Calendar, label: 'Offene Urlaubstage', val: urlaubRest, color: '#d97706', alert: false },
        ].map(k => (
          <div key={k.label} className="rounded-2xl border p-3" style={{ background: 'var(--color-surface)', borderColor: k.alert ? '#fca5a5' : 'var(--color-border)' }}>
            <div className="flex items-center gap-2 mb-1">
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{k.label}</p>
            </div>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Warnung Personalschlüssel */}
      {!schluesselOk && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800">Personalschlüssel unterschritten</p>
            <p className="text-[10px] text-amber-700">Akt. Verhältnis {fkKita}:1 (Norm: {SCHLUESSEL_NORM.kita}:1). Ggf. Vertretung benötigt.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {(['team', 'dienstplan', 'schluessel', 'fortbildung'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors capitalize"
            style={{
              background: tab === t ? 'var(--color-primary)' : 'var(--color-surface)',
              color: tab === t ? '#fff' : 'var(--color-text-muted)',
              borderColor: tab === t ? 'var(--color-primary)' : 'var(--color-border)',
            }}>
            {t === 'team' ? 'Team' : t === 'dienstplan' ? 'Dienstplan' : t === 'schluessel' ? 'Personalschlüssel' : 'Fortbildung'}
          </button>
        ))}
      </div>

      {/* ── TAB: Team ───────────────────────────────────────────────────────── */}
      {tab === 'team' && (
        <div className="space-y-2">
          {TEAM.map(f => {
            const isOpen = expanded === f.id;
            const urlaubRest = f.urlaubGesamt - f.urlaubGenommen;
            const st = STATUS_CFG[f.status];
            return (
              <div key={f.id} className="rounded-2xl border overflow-hidden"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <button onClick={() => setExpanded(isOpen ? null : f.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: 'var(--color-primary)', color: '#fff' }}>
                    {f.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{f.name}</p>
                    <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{f.rolle} · {f.gruppe} · {f.stunden}h/W</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${st.bg}`}
                      style={{ color: 'var(--color-text)' }}>{st.label}</span>
                    {isOpen ? <ChevronUp className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                             : <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t px-3 py-3 space-y-2" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{f.qualifikation}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Urlaub übrig', val: `${urlaubRest}/${f.urlaubGesamt}`, warn: urlaubRest > 15 },
                        { label: 'Krank (Jahr)', val: `${f.krankTage} Tage`, warn: f.krankTage > 10 },
                        { label: 'Fortbildung', val: `${f.fortbildungStunden}h`, warn: f.fortbildungStunden < FORTBILDUNGS_PFLICHT },
                      ].map(stat => (
                        <div key={stat.label} className={`rounded-xl p-2 text-center border ${stat.warn ? 'border-amber-200 bg-amber-50' : 'border-transparent'}`}
                          style={{ background: stat.warn ? undefined : 'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))' }}>
                          <p className={`text-sm font-bold ${stat.warn ? 'text-amber-700' : ''}`}
                            style={{ color: stat.warn ? undefined : 'var(--color-primary)' }}>{stat.val}</p>
                          <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <span className={`inline-flex text-[9px] font-semibold px-2 py-0.5 rounded-full border ${ROLLE_COLOR[f.rolle]}`}>
                      {f.rolle}
                    </span>
                    <span className="text-[9px] ml-2" style={{ color: 'var(--color-text-muted)' }}>
                      seit {new Date(f.eintrittsdatum).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          <button className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-xs font-semibold"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <Plus className="w-4 h-4" /> Neue Fachkraft anlegen
          </button>
        </div>
      )}

      {/* ── TAB: Dienstplan ──────────────────────────────────────────────────── */}
      {tab === 'dienstplan' && (
        <div className="space-y-2">
          <div className="rounded-xl border p-3 text-[10px] space-y-1" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="font-bold" style={{ color: 'var(--color-text)' }}>Legende</p>
            <div className="flex gap-3">
              <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-500" /> Frühdienst 7:00–14:00</span>
              <span className="flex items-center gap-1"><Coffee className="w-3 h-3 text-blue-500" /> Spätdienst 11:30–17:30</span>
            </div>
          </div>
          {DIENSTPLAN.map(d => (
            <div key={d.tag} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>{d.tag}</p>
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  {d.frueh.length + d.spaet.length} Fachkräfte
                </span>
              </div>
              <div className="p-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-semibold flex items-center gap-1 mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <Sun className="w-3 h-3 text-amber-500" /> Frühdienst
                  </p>
                  <div className="space-y-1">
                    {d.frueh.map(name => {
                      const fk = TEAM.find(f => f.name === name);
                      const isKrank = fk?.status === 'krank';
                      return (
                        <div key={name} className={`flex items-center gap-1.5 ${isKrank ? 'opacity-40 line-through' : ''}`}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                            style={{ background: isKrank ? '#9ca3af' : 'var(--color-primary)' }}>
                            {name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <p className="text-[10px]" style={{ color: 'var(--color-text)' }}>{name.split(' ')[0]}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] font-semibold flex items-center gap-1 mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <Coffee className="w-3 h-3 text-blue-500" /> Spätdienst
                  </p>
                  <div className="space-y-1">
                    {d.spaet.map(name => (
                      <div key={name} className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                          style={{ background: 'var(--color-primary)' }}>
                          {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <p className="text-[10px]" style={{ color: 'var(--color-text)' }}>{name.split(' ')[0]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Personalschlüssel ───────────────────────────────────────────── */}
      {tab === 'schluessel' && (
        <div className="space-y-3">
          <div className="rounded-2xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--color-text)' }}>
              <Shield className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              Personalschlüssel Bayern (AVBayKiBiG §17)
            </p>
            {[
              {
                label: 'Krippe (0–3 J.)',
                norm: SCHLUESSEL_NORM.krippe,
                ist: parseFloat(fkKrippe),
                kinder: KINDER_GESAMT.krippe,
              },
              {
                label: 'Kindergarten (3–6 J.)',
                norm: SCHLUESSEL_NORM.kita,
                ist: parseFloat(fkKita),
                kinder: KINDER_GESAMT.kita,
              },
            ].map(s => {
              const ok = s.ist <= s.norm;
              const pct = Math.min((s.norm / s.ist) * 100, 100);
              return (
                <div key={s.label} className={`mb-4 p-3 rounded-xl border ${ok ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{s.label}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {ok ? '✓ OK' : '⚠ Unterschritten'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Kinder: <b>{s.kinder}</b></span>
                    <span>Ist-Schlüssel: <b style={{ color: ok ? '#16a34a' : '#dc2626' }}>{s.ist.toFixed(1)}:1</b></span>
                    <span>Norm: <b>{s.norm}:1</b></span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${ok ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-[10px] text-blue-800 space-y-1">
              <p className="font-bold">📋 Rechtliche Grundlagen</p>
              <p>• AVBayKiBiG §17 — Mindestpersonalschlüssel</p>
              <p>• BayKiBiG Art. 17 — Qualifikationsanforderungen</p>
              <p>• SGB VIII §45 — Betriebserlaubnis & Aufsicht</p>
              <p>• Kommunaler KiTa-Finanzierungsrahmen (KiföG)</p>
            </div>
          </div>

          {/* Rollentabelle */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <p className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Anerkennungsfähige Personalstunden</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {TEAM.filter(f => ['Erzieherin', 'Leitung', 'Kinderpflegerin'].includes(f.rolle)).map(f => {
                const gewFaktor = ['Erzieherin', 'Leitung'].includes(f.rolle) ? 1.0 : 0.75;
                const gewStd = (f.stunden * gewFaktor).toFixed(1);
                return (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2.5"
                    style={{ background: 'var(--color-surface)' }}>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{f.name}</p>
                      <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{f.rolle} · {f.stunden}h/Woche</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{gewStd}h</p>
                      <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>×{gewFaktor} anerkannt</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Fortbildung ─────────────────────────────────────────────────── */}
      {tab === 'fortbildung' && (
        <div className="space-y-3">
          <div className={`rounded-xl border p-3 flex items-center gap-2 ${fortbildungMaengel > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
            {fortbildungMaengel > 0 ? (
              <><Bell className="w-4 h-4 text-amber-600" /><p className="text-xs font-semibold text-amber-800">{fortbildungMaengel} Fachkraft/-kräfte unter {FORTBILDUNGS_PFLICHT}h Pflichtfortbildung</p></>
            ) : (
              <><CheckCircle2 className="w-4 h-4 text-green-600" /><p className="text-xs font-semibold text-green-800">Alle Fortbildungspflichten erfüllt ({FORTBILDUNGS_PFLICHT}h/Jahr)</p></>
            )}
          </div>
          {TEAM.filter(f => f.status === 'aktiv').map(f => {
            const pct = Math.min((f.fortbildungStunden / FORTBILDUNGS_PFLICHT) * 100, 100);
            const ok = f.fortbildungStunden >= FORTBILDUNGS_PFLICHT;
            return (
              <div key={f.id} className="rounded-2xl border p-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{f.name}</p>
                    <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{f.rolle}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {f.fortbildungStunden}/{FORTBILDUNGS_PFLICHT}h
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${ok ? 'bg-green-500' : 'bg-amber-400'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                {!ok && (
                  <p className="mt-1 text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                    Noch {FORTBILDUNGS_PFLICHT - f.fortbildungStunden}h bis Jahresziel
                  </p>
                )}
              </div>
            );
          })}
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-[10px] text-blue-800 space-y-1">
            <p className="font-bold">📚 Fortbildungspflicht Bayern</p>
            <p>• {FORTBILDUNGS_PFLICHT}h/Jahr lt. AVBayKiBiG §25</p>
            <p>• Träger trägt Kosten + Arbeitszeit (§ 10 KiTaG)</p>
            <p>• IFP-zertifizierte Anbieter empfohlen</p>
            <p>• Nachweis für Betriebserlaubnisüberprüfung</p>
          </div>
        </div>
      )}
    </div>
  );
}
