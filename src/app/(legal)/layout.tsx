import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/profil" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900">KitaHub</span>
        </div>
        {children}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-xs text-gray-400">
          <Link href="/impressum" className="hover:text-brand-600">Impressum</Link>
          <Link href="/datenschutzerklaerung" className="hover:text-brand-600">Datenschutz</Link>
          <Link href="/agb" className="hover:text-brand-600">AGB</Link>
          <span>© 2026 Hesselmann Beratung UG</span>
        </div>
      </div>
    </div>
  )
}
