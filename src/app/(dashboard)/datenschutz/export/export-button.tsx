'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

export default function DsgvoExportButton() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const res = await fetch('/api/dsgvo-export')
      if (!res.ok) throw new Error('Export fehlgeschlagen')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const match = disposition.match(/filename="([^"]+)"/)
      a.download = match?.[1] ?? 'dsgvo_export.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Export fehlgeschlagen. Bitte versuchen Sie es erneut.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
      {loading
        ? <><Loader2 size={16} className="animate-spin" /> Erstelle Export…</>
        : <><Download size={16} /> Daten herunterladen (JSON)</>}
    </button>
  )
}
