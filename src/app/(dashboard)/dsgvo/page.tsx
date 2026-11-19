'use client';

import { useState } from 'react';
import { Shield, CheckCircle2, Download, FileText, AlertTriangle, Clock, Building2, ChevronDown, ChevronUp } from 'lucide-react';

/** DSGVO Auftragsverarbeitungsvertrag (AVV) — Mindry KIDS
 *  Basis: Art. 28 DSGVO + §22a SGB VIII + KitaG NRW
 *  Status-Dashboard: Unterzeichnung, Löschfristen, Betroffenenrechte
 */

interface AvvPunkt {
  id: string;
  artikel: string;
  titel: string;
  inhalt: string;
  status: 'aktiv' | 'ausstehend' | 'info';
}

const AVV_PUNKTE: AvvPunkt[] = [
  {
    id: '1',
    artikel: 'Art. 28 DSGVO',
    titel: 'Gegenstand und Dauer der Verarbeitung',
    inhalt: 'Mindry verarbeitet personenbezogene Daten (Kinderdaten, Erziehungsberechtigte, Mitarbeitende) ausschließlich im Auftrag der Kindertageseinrichtung als Verantwortlicher. Dauer: Laufzeit des Nutzungsvertrags + 10 Jahre Aufbewahrungspflicht.',
    status: 'aktiv',
  },
  {
    id: '2',
    artikel: 'Art. 28 Abs. 3 DSGVO',
    titel: 'Weisungsgebundenheit des Auftragsverarbeiters',
    inhalt: 'Mindry verarbeitet Daten ausschließlich auf dokumentierte Weisung der Einrichtung. Keine eigenständige Datennutzung zu Marketing- oder anderen Zwecken. KI-Features werden nur zur Funktionserbringung genutzt.',
    status: 'aktiv',
  },
  {
    id: '3',
    artikel: 'Art. 32 DSGVO',
    titel: 'Technische und organisatorische Maßnahmen (TOM)',
    inhalt: 'Ende-zu-Ende-Verschlüsselung (TLS 1.3), Datenverschlüsselung at rest (AES-256), Zugriffskontrolle (RBAC), regelmäßige Penetrationstests, ISO 27001-zertifiziertes Rechenzentrum (Mittwald, Deutschland).',
    status: 'aktiv',
  },
  {
    id: '4',
    artikel: 'Art. 28 Abs. 2 DSGVO',
    titel: 'Unterauftragsverarbeiter',
    inhalt: 'Aktuell eingesetzte Sub-Auftragsverarbeiter: Supabase Inc. (Datenbankhosting, EU-Region Frankfurt), Mittwald CM Service GmbH (Server, Deutschland), Anthropic PBC (KI, EU-Datenverarbeitung per DPA). Vorabenachrichtigung bei Änderungen: 30 Tage.',
    status: 'aktiv',
  },
  {
    id: '5',
    artikel: 'Art. 17 DSGVO + §22a SGB VIII',
    titel: 'Löschkonzept & Aufbewahrungsfristen',
    inhalt: 'Kinderdaten: Löschung 10 Jahre nach Ende der Betreuung (§78 SGB X). Kommunikationsdaten: 3 Jahre. Gesundheitsdaten (§9 DSGVO): 30 Jahre bei medizinischer Relevanz (§10 StAG), sonst 10 Jahre. Automatische Löschbenachrichtigung 6 Monate vor Ablauf.',
    status: 'aktiv',
  },
  {
    id: '6',
    artikel: 'Art. 33-34 DSGVO',
    titel: 'Meldepflicht bei Datenpannen',
    inhalt: 'Mindry meldet Datenpannen unverzüglich (max. 72h nach Kenntnisnahme) gem. Art. 33 DSGVO an die Aufsichtsbehörde und informiert die Einrichtung sofort. Incident-Response-Plan liegt vor.',
    status: 'aktiv',
  },
  {
    id: '7',
    artikel: 'Art. 37 DSGVO',
    titel: 'Datenschutzbeauftragter',
    inhalt: 'Mindry hat einen betrieblichen Datenschutzbeauftragten bestellt (gem. Art. 37 Abs. 1c DSGVO — Verarbeitung besonderer Datenkategorien nach Art. 9). Kontakt: datenschutz@mindry.de. Die Einrichtung bestellt ggf. eigenen DSB gemäß KitaG.',
    status: 'info',
  },
  {
    id: '8',
    artikel: 'Art. 28 Abs. 3h DSGVO',
    titel: 'Rückgabe und Löschung nach Auftragsende',
    inhalt: 'Nach Vertragsende: Vollständiger Datenexport (JSON/CSV) innerhalb 30 Tagen, danach unwiderrufliche Löschung aller Daten inklusive Backups. Löschzertifikat wird ausgestellt.',
    status: 'ausstehend',
  },
];

const LOESCHFRISTEN = [
  { kategorie: 'Kinderstammdaten', frist: '10 Jahre nach Betreuungsende', basis: '§78 SGB X', icon: '👶' },
  { kategorie: 'Entwicklungsberichte / Portfolio', frist: '10 Jahre nach Betreuungsende', basis: 'KitaG + DSGVO', icon: '📁' },
  { kategorie: 'Gesundheitsunterlagen', frist: '30 Jahre (medizinische Relevanz)', basis: '§10 StAG', icon: '🏥' },
  { kategorie: 'IfSG-Meldungen', frist: '3 Jahre nach Meldung', basis: '§34 IfSG', icon: '🛡️' },
  { kategorie: 'Kommunikation (Nachrichten)', frist: '3 Jahre', basis: 'DSGVO Art. 5 Abs. 1e', icon: '💬' },
  { kategorie: 'Mitarbeiterdaten', frist: '10 Jahre nach Austritt', basis: 'ArbR + DSGVO', icon: '👤' },
  { kategorie: 'Buchungsbelege / Gebühren', frist: '10 Jahre', basis: '§147 AO', icon: '💶' },
  { kategorie: 'Fotos / Videos', frist: 'Bei Widerruf sofort, sonst 3 Jahre', basis: 'DSGVO Art. 6', icon: '📷' },
];

const STATUS_CFG = {
  aktiv: { label: 'In Kraft', color: 'bg-green-100 text-green-700' },
  ausstehend: { label: 'Ausstehend', color: 'bg-amber-100 text-amber-700' },
  info: { label: 'Information', color: 'bg-blue-100 text-blue-700' },
};

export default function AvvPage() {
  const [tab, setTab] = useState<'avv' | 'fristen' | 'status'>('status');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [unterzeichnet, setUnterzeichnet] = useState(false);

  const aktivPunkte = AVV_PUNKTE.filter(p => p.status === 'aktiv').length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>DSGVO Auftragsverarbeitungsvertrag (AVV)</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Art. 28 DSGVO · §22a SGB VIII · KitaG NRW · Hesselmann Beratung UG
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-xl border-l-4 border-indigo-500 p-4 flex gap-3" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Rechtsgrundlage: Art. 28 DSGVO</p>
          <p>Kindertageseinrichtungen, die Mindry nutzen, sind Verantwortliche gem. DSGVO. Der AVV regelt die Auftragsverarbeitung durch Mindry (Hesselmann Beratung UG). <strong style={{ color: 'var(--color-text)' }}>Ohne unterzeichneten AVV darf keine Datenverarbeitung durch Mindry erfolgen.</strong></p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Regelungen in Kraft', value: aktivPunkte + ' / ' + AVV_PUNKTE.length, color: 'text-green-600' },
          { icon: <Clock className="w-4 h-4" />, label: 'Löschfristen dokumentiert', value: LOESCHFRISTEN.length, color: 'text-blue-600' },
          { icon: <Building2 className="w-4 h-4" />, label: 'AVV-Status', value: unterzeichnet ? 'Aktiv' : 'Ausstehend', color: unterzeichnet ? 'text-green-600' : 'text-amber-600' },
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
        {(['status', 'avv', 'fristen'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-600 text-white' : ''}`}
            style={tab !== t ? { color: 'var(--color-text-muted)' } : {}}>
            {{ status: 'AVV-Status', avv: 'Vertragsinhalte', fristen: 'Löschfristen' }[t]}
          </button>
        ))}
      </div>

      {/* Status Tab */}
      {tab === 'status' && (
        <div className="space-y-4">
          <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <FileText className="w-4 h-4 text-indigo-600" /> AVV Unterzeichnung
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Der AVV mit Hesselmann Beratung UG (HRB 27339, AG Münster) wurde
              {unterzeichnet ? ' am 01.04.2026 unterzeichnet.' : ' noch nicht unterzeichnet.'}
            </p>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setUnterzeichnet(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${unterzeichnet ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
                {unterzeichnet ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                {unterzeichnet ? 'Unterzeichnet ✓' : 'Als unterzeichnet markieren'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                <Download className="w-4 h-4" /> AVV herunterladen (PDF)
              </button>
            </div>
          </div>

          <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Unterauftragsverarbeiter (Art. 28 Abs. 2)</h3>
            {[
              { name: 'Supabase Inc.', zweck: 'Datenbank & Auth', ort: 'EU (Frankfurt)', status: 'aktiv' },
              { name: 'Mittwald CM Service GmbH', zweck: 'Server-Hosting', ort: 'Deutschland', status: 'aktiv' },
              { name: 'Anthropic PBC', zweck: 'KI-Features', ort: 'EU-DPA vorhanden', status: 'aktiv' },
            ].map(sub => (
              <div key={sub.name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--color-bg)' }}>
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{sub.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sub.zweck} · {sub.ort}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">DPA vorhanden</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AVV Inhalte Tab */}
      {tab === 'avv' && (
        <div className="space-y-2">
          {AVV_PUNKTE.map(punkt => (
            <div key={punkt.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <button onClick={() => setExpanded(expanded === punkt.id ? null : punkt.id)}
                className="w-full flex items-center justify-between p-4 text-left" style={{ background: 'var(--color-surface)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-500 shrink-0">{punkt.artikel}</span>
                  <span className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{punkt.titel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_CFG[punkt.status].color}`}>
                    {STATUS_CFG[punkt.status].label}
                  </span>
                  {expanded === punkt.id ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </div>
              </button>
              {expanded === punkt.id && (
                <div className="px-4 pb-4 pt-2 text-sm" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  {punkt.inhalt}
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
              <Download className="w-4 h-4" /> Vollständigen AVV herunterladen
            </button>
          </div>
        </div>
      )}

      {/* Löschfristen Tab */}
      {tab === 'fristen' && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Löschkonzept gem. Art. 17 DSGVO, §22a SGB VIII und KitaG NRW — alle Fristen sind gesetzlich verpflichtend.
          </p>
          {LOESCHFRISTEN.map(f => (
            <div key={f.kategorie} className="rounded-xl border p-4 flex gap-4" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <span className="text-2xl shrink-0">{f.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{f.kategorie}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{f.frist}</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold self-start">{f.basis}</span>
            </div>
          ))}
          <div className="rounded-xl border p-4 mt-2" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Automatische Löscherinnerung</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Mindry erinnert die Leitung automatisch 6 Monate vor Ablauf einer Aufbewahrungsfrist per E-Mail und im Dashboard.
              Löschvorgänge werden im Audit-Log dokumentiert.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
