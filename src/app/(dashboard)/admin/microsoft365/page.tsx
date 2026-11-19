'use client';

import { useState } from 'react';
import { Cloud, Shield, Users, Calendar, CheckCircle2, Circle, Copy, Eye, EyeOff, ExternalLink, Info, Video } from 'lucide-react';

// ── Microsoft 365 Integration — kids.mindry.de ───────────────────────────────
// Azure AD SSO für Kita-Leitungen und Träger
// Teams für Elterngespräche & Elternabende
// OneDrive für Foto-/Dokumenten-Backup

const SETUP_STEPS = [
  {
    num: 1,
    title: 'Azure AD App-Registrierung',
    done: false,
    instructions: [
      'Azure Portal → portal.azure.com öffnen',
      'App-Registrierungen → Neue Registrierung',
      'Name: "Mindry Kids" · Kontotyp: Einzelner Mandant',
      'Redirect-URI: https://kids.mindry.de/api/auth/callback/azure-ad',
      'Anwendungs-ID (Client ID) notieren',
    ],
  },
  {
    num: 2,
    title: 'Client-Secret erstellen',
    done: false,
    instructions: [
      'In der App-Registrierung → Zertifikate & Geheimnisse',
      'Neues Clientgeheimnis → Beschreibung: "Mindry Kids Prod"',
      'Ablauf: 24 Monate',
      'Secret-Wert sofort kopieren (nur einmalig sichtbar!)',
    ],
  },
  {
    num: 3,
    title: 'API-Berechtigungen konfigurieren',
    done: false,
    instructions: [
      'API-Berechtigungen → Berechtigung hinzufügen → Microsoft Graph',
      'openid, email, profile, User.Read (delegiert)',
      'Calendars.ReadWrite (für Elterngespräche)',
      'OneDrive.ReadWrite (für Dokumenten-Backup)',
      'Admin-Zustimmung erteilen',
    ],
  },
  {
    num: 4,
    title: 'Umgebungsvariablen eintragen',
    done: false,
    instructions: [
      'In den Einstellungen unten Tenant ID, Client ID und Secret eintragen',
      'Speichern und Verbindung testen',
    ],
  },
];

const FEATURES = [
  { icon: Shield,   label: 'Azure AD SSO',      desc: 'Login für Kita-Leitung & Träger mit Microsoft-Konto', active: false },
  { icon: Video,    label: 'Teams-Elterngespräche', desc: 'Virtuelle Elterngespräche und Elternabende',        active: false },
  { icon: Cloud,    label: 'OneDrive Backup',   desc: 'Automatisches Backup von Fotos & Dokumenten',          active: false },
  { icon: Calendar, label: 'Teams-Kalender',    desc: 'Synchronisation mit Outlook-Kalender',                  active: false },
  { icon: Users,    label: 'Eltern-Teams',      desc: 'Gruppen-Chats pro Kita-Gruppe',                         active: false },
];

export default function Microsoft365KidsPage() {
  const [values, setValues] = useState({ tenant: '', clientId: '', clientSecret: '' });
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [steps, setSteps] = useState(SETUP_STEPS.map(s => ({ ...s })));

  function toggleStep(num: number) {
    setSteps(prev => prev.map(s => s.num === num ? { ...s, done: !s.done } : s));
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const doneCount = steps.filter(s => s.done).length;

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Cloud className="w-6 h-6 text-blue-600" /> Microsoft 365 Integration
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Azure AD SSO · Teams · OneDrive — für Kita-Leitungen und Träger
        </p>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border p-5"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Setup-Fortschritt</p>
          <p className="text-sm font-bold text-blue-600">{doneCount}/{steps.length} Schritte</p>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </div>

      {/* Setup steps */}
      <div className="space-y-3">
        {steps.map(step => (
          <div key={step.num} className="rounded-2xl border overflow-hidden"
            style={{ borderColor: step.done ? '#86efac' : 'var(--color-border)', background: 'var(--color-surface)' }}>
            <button className="w-full flex items-center gap-4 px-5 py-4 text-left"
              onClick={() => toggleStep(step.num)}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step.done ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {step.done ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : step.num}
              </div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{step.title}</p>
              <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer"
                className="ml-auto text-xs text-blue-600 flex items-center gap-1 hover:underline"
                onClick={e => e.stopPropagation()}>
                Azure Portal <ExternalLink className="w-3 h-3" />
              </a>
            </button>
            <div className="px-5 pb-4 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
              <ul className="space-y-1.5 mt-3">
                {step.instructions.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text)' }}>
                    <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">{i+1}</span>
                    {ins}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* ENV vars form */}
      <div className="rounded-2xl border p-5 space-y-4"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Azure AD Zugangsdaten</h2>
        {[
          { key: 'tenant',       label: 'Tenant ID',     ph: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
          { key: 'clientId',     label: 'Client ID',     ph: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
          { key: 'clientSecret', label: 'Client Secret', ph: '~secret-value', isSecret: true },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text)' }}>{f.label}</label>
            <div className="relative">
              <input
                type={f.isSecret && !showSecret ? 'password' : 'text'}
                value={values[f.key as keyof typeof values]}
                onChange={e => setValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.ph}
                className="w-full px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
              />
              {f.isSecret && (
                <button className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowSecret(v => !v)}>
                  {showSecret ? <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={save}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
            {saved ? <><CheckCircle2 className="w-4 h-4 inline mr-1" /> Gespeichert!</> : 'Speichern'}
          </button>
          <button className="px-4 py-2 rounded-xl border text-sm font-medium hover:bg-gray-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
            Verbindung testen
          </button>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>Verfügbare Funktionen</h2>
        <div className="space-y-2">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-center gap-4 rounded-2xl border p-4"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{f.label}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
                </div>
                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                  Ausstehend
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          DSGVO-Hinweis: Bei aktivierter Microsoft 365 Integration werden Authentifizierungstoken und Profilgrunddaten über Microsoft Graph API verarbeitet. Microsoft verarbeitet Bildungsdaten gemäß dem Microsoft Education DPA und der EU Data Boundary.
        </p>
      </div>
    </div>
  );
}
