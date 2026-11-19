'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, FileText, Plus, X, Info, Calendar, User } from 'lucide-react';

// ── IfSG §34 Meldepflicht-Verwaltung — kids.mindry.de ─────────────────────────
// §34 Infektionsschutzgesetz: Belehrung + Meldung bei übertragbaren Krankheiten

const KRANKHEITEN = [
  'Masern', 'Mumps', 'Röteln', 'Windpocken', 'Keuchhusten',
  'Scharlach', 'Norovirus', 'Rotavirus', 'Läuse (Pediculosis)',
  'Krätze (Scabies)', 'MRSA', 'Hepatitis A', 'Salmonellose',
  'Impetigo (Borkenflechte)', 'Hand-Fuß-Mund-Krankheit',
];

type Status = 'aktiv' | 'beobachtung' | 'geklaert';

interface Fall {
  id: number;
  kind: string;
  gruppe: string;
  krankheit: string;
  meldedatum: string;
  status: Status;
  gesundheitsamt: boolean;
  elternInfo: boolean;
  wiederzulassung?: string;
}

const FAELLE: Fall[] = [
  { id: 1, kind: 'Lena M.', gruppe: 'Sonnenkäfer', krankheit: 'Windpocken', meldedatum: '2025-04-18', status: 'aktiv', gesundheitsamt: true, elternInfo: true, wiederzulassung: '2025-04-28' },
  { id: 2, kind: 'Tim B.', gruppe: 'Marienkäfer', krankheit: 'Norovirus', meldedatum: '2025-04-20', status: 'beobachtung', gesundheitsamt: false, elternInfo: true },
  { id: 3, kind: 'Sara K.', gruppe: 'Sonnenkäfer', krankheit: 'Läuse (Pediculosis)', meldedatum: '2025-04-10', status: 'geklaert', gesundheitsamt: false, elternInfo: true, wiederzulassung: '2025-04-13' },
];

const STATUS_CONFIG: Record<Status, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  aktiv:       { label: 'Aktiv',       bg: 'bg-red-50',    text: 'text-red-700',    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  beobachtung: { label: 'Beobachtung', bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <Clock className="w-3.5 h-3.5" /> },
  geklaert:    { label: 'Geklärt',     bg: 'bg-green-50',  text: 'text-green-700',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const BELEHRUNG_ITEMS = [
  { title: 'Jährliche Belehrung nach §35 IfSG', desc: 'Alle Mitarbeiter müssen jährlich über Tätigkeitsverbote und Meldepflichten belehrt werden.', done: true, datum: '2025-01-15' },
  { title: 'Erstbelehrung neue Mitarbeiter', desc: 'Vor Aufnahme der Tätigkeit schriftliche Belehrung + Unterschrift.', done: true, datum: '2025-03-01' },
  { title: 'Belehrung Eltern bei Aufnahme', desc: 'Eltern erhalten Merkblatt zu §34 IfSG und unterzeichnen Kenntnisnahme.', done: true, datum: 'Laufend' },
  { title: 'Hygieneplan aktualisiert', desc: 'Einrichtungsspezifischer Hygieneplan nach RKI-Empfehlungen.', done: false, datum: 'Ausstehend' },
];

export default function IfSGPage() {
  const [faelle, setFaelle] = useState(FAELLE);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Status | 'alle'>('alle');
  const [newFall, setNewFall] = useState({ kind: '', gruppe: '', krankheit: KRANKHEITEN[0] });

  const filtered = filter === 'alle' ? faelle : faelle.filter(f => f.status === filter);
  const aktiv = faelle.filter(f => f.status === 'aktiv').length;
  const beobachtung = faelle.filter(f => f.status === 'beobachtung').length;

  function addFall() {
    if (!newFall.kind || !newFall.gruppe) return;
    const f: Fall = {
      id: Date.now(),
      kind: newFall.kind,
      gruppe: newFall.gruppe,
      krankheit: newFall.krankheit,
      meldedatum: new Date().toISOString().slice(0, 10),
      status: 'aktiv',
      gesundheitsamt: false,
      elternInfo: false,
    };
    setFaelle(prev => [f, ...prev]);
    setNewFall({ kind: '', gruppe: '', krankheit: KRANKHEITEN[0] });
    setShowForm(false);
  }

  function toggleGA(id: number) {
    setFaelle(prev => prev.map(f => f.id === id ? { ...f, gesundheitsamt: !f.gesundheitsamt } : f));
  }

  function closeCase(id: number) {
    setFaelle(prev => prev.map(f => f.id === id ? { ...f, status: 'geklaert' as Status } : f));
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Shield className="w-6 h-6 text-orange-600" /> IfSG §34 Meldepflicht
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Verwaltung meldepflichtiger Erkrankungen nach Infektionsschutzgesetz §34
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Aktive Fälle', value: aktiv, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Beobachtung', value: beobachtung, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Gesamt 2025', value: faelle.length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-4 text-center"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Case list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            {(['alle', 'aktiv', 'beobachtung', 'geklaert'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f ? 'bg-orange-600 text-white' : ''}`}
                style={filter !== f ? { background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' } : {}}>
                {f === 'alle' ? 'Alle' : STATUS_CONFIG[f as Status]?.label ?? f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> Fall melden
          </button>
        </div>

        {/* New fall form */}
        {showForm && (
          <div className="rounded-2xl border p-4 mb-3 space-y-3"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Neuen Fall erfassen</p>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /></button>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { key: 'kind', label: 'Kind (Initialen)', ph: 'M. K.' },
                { key: 'gruppe', label: 'Gruppe', ph: 'Sonnenkäfer' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text)' }}>{f.label}</label>
                  <input value={newFall[f.key as 'kind' | 'gruppe']}
                    onChange={e => setNewFall(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.ph}
                    className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text)' }}>Erkrankung</label>
                <select value={newFall.krankheit} onChange={e => setNewFall(p => ({ ...p, krankheit: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                  {KRANKHEITEN.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <button onClick={addFall} className="px-4 py-2 rounded-xl bg-orange-600 text-white text-sm font-semibold">
              Fall anlegen
            </button>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(fall => {
            const sc = STATUS_CONFIG[fall.status];
            return (
              <div key={fall.id} className="rounded-2xl border p-4"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{fall.kind}</p>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>· {fall.gruppe}</span>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>{fall.krankheit}</p>
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Gemeldet: {fall.meldedatum}</span>
                      {fall.wiederzulassung && <span className="flex items-center gap-1"><User className="w-3 h-3" /> Wiederzulassung: {fall.wiederzulassung}</span>}
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => toggleGA(fall.id)}
                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition ${fall.gesundheitsamt ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {fall.gesundheitsamt ? 'GA gemeldet ✓' : 'GA melden'}
                      </button>
                      <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg ${fall.elternInfo ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        <FileText className="w-3 h-3" /> Eltern informiert {fall.elternInfo ? '✓' : ''}
                      </span>
                    </div>
                  </div>
                  {fall.status !== 'geklaert' && (
                    <button onClick={() => closeCase(fall.id)}
                      className="px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100">
                      Abschließen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Belehrungspflichten */}
      <div>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Belehrungspflichten §35 IfSG</h2>
        <div className="space-y-2">
          {BELEHRUNG_ITEMS.map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border p-4"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-100' : 'bg-orange-100'}`}>
                {item.done
                  ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                  : <AlertTriangle className="w-4 h-4 text-orange-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{item.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--color-text-faint)' }}>
                  {item.done ? `Zuletzt: ${item.datum}` : item.datum}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal note */}
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 flex gap-3">
        <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
        <div className="text-xs text-orange-800 space-y-1">
          <p><strong>§34 Abs. 1 IfSG:</strong> Personen, die an bestimmten Infektionskrankheiten erkrankt oder ansteckungsverdächtig sind, dürfen in Gemeinschaftseinrichtungen keine Lehr-, Erziehungs-, Pflege-, Aufsichts- oder sonstigen Tätigkeiten ausüben.</p>
          <p><strong>Meldepflicht:</strong> Bei Erkrankungen nach §34 ist die Einrichtung zur unverzüglichen Benachrichtigung des Gesundheitsamts verpflichtet.</p>
        </div>
      </div>
    </div>
  );
}
