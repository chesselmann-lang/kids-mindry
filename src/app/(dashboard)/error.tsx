'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Seite konnte nicht geladen werden</h2>
        <p className="text-sm text-gray-500 mb-6">
          Ein Fehler ist aufgetreten. Bitte versuche es erneut oder gehe zur Startseite.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">Fehler-ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium text-sm hover:bg-brand-700 transition-colors"
          >
            <RefreshCw size={15} />
            Erneut versuchen
          </button>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            <Home size={15} />
            Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
