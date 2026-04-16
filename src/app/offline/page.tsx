import { WifiOff, Home } from 'lucide-react'
import Link from 'next/link'
import ReloadButton from './reload-button'

export const metadata = { title: 'Offline – KitaHub' }

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        {/* Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
          <WifiOff size={36} className="text-gray-400" />
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Keine Verbindung</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Es scheint, dass du offline bist. Bitte prüfe deine Internetverbindung
          und versuche es erneut.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <ReloadButton />
          <Link href="/feed" className="btn-secondary w-full justify-center">
            <Home size={16} />
            Zur Startseite
          </Link>
        </div>

        {/* Cached hint */}
        <p className="text-xs text-gray-400 mt-8">
          Einige Seiten sind möglicherweise noch aus dem Cache verfügbar.
        </p>
      </div>
    </div>
  )
}
