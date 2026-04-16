'use client'

import { useState } from 'react'
import { Download, Loader2, ShieldCheck } from 'lucide-react'

interface Props {
  childId: string
  childName: string
}

/**
 * DSGVO Art. 20 Daten-Export Button.
 * Löst einen ZIP-Download mit allen personenbezogenen Daten des Kindes aus.
 * Nur für Admins/Gruppenleiter sichtbar (Backend erzwingt Berechtigung).
 */
export default function DsgvoExportButton({ childId, childName }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function download() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/dsgvo-kind-export?childId=${childId}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Fehler beim Export' }))
        throw new Error(body.error ?? 'Unbekannter Fehler')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `dsgvo_export_${childName.replace(/\s+/g, '_')}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={download}
        disabled={loading}
        aria-label={`DSGVO-Daten von ${childName} exportieren`}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors text-sm font-medium text-gray-700"
      >
        {loading
          ? <Loader2 size={14} className="animate-spin text-gray-400" />
          : <ShieldCheck size={14} className="text-gray-500" />
        }
        <span>{loading ? 'Wird exportiert…' : 'Daten exportieren (DSGVO)'}</span>
        {!loading && <Download size={12} className="text-gray-400 ml-auto" />}
      </button>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      <p className="text-[10px] text-gray-400">
        Art. 20 DSGVO · ZIP mit allen personenbezogenen Daten · Nur für Admins
      </p>
    </div>
  )
}
