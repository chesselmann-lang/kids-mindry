'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Clock, ChevronRight, CheckCircle, Lock, Unlock, BarChart2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface KindPanelProps {
  kindId: string
}

interface FachScore {
  fach: string
  icon: string
  fortschritt: number
  farbe: string
}

interface KindPanelData {
  name: string
  faecher: FachScore[]
  zeitBudgetMin: number
  zeitVerbrauchtMin: number
  naechsteUebung: string
  elternFreigabe: 'erteilt' | 'ausstehend' | 'abgelaufen'
}

const FACH_CONFIG: FachScore[] = [
  { fach: 'Sprache', icon: '🗣️', fortschritt: 65, farbe: 'bg-blue-500' },
  { fach: 'Zahlen', icon: '🔢', fortschritt: 40, farbe: 'bg-green-500' },
  { fach: 'Kreativität', icon: '🎨', fortschritt: 80, farbe: 'bg-purple-500' },
  { fach: 'Motorik', icon: '🏃', fortschritt: 55, farbe: 'bg-orange-500' },
]

export default function KindPanel({ kindId }: KindPanelProps) {
  const [data, setData] = useState<KindPanelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: child } = await supabase
          .from('children')
          .select('first_name, last_name')
          .eq('id', kindId)
          .single()

        setData({
          name: child ? `${(child as any).first_name} ${(child as any).last_name}` : 'Kind',
          faecher: FACH_CONFIG,
          zeitBudgetMin: 60,
          zeitVerbrauchtMin: 25,
          naechsteUebung: 'Buchstaben-Memo (Sprache)',
          elternFreigabe: 'erteilt',
        })
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [kindId])

  if (loading) return <PanelSkeleton />
  if (!data) return null

  const zeitPct = Math.round((data.zeitVerbrauchtMin / data.zeitBudgetMin) * 100)
  const zeitColor = zeitPct > 80 ? 'bg-red-500' : zeitPct > 60 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className="p-4 space-y-5">
      {/* Name */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center text-xs font-bold">
          {data.name.slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{data.name}</p>
          <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Lernprofil</p>
        </div>
      </div>

      {/* Lernfortschritt pro Fach */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 size={14} className="text-brand-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Lernfortschritt</span>
        </div>
        <div className="space-y-2.5">
          {data.faecher.map(f => (
            <div key={f.fach}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{f.icon} {f.fach}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{f.fortschritt}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-3)' }}>
                <div className={`h-2 rounded-full ${f.farbe}`} style={{ width: `${f.fortschritt}%`, transition: 'width 0.7s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zeit-Budget */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock size={14} className="text-amber-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Zeit-Budget heute</span>
        </div>
        <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: 'var(--color-text-secondary)' }}>{data.zeitVerbrauchtMin} Min verbraucht</span>
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>max. {data.zeitBudgetMin} Min</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-3)' }}>
            <div className={`h-2.5 rounded-full ${zeitColor}`} style={{ width: `${zeitPct}%`, transition: 'width 0.7s ease' }} />
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {data.zeitBudgetMin - data.zeitVerbrauchtMin} Min verbleibend
          </p>
        </div>
      </div>

      {/* Nächste Übung */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={14} className="text-green-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Nächste Übung</span>
        </div>
        <Link
          href={`/lerninhalte`}
          className="flex items-center justify-between p-3 rounded-xl border hover:border-brand-300 transition-colors"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{data.naechsteUebung}</span>
          <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
        </Link>
      </div>

      {/* Elternfreigabe */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {data.elternFreigabe === 'erteilt' ? <Unlock size={14} className="text-green-600" /> : <Lock size={14} className="text-amber-600" />}
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Elternfreigabe</span>
        </div>
        <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${
          data.elternFreigabe === 'erteilt'
            ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800'
        }`}>
          <CheckCircle size={14} className={data.elternFreigabe === 'erteilt' ? 'text-green-600' : 'text-amber-600'} />
          <span className={`text-xs font-semibold ${data.elternFreigabe === 'erteilt' ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
            {data.elternFreigabe === 'erteilt' ? 'Freigabe erteilt' : 'Freigabe ausstehend'}
          </span>
        </div>
      </div>
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-slate-700" />)}
    </div>
  )
}
