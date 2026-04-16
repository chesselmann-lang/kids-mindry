import Link from 'next/link'
import { Home, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <SearchX size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Seite nicht gefunden</h2>
        <p className="text-sm text-gray-500 mb-6">
          Diese Seite existiert nicht oder wurde verschoben.
        </p>
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium text-sm hover:bg-brand-700 transition-colors"
        >
          <Home size={16} />
          Zur Startseite
        </Link>
      </div>
    </div>
  )
}
