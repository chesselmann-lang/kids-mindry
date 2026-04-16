'use client'

import { useState } from 'react'
import { Sparkles, Loader2, RefreshCw } from 'lucide-react'

interface Result {
  zusammenfassung: string
  highlights: string[]
  hinweis: string
  stats: { total: number; done: number; moodCounts: Record<string, number> }
}

const MOOD_EMOJI: Record<string, string> = {
  great: '😄', good: '🙂', okay: '😐', sad: '😢', sick: '🤒',
}

export default function AiTagesberichteUeberblick() {
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState('')

  async function analyse() {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/ai/tagesberichte-ueberblick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error('failed')
      if (data.message) { setMessage(data.message); setLoaded(true); return }
      setResult(data)
      setLoaded(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!loaded && !loading) {
    return (
      <button
        onClick={analyse}
        className="w-full flex items-center gap-3 card p-4 hover:shadow-card-hover transition-shadow"
      >
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-orange-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm text-gray-900">KI-Tagesüberblick</p>
          <p className="text-xs text-gray-400 mt-0.5">Heutige Stimmungen & Aktivitäten zusammenfassen</p>
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="card p-4 flex items-center gap-3 text-gray-400">
        <Loader2 size={16} className="animate-spin text-orange-500" />
        <span className="text-sm">KI analysiert heutige Tagesberichte…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-4 text-sm text-red-600 bg-red-50 border border-red-200 flex items-center gap-2">
        Fehler. <button onClick={analyse} className="underline">Nochmal</button>
      </div>
    )
  }

  if (message && !result) {
    return (
      <div className="card p-4 text-sm text-gray-500 bg-gray-50 flex items-center justify-between">
        <span>{message}</span>
        <button onClick={analyse} className="p-1 hover:text-orange-600">
          <RefreshCw size={13} />
        </button>
      </div>
    )
  }

  if (!result) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-orange-500" />
          <span className="text-xs font-semibold text-orange-700">KI-Tagesüberblick · {result.stats.done}/{result.stats.total} Berichte</span>
        </div>
        <button onClick={analyse} className="p-1.5 rounded-lg hover:bg-orange-100 transition-colors">
          <RefreshCw size={13} className="text-orange-500" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Mood pills */}
        {Object.keys(result.stats.moodCounts).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(result.stats.moodCounts).map(([mood, count]) => (
              <span key={mood} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {MOOD_EMOJI[mood] ?? '😶'} {count}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-gray-700 leading-relaxed">{result.zusammenfassung}</p>

        {result.highlights?.length > 0 && (
          <div className="space-y-1">
            {result.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-orange-400 mt-0.5">✦</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {result.hinweis && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-xs text-blue-700">
            💡 {result.hinweis}
          </div>
        )}

        <p className="text-[10px] text-gray-400 pt-1">KI-generiert · Auf Basis der heutigen Tagesberichte</p>
      </div>
    </div>
  )
}
