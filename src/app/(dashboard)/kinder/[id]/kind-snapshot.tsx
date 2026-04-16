'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Copy, Check, BrainCircuit } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Props {
  childId: string
  childName: string
}

export default function KindSnapshot({ childId, childName }: Props) {
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/kind-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })
      const data = await res.json()
      if (!res.ok || !data.snapshot) throw new Error('failed')
      setSnapshot(data.snapshot)
      setGeneratedAt(data.generatedAt ?? null)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copyText() {
    if (!snapshot) return
    navigator.clipboard.writeText(snapshot)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!snapshot && !loading) {
    return (
      <button
        onClick={generate}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center flex-shrink-0">
          <BrainCircuit size={18} className="text-indigo-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Snapshot erstellen</p>
          <p className="text-xs text-gray-400 mt-0.5">Aktuelles Entwicklungsprofil für {childName}</p>
        </div>
        <Sparkles size={14} className="text-indigo-400 flex-shrink-0" />
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-indigo-500" />
        <span className="text-sm">KI analysiert {childName}s Daten…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Fehler beim Generieren.
        <button onClick={generate} className="underline">Nochmal versuchen</button>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700">KI-Snapshot · {childName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyText} className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} className="text-indigo-500" />}
          </button>
          <button onClick={generate} className="p-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
            <RefreshCw size={13} className="text-indigo-500" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-700 leading-relaxed">{snapshot}</p>
        {generatedAt && (
          <p className="text-[10px] text-gray-400 mt-3">
            KI-generiert · {format(new Date(generatedAt), 'd. MMM, HH:mm', { locale: de })} · Letzte 14 Tage · Bitte eigenständig prüfen
          </p>
        )}
      </div>
    </div>
  )
}
