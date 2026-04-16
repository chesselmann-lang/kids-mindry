'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Copy, Check } from 'lucide-react'

interface Props {
  month: string       // 'yyyy-MM'
  monthLabel: string  // e.g. 'April 2026'
}

export default function AiMonatsbrief({ month, monthLabel }: Props) {
  const [text, setText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/monatsbrief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month }),
      })
      const data = await res.json()
      if (!res.ok || !data.text) throw new Error('failed')
      setText(data.text)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function copyText() {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!text && !loading) {
    return (
      <button
        onClick={generate}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow group"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Monatsbrief generieren</p>
          <p className="text-xs text-gray-400 mt-0.5">Newsletter-Text für {monthLabel}</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-blue-500" />
        <span className="text-sm">KI schreibt Monatsrückblick für {monthLabel}…</span>
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
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-violet-50 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-500" />
          <span className="text-xs font-semibold text-blue-700">KI-Monatsbrief · {monthLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyText} className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} className="text-blue-500" />}
          </button>
          <button onClick={generate} className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            <RefreshCw size={13} className="text-blue-500" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{text}</p>
        <p className="text-[10px] text-gray-400 mt-3">KI-generiert auf Basis der Kita-Daten · Bitte vor dem Versenden prüfen</p>
      </div>
    </div>
  )
}
