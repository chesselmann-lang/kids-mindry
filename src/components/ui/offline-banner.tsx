'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

/**
 * OfflineBanner
 *
 * Shows a banner at the top of the screen when the user goes offline.
 * Briefly shows a "back online" confirmation when connectivity is restored.
 */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false)
  const [justReconnected, setJustReconnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setOffline(!navigator.onLine)

    const handleOffline = () => {
      setOffline(true)
      setJustReconnected(false)
    }
    const handleOnline = () => {
      setOffline(false)
      setJustReconnected(true)
      setTimeout(() => setJustReconnected(false), 3000)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!mounted) return null

  if (offline) {
    return (
      <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium shadow-lg">
        <WifiOff size={13} className="flex-shrink-0" />
        <span>Keine Verbindung – Einige Funktionen sind eingeschränkt</span>
      </div>
    )
  }

  if (justReconnected) {
    return (
      <div className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-medium shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
        <Wifi size={13} className="flex-shrink-0" />
        <span>Wieder verbunden ✓</span>
      </div>
    )
  }

  return null
}
