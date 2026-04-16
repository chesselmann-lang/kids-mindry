'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Vorschlag { label: string; query: string; icon: string }
interface Result { vorschlaege: Vorschlag[] }

export default function AiSuche() {
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (tried) return
    setTried(true)
    setLoading(true)
    fetch('/api/ai/suche-vorschlaege')
      .then(r => r.json())
      .then(data => setResult(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tried])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-gray-400">
        <Loader2 size={13} className="animate-spin" />
        <span className="text-xs">KI-Vorschläge laden…</span>
      </div>
    )
  }

  if (!result?.vorschlaege?.length) return null

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Sparkles size={13} className="text-brand-500" />
        <span className="text-xs font-semibold text-gray-500">Vorschläge für Sie</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {result.vorschlaege.map((v, i) => (
          <button
            key={i}
            onClick={() => router.push(`/suche?q=${encodeURIComponent(v.query)}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-700 transition-colors text-xs font-medium text-gray-700"
          >
            <Search size={11} />
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
