'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share, Smartphone } from 'lucide-react'

const DISMISS_KEY = 'pwa-banner-dismissed-until'
const SNOOZE_DAYS = 7

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSSteps, setShowIOSSteps] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already running as installed PWA
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) return

    // Check if still in snooze window
    const until = localStorage.getItem(DISMISS_KEY)
    if (until && Date.now() < parseInt(until, 10)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    if (ios) {
      setIsIOS(true)
      // Show iOS banner after 3s to not be intrusive on first load
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
      // Show after 5s to not interrupt initial page load
      setTimeout(() => setVisible(true), 5000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function snooze() {
    const until = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(until))
    setVisible(false)
    setShowIOSSteps(false)
  }

  async function install() {
    if (!prompt) return
    setIsInstalling(true)
    prompt.prompt()
    const result = await prompt.userChoice
    if (result.outcome === 'accepted') {
      setVisible(false)
    } else {
      setIsInstalling(false)
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-[88px] left-4 right-4 z-40 max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300"
      role="complementary"
      aria-label="App installieren"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4 flex items-center gap-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0">
            <Smartphone size={22} className="text-white" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900">KitaHub als App installieren</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isIOS
                ? 'Zum Home-Bildschirm hinzufügen – schneller & offline verfügbar'
                : 'Schnellzugriff, Offline-Modus & Push-Benachrichtigungen'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isIOS ? (
              <button
                onClick={() => setShowIOSSteps(v => !v)}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Share size={12} /> Wie?
              </button>
            ) : (
              <button
                onClick={install}
                disabled={isInstalling}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60"
              >
                <Download size={12} />
                {isInstalling ? 'Installiere…' : 'Installieren'}
              </button>
            )}
            <button
              onClick={snooze}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Schließen"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* iOS Step-by-step instructions */}
        {showIOSSteps && (
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
            <p className="text-xs font-semibold text-gray-700 mb-2">So geht's auf iPhone/iPad:</p>
            {[
              { step: 1, text: 'Tippe auf das Teilen-Symbol (□↑) in der Safari-Menüleiste' },
              { step: 2, text: 'Scrolle nach unten und tippe auf „Zum Home-Bildschirm"' },
              { step: 3, text: 'Bestätige mit „Hinzufügen" – fertig!' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-2.5 text-xs text-gray-600">
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step}
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
