'use client'

/**
 * Art8ConsentPanel — DSGVO Art. 8 Eltern-Einwilligung
 *
 * Shown per-child to parents/guardians.
 * Covers:
 *  - Art. 8: Parental consent status + confirmation via email token
 *  - Granular scopes: learning, analytics, marketing, personalization (all OFF by default)
 *  - Art. 13/14: What data we store and why (transparency notice)
 *  - Revocation (Art. 7 Abs. 3 DSGVO)
 *  - Annual re-consent reminder when expires_at < 30 days
 */

import { useState, useTransition } from 'react'
import {
  ShieldCheck, ShieldAlert, Shield, Mail, Check, Loader2,
  Info, ChevronDown, ChevronUp, RefreshCw, Trash2, AlertTriangle,
} from 'lucide-react'
import { format, formatDistanceToNow, isAfter, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

export interface ChildConsent {
  child_id: string
  child_name: string
  child_dob: string | null
  // parental_consent row (null if none yet)
  consent_id: string | null
  consent_version: string | null
  consented_at: string | null
  confirmed_at: string | null
  expires_at: string | null
  revoked_at: string | null
  scope_learning: boolean
  scope_analytics: boolean
  scope_marketing: boolean
  scope_personalization: boolean
}

interface Props {
  childConsents: ChildConsent[]
  userEmail: string
}

const SCOPE_CONFIG = [
  {
    key: 'scope_learning' as const,
    label: 'Lernfortschritt speichern',
    description: 'Aufgaben, abgeschlossene Lerneinheiten und Fortschrittsbalken werden für Ihr Kind gespeichert. Ohne diese Einwilligung startet das Kind bei jedem Login neu.',
    required: true,
    icon: '📚',
  },
  {
    key: 'scope_analytics' as const,
    label: 'Nutzungsstatistiken (anonym)',
    description: 'Anonyme Zähldaten (welche Bereiche wurden wie oft genutzt) helfen uns, die App zu verbessern. Kein personenbezogenes Profiling gemäß Art. 22 DSGVO.',
    required: false,
    icon: '📊',
  },
  {
    key: 'scope_personalization' as const,
    label: 'Personalisierung',
    description: 'Die App passt Schwierigkeitsgrad und Inhaltsvorschläge an den Lernstand Ihres Kindes an. Dazu werden Lernmuster innerhalb der App ausgewertet.',
    required: false,
    icon: '✨',
  },
  {
    key: 'scope_marketing' as const,
    label: 'Produktneuheiten per E-Mail',
    description: 'Informationen über neue Funktionen und Inhalte werden an Ihre E-Mail-Adresse gesendet. Abmeldung jederzeit möglich.',
    required: false,
    icon: '📧',
  },
]

const CONSENT_VERSION = '1.0'

export default function Art8ConsentPanel({ childConsents, userEmail }: Props) {
  const [consents, setConsents] = useState<ChildConsent[]>(childConsents)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    // Auto-expand children without confirmed consent
    Object.fromEntries(childConsents.map(c => [c.child_id, !c.confirmed_at]))
  )
  const [emailSent, setEmailSent] = useState<Record<string, boolean>>({})
  const [scopes, setScopes] = useState<Record<string, Record<string, boolean>>>(
    Object.fromEntries(
      childConsents.map(c => [c.child_id, {
        scope_learning: c.scope_learning,
        scope_analytics: c.scope_analytics,
        scope_marketing: c.scope_marketing,
        scope_personalization: c.scope_personalization,
      }])
    )
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<Record<string, string>>({})
  const [, startTransition] = useTransition()

  function toggle(childId: string) {
    setExpanded(e => ({ ...e, [childId]: !e[childId] }))
  }

  async function saveConsent(childId: string) {
    setSaving(s => ({ ...s, [childId]: true }))
    setError(e => ({ ...e, [childId]: '' }))
    try {
      const res = await fetch('/api/consent/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: childId,
          scopes: scopes[childId],
          consent_version: CONSENT_VERSION,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler beim Speichern')

      setConsents(prev => prev.map(c => c.child_id === childId
        ? { ...c, ...scopes[childId], consented_at: new Date().toISOString(), consent_version: CONSENT_VERSION }
        : c
      ))
    } catch (e: any) {
      setError(err => ({ ...err, [childId]: e.message }))
    }
    setSaving(s => ({ ...s, [childId]: false }))
  }

  async function sendConfirmEmail(childId: string) {
    setSaving(s => ({ ...s, [`email_${childId}`]: true }))
    try {
      const res = await fetch('/api/consent/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      })
      if (res.ok) setEmailSent(e => ({ ...e, [childId]: true }))
      else {
        const data = await res.json()
        setError(err => ({ ...err, [childId]: data.error ?? 'E-Mail konnte nicht gesendet werden' }))
      }
    } catch {
      setError(err => ({ ...err, [childId]: 'Netzwerkfehler' }))
    }
    setSaving(s => ({ ...s, [`email_${childId}`]: false }))
  }

  async function revokeConsent(childId: string) {
    if (!confirm('Möchten Sie die Einwilligung wirklich widerrufen? Dies kann nicht rückgängig gemacht werden.')) return
    setSaving(s => ({ ...s, [`revoke_${childId}`]: true }))
    try {
      const res = await fetch('/api/consent/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: childId }),
      })
      if (res.ok) {
        setConsents(prev => prev.map(c => c.child_id === childId
          ? { ...c, revoked_at: new Date().toISOString(), confirmed_at: null }
          : c
        ))
      }
    } catch { /* ignore */ }
    setSaving(s => ({ ...s, [`revoke_${childId}`]: false }))
  }

  if (consents.length === 0) {
    return (
      <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <Shield size={36} className="text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Kein Kind verknüpft
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Wenden Sie sich an die Kita, um ein Kind mit Ihrem Konto zu verknüpfen.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* DSGVO Art. 8 Info Box */}
      <div className="rounded-2xl p-4 bg-blue-50 dark:bg-blue-950/30 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Datenschutz für Minderjährige (Art. 8 DSGVO)</p>
          <p className="text-xs leading-relaxed">
            Da mindry kids für Kinder unter 16 Jahren angeboten wird, ist Ihre Einwilligung als Erziehungsberechtigte/r gesetzlich vorgeschrieben.
            Sie können Ihre Einwilligung jederzeit für einzelne Zwecke oder vollständig widerrufen (Art. 7 Abs. 3 DSGVO).
            Wir speichern nur die Daten, für die Sie ausdrücklich zugestimmt haben.
          </p>
        </div>
      </div>

      {consents.map(c => {
        const isOpen = expanded[c.child_id]
        const childScopes = scopes[c.child_id] ?? {}
        const isConfirmed = !!c.confirmed_at && !c.revoked_at
        const isRevoked = !!c.revoked_at
        const isPending = !!c.consented_at && !c.confirmed_at && !c.revoked_at
        const expiresAt = c.expires_at ? new Date(c.expires_at) : null
        const expiresSoon = expiresAt && isAfter(expiresAt, new Date()) && isAfter(subDays(expiresAt, 30), new Date()) === false

        return (
          <div
            key={c.child_id}
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            {/* Header */}
            <button
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => toggle(c.child_id)}
            >
              <div className="w-10 h-10 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                {c.child_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>{c.child_name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isConfirmed && !expiresSoon && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-green-600 font-medium">
                      <ShieldCheck size={11} /> Bestätigt
                    </span>
                  )}
                  {isConfirmed && expiresSoon && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                      <AlertTriangle size={11} /> Läuft bald ab
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                      <Mail size={11} /> E-Mail-Bestätigung ausstehend
                    </span>
                  )}
                  {isRevoked && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-red-500 font-medium">
                      <ShieldAlert size={11} /> Widerrufen
                    </span>
                  )}
                  {!c.consented_at && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                      <Shield size={11} /> Keine Einwilligung
                    </span>
                  )}
                  {expiresAt && isConfirmed && (
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      · gültig bis {format(expiresAt, 'd. MMM yyyy', { locale: de })}
                    </span>
                  )}
                </div>
              </div>
              {isOpen ? <ChevronUp size={16} className="flex-shrink-0 text-gray-400" /> : <ChevronDown size={16} className="flex-shrink-0 text-gray-400" />}
            </button>

            {/* Body */}
            {isOpen && (
              <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                {/* Expiry warning */}
                {expiresSoon && expiresAt && (
                  <div className="mt-4 flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Ihre Einwilligung läuft in{' '}
                      <strong>{formatDistanceToNow(expiresAt, { locale: de })}</strong> ab.
                      Bitte bestätigen Sie Ihre Einwilligung erneut, damit Ihr Kind weiterhin Zugang zur App hat.
                    </span>
                  </div>
                )}

                {/* Revoked notice */}
                {isRevoked && (
                  <div className="mt-4 flex gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-xs text-red-700 dark:text-red-300">
                    <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Einwilligung widerrufen am {format(new Date(c.revoked_at!), 'd. MMM yyyy', { locale: de })}.
                      Das Kind kann die App nicht mehr nutzen, bis Sie erneut zustimmen.
                    </span>
                  </div>
                )}

                {/* Pending email notice */}
                {isPending && (
                  <div className="mt-4 flex gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                    <Mail size={14} className="flex-shrink-0 mt-0.5" />
                    <span>
                      Bestätigungslink wurde an <strong>{userEmail}</strong> gesendet.
                      Bitte überprüfen Sie Ihr Postfach und klicken Sie den Link.
                    </span>
                  </div>
                )}

                {/* Scope toggles */}
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                    Einwilligungsumfang
                  </p>
                  {SCOPE_CONFIG.map(scope => (
                    <div key={scope.key} className="flex items-start gap-3">
                      <span className="text-lg leading-none mt-0.5 flex-shrink-0">{scope.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {scope.label}
                          </p>
                          {scope.required && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 rounded-full font-semibold">
                              Erforderlich
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                          {scope.description}
                        </p>
                      </div>
                      <button
                        disabled={scope.required}
                        onClick={() => setScopes(prev => ({
                          ...prev,
                          [c.child_id]: { ...prev[c.child_id], [scope.key]: !prev[c.child_id]?.[scope.key] },
                        }))}
                        className={`flex-shrink-0 relative w-11 h-6 rounded-full transition-colors ${
                          scope.required || childScopes[scope.key]
                            ? 'bg-brand-600'
                            : 'bg-gray-200 dark:bg-slate-700'
                        } ${scope.required ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                        title={scope.required ? 'Für die Nutzung der App erforderlich' : undefined}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          scope.required || childScopes[scope.key] ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Legal basis note */}
                <div className="text-[10px] leading-relaxed px-1" style={{ color: 'var(--color-text-muted)' }}>
                  Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) · Art. 8 DSGVO (Kinder) ·
                  Verantwortlicher: Hesselmann Beratung UG, Adlerstraße 1, 44137 Dortmund ·{' '}
                  <a href="/datenschutz" className="underline">Datenschutzerklärung</a>
                </div>

                {/* Error display */}
                {error[c.child_id] && (
                  <p className="text-xs text-red-600 dark:text-red-400">{error[c.child_id]}</p>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {/* Save / initial consent */}
                  <button
                    onClick={() => saveConsent(c.child_id)}
                    disabled={saving[c.child_id]}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60"
                  >
                    {saving[c.child_id] ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {c.consented_at ? 'Einwilligung aktualisieren' : 'Einwilligung erteilen'}
                  </button>

                  {/* Send confirmation email */}
                  {(isPending || (!isConfirmed && c.consented_at)) && (
                    <button
                      onClick={() => sendConfirmEmail(c.child_id)}
                      disabled={saving[`email_${c.child_id}`] || !!emailSent[c.child_id]}
                      className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                      {saving[`email_${c.child_id}`]
                        ? <Loader2 size={14} className="animate-spin" />
                        : emailSent[c.child_id]
                          ? <Check size={14} className="text-green-600" />
                          : <RefreshCw size={14} />}
                      {emailSent[c.child_id] ? 'E-Mail gesendet' : 'Bestätigungs-E-Mail erneut senden'}
                    </button>
                  )}

                  {/* Revoke */}
                  {(isConfirmed || isPending) && (
                    <button
                      onClick={() => revokeConsent(c.child_id)}
                      disabled={saving[`revoke_${c.child_id}`]}
                      className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-60"
                    >
                      {saving[`revoke_${c.child_id}`]
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                      Widerruf (Art. 7 Abs. 3 DSGVO)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
