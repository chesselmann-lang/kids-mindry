'use client'

/**
 * ConsentBanner — Cookie & Tracking Consent Banner
 *
 * Child-friendly language (simple German, emoji support).
 * Declining optional cookies requires the Eltern-PIN (Art. 8 DSGVO).
 * Only analytics and marketing are "optional" — functional cookies are always on.
 *
 * Storage: localStorage key 'mindry_consent_v1'
 *   { analytics: boolean, marketing: boolean, personalization: boolean, timestamp: string }
 *
 * Usage: Mount once in the layout. Hides itself after consent is given.
 */

import { useState, useEffect } from 'react'
import { Shield, Check, Loader2, X } from 'lucide-react'

type ConsentPrefs = {
  analytics: boolean
  marketing: boolean
  personalization: boolean
  timestamp: string
}

const CONSENT_KEY = 'mindry_consent_v1'

function loadSavedConsent(): ConsentPrefs | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Expire consent after 365 days
    if (new Date(parsed.timestamp) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) return null
    return parsed
  } catch {
    return null
  }
}

function saveConsent(prefs: Omit<ConsentPrefs, 'timestamp'>) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...prefs, timestamp: new Date().toISOString() }))
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [pinChecking, setPinChecking] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false, personalization: false })

  useEffect(() => {
    const saved = loadSavedConsent()
    if (!saved) setVisible(true)
  }, [])

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true, personalization: true })
    setVisible(false)
  }

  function acceptRequired() {
    saveConsent({ analytics: false, marketing: false, personalization: false })
    setVisible(false)
  }

  function saveCustom() {
    saveConsent(prefs)
    setVisible(false)
    setShowPinModal(false)
  }

  // Declining optional cookies requires Eltern-PIN (art. 8 protection)
  async function handleDeclineOrCustom() {
    if (prefs.analytics || prefs.marketing || prefs.personalization) {
      // Custom selection with some enabled — no PIN needed
      saveCustom()
    } else {
      // All optional off — require PIN
      setShowPinModal(true)
    }
  }

  async function verifyPinAndDecline() {
    if (pin.length !== 4 || pinChecking) return
    setPinChecking(true)
    try {
      const res = await fetch('/api/eltern-pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (data.valid) {
        setPinError(false)
        saveCustom()
      } else {
        setPinError(true)
        setPin('')
      }
    } catch {
      setPinError(true)
      setPin('')
    }
    setPinChecking(false)
  }

  if (!visible) return null

  return (
    <>
      {/* Backdrop blur overlay */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]" />

      {/* Banner */}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-auto px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Datenschutz-Einstellungen"
      >
        <div
          className="rounded-3xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {/* Header */}
          <div className="bg-brand-600 px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Dein Datenschutz bei mindry kids 🔒</p>
              <p className="text-white/70 text-xs">Wir fragen erst, bevor wir etwas speichern</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            {!showCustomize ? (
              <>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  🍪 Wir nutzen <strong style={{ color: 'var(--color-text-primary)' }}>notwendige Cookies</strong> damit die App funktioniert.
                  Zusätzlich möchten wir optionale Cookies für Analysen und Verbesserungen nutzen.
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Da du ein Kind bist: Deine Eltern müssen mit ihrem PIN bestätigen,
                  wenn du alle optionalen Cookies ablehnen möchtest. 👪
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={acceptAll}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors flex-1 sm:flex-none justify-center"
                  >
                    <Check size={14} />
                    Alle akzeptieren
                  </button>
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex-1 sm:flex-none justify-center"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    Anpassen
                  </button>
                </div>
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  <a href="/datenschutz" className="underline">Datenschutzerklärung</a>
                  {' · '}
                  <a href="/impressum" className="underline">Impressum</a>
                  {' · '}
                  Hesselmann Beratung UG · Art. 8 DSGVO
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Cookie-Einstellungen anpassen
                </p>
                {/* Required — always on */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 rounded-full bg-brand-600 relative flex-shrink-0 cursor-not-allowed">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Notwendige Cookies <span className="font-normal text-gray-400">(immer aktiv)</span>
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Login, Sicherheit, App-Funktion</p>
                  </div>
                </div>
                {/* Analytics */}
                {[
                  { key: 'analytics', label: 'Analyse-Cookies', desc: 'Anonyme Nutzungsstatistiken' },
                  { key: 'personalization', label: 'Personalisierung', desc: 'Inhalte anpassen' },
                  { key: 'marketing', label: 'Marketing', desc: 'Produkt-Neuigkeiten per E-Mail' },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-3">
                    <button
                      onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                        prefs[item.key as keyof typeof prefs] ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        prefs[item.key as keyof typeof prefs] ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleDeclineOrCustom}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors flex-1 justify-center"
                  >
                    <Check size={14} />
                    Auswahl speichern
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                  >
                    Alle akzeptieren
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Eltern-PIN modal (required to decline all optional cookies) */}
      {showPinModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClick={() => { setShowPinModal(false); setPin('') }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative rounded-3xl p-6 w-full max-w-xs shadow-2xl"
            style={{ backgroundColor: 'var(--color-surface)' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => { setShowPinModal(false); setPin('') }} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">
              <X size={16} className="text-gray-400" />
            </button>
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-3">
                <Shield size={28} className="text-brand-600" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Eltern-Bestätigung</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Um alle optionalen Cookies abzulehnen, müssen die Eltern mit ihrem PIN bestätigen.
              </p>
            </div>
            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-4">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-4 h-4 rounded-full transition-all ${
                  pinChecking ? 'bg-brand-400 animate-pulse' : pin.length > i ? pinError ? 'bg-red-500' : 'bg-brand-600' : 'border-2 border-gray-300 dark:border-slate-600'
                }`} />
              ))}
            </div>
            {pinError && <p className="text-center text-xs text-red-500 mb-3">Falscher PIN</p>}
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
                <button
                  key={i}
                  disabled={k === '' || pinChecking}
                  onClick={() => {
                    if (k === '⌫') { setPin(p => p.slice(0, -1)); setPinError(false) }
                    else if (typeof k === 'number' && pin.length < 4) {
                      const next = pin + k
                      setPin(next)
                      setPinError(false)
                      if (next.length === 4) setTimeout(() => verifyPinAndDecline(), 150)
                    }
                  }}
                  className={`h-14 rounded-2xl text-xl font-semibold transition-colors
                    ${k === '' ? 'opacity-0 pointer-events-none' : pinChecking ? 'opacity-40' : 'hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95'}`}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {k === '⌫' ? '⌫' : k}
                </button>
              ))}
            </div>
            {pinChecking && (
              <div className="flex items-center justify-center gap-2 mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <Loader2 size={12} className="animate-spin" /> Prüfe…
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
