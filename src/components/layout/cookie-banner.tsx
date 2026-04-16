'use client'
// src/components/layout/cookie-banner.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ analytics: true, ts: Date.now() }))
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', JSON.stringify({ analytics: false, ts: Date.now() }))
    // Sentry deaktivieren
    if (typeof window !== 'undefined' && (window as any).__sentryDisabled !== true) {
      (window as any).__sentryDisabled = true
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe print:hidden">
      <div className="mx-4 mb-4 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 max-w-lg md:mx-auto">
        <p className="text-sm text-gray-700 mb-1 font-medium">🍪 Cookies & Datenschutz</p>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Wir verwenden technisch notwendige Cookies für den Betrieb der App sowie optionale Fehler-Monitoring-Cookies (Sentry) zur Verbesserung der Stabilität.{' '}
          <Link href="/datenschutz-kitahub" className="underline text-gray-700 hover:text-gray-900">Datenschutzerklärung</Link>
        </p>
        <div className="flex gap-3">
          <button
            onClick={decline}
            className="flex-1 text-sm py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Ablehnen
          </button>
          <button
            onClick={accept}
            className="flex-1 text-sm py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  )
}
