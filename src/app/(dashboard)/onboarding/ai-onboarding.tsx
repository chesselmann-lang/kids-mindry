'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface Hinweis { typ: 'willkommen' | 'tipp' | 'funktion'; text: string }
interface Result { hinweise: Hinweis[] }

const TYP_CONFIG = {
  willkommen: { dot: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-900' },
  tipp:       { dot: 'bg-brand-500',  bg: 'bg-brand-50',  text: 'text-brand-800'  },
  funktion:   { dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-800'  },
}

export default function AiOnboarding({ childName }: { childName?: string }) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    const params = childName ? `?name=${encodeURIComponent(childName)}` : ''
    fetch(`/api/ai/onboarding-willkommen${params}`)
      .then(r => r.json())
      .then(d => setResult(d))
      .catch(() => {})
  }, [childName])

  if (!result) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #3b82f6 100%)' }}>
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-800">KI-Willkommen</p>
            <p className="text-[10px] text-gray-400">Ihre ersten Schritte in der Kita-App</p>
          </div>
        </div>
        <div className="space-y-2">
          {result.hinweise.map((h, i) => {
            const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.tipp
            return (
              <div key={i} className={`flex gap-2 items-start p-2.5 rounded-xl ${cfg.bg}`}>
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                <p className={`text-xs leading-relaxed ${cfg.text}`}>{h.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
