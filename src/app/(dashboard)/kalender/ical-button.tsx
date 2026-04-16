'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function ICalButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch('/api/kalender-export')
      if (!res.ok) throw new Error('Export fehlgeschlagen')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'kitahub-kalender.ics'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
      title="Als iCal exportieren"
    >
      {loading
        ? <Loader2 size={14} className="animate-spin" />
        : <Download size={14} />}
      iCal
    </button>
  )
}
