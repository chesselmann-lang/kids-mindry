'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface Hinweis { typ: 'begruessung' | 'impuls'; text: string }
interface Result { hinweise: Hinweis[] }

const TYP_CONFIG = {
  begruessung: { dot: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-900' },
  impuls:      { dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-800'  },
}

export default function AiCheckin({ childName }: { childName: string }) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    fetch(`/api/ai/checkin-begruessung?name=${encodeURIComponent(childName)}`)
      .then(r => r.json())
      .then(d => setResult(d))
      .catch(() => {})
  }, [childName])

  if (!result) return null

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #34d399 100%)' }}>
      <div className="m-0.5 rounded-[14px] bg-white px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #34d399 100%)' }}>
            <Sparkles size={12} className="text-white" />
          </div>
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">KI-Tagesimpuls</p>
        </div>
        <div className="space-y-1.5">
          {result.hinweise.map((h, i) => {
            const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.impuls
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
