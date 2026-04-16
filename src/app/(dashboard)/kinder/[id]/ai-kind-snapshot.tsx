'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import AiWidgetShell from '@/components/ui/ai-widget-shell'

const GRADIENT = 'linear-gradient(135deg, #8b5cf6, #3b82f6)'

const TYP_CONFIG: Record<string, { dot: string; bg: string; border: string; text: string }> = {
  beobachtung: { dot: 'bg-violet-500', bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-800' },
  empfehlung:  { dot: 'bg-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-800' },
  info:        { dot: 'bg-blue-500',   bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-800' },
}

export default function AiKindSnapshot({ childId }: { childId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/ai/kind-snapshot?childId=${childId}`)
      if (!res.ok) throw new Error(await res.text())
      setData(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AiWidgetShell
      gradient={GRADIENT}
      Icon={Sparkles}
      title="KI-Einschätzung"
      subtitle="Pädagogische Analyse (Tagesberichte & Attendance)"
      data={data}
      loading={loading}
      error={error}
      loadLabel="Kind analysieren"
      loadingLabel="Erstelle pädagogische Einschätzung…"
      onLoad={load}
      headerBadges={data && (
        <>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
            {data.stats.presentDays}d anwesend
          </span>
          {data.stats.sickDays > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {data.stats.sickDays}d krank
            </span>
          )}
        </>
      )}
    >
      {data && (
        <div className="space-y-2">
          {(data.hinweise as any[]).map((h: any, i: number) => {
            const cfg = TYP_CONFIG[h.typ] ?? TYP_CONFIG.info
            return (
              <div key={i} className={`flex gap-2.5 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                <p className={`text-xs leading-relaxed ${cfg.text}`}>{h.text}</p>
              </div>
            )
          })}
          <p className="text-[10px] text-gray-300 mt-1">KI-Einschätzung · Keine pädagogische Diagnose</p>
        </div>
      )}
    </AiWidgetShell>
  )
}
