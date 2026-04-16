'use client'

import { RefreshCw } from 'lucide-react'

export default function ReloadButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="btn-primary w-full justify-center"
    >
      <RefreshCw size={16} />
      Erneut versuchen
    </button>
  )
}
