'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
    >
      <Printer size={16} /> Drucken / PDF
    </button>
  )
}
