'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
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
    <html lang="de">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Etwas ist schiefgelaufen</h1>
            <p className="text-sm text-gray-500 mb-6">
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium text-sm hover:bg-brand-700 transition-colors"
            >
              <RefreshCw size={16} />
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
