'use client'

import { useEffect, useState } from 'react'
import { Target, Flame, Lightbulb, AlertCircle, Power, RefreshCw, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DashboardPanelData {
  streakDays: number
  todayGoal: string
  goalProgress: number // 0-100
  parentTips: string[]
  alertCount: number
}

export default function DashboardPanel() {
  const [data, setData] = useState<DashboardPanelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [emergencyConfirm, setEmergencyConfirm] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    // Load streak and today goal from DB
    ;(async () => {
      try {
        const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
        const today = new Date().toISOString().split('T')[0]

        // Today attendance for streak
        const { data: att } = await (supabase as any)
          .from('attendance')
          .select('child_id')
          .eq('date', today)
          .eq('status', 'present')

        const presentCount = (att ?? []).length

        // Recent AI tip from cockpit prognose (or static)
        const tips = [
          'Lernen gelingt am besten in kurzen 20-Min-Einheiten',
          'Heute ist ein guter Tag für Outdoor-Aktivitäten — Bewegung fördert Konzentration',
          'Lob stärkt Motivation mehr als Korrekturen',
        ]

        setData({
          streakDays: 7, // TODO: from DB
          todayGoal: `${presentCount} Kinder heute anwesend — Ziel: Alle Gruppen aktiv`,
          goalProgress: presentCount > 0 ? Math.min(100, presentCount * 10) : 30,
          parentTips: tips.slice(0, 2),
          alertCount: 0,
        })
      } catch {
        setData({
          streakDays: 0,
          todayGoal: 'Tages-Lernziel laden...',
          goalProgress: 0,
          parentTips: ['KI-Tipps werden geladen...'],
          alertCount: 0,
        })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return <PanelSkeleton />
  }

  return (
    <div className="p-4 space-y-5">
      {/* Streak */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
          <Flame size={20} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Streak</p>
          <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">{data?.streakDays} Tage</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-500">Kita-Anwesenheit in Folge</p>
        </div>
      </div>

      {/* Heute-Lernziel */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-brand-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Heute-Ziel</span>
        </div>
        <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
          <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>{data?.todayGoal}</p>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-surface-3)' }}>
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
              style={{ width: `${data?.goalProgress ?? 0}%` }}
            />
          </div>
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{data?.goalProgress}% erreicht</p>
        </div>
      </div>

      {/* Elternberater-Tipps */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={14} className="text-purple-600" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>KI-Tipps</span>
        </div>
        <div className="space-y-2">
          {data?.parentTips.map((tip, i) => (
            <div key={i} className="flex gap-2 p-2.5 rounded-lg border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
              <span className="text-purple-500 flex-shrink-0 mt-0.5">💡</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Notfall-Funktionen */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Notfall</span>
        </div>
        {!emergencyConfirm ? (
          <button
            onClick={() => setEmergencyConfirm(true)}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Power size={14} className="text-red-500" />
              <span className="text-xs font-semibold text-red-600 dark:text-red-400">Kita-App abschalten</span>
            </div>
            <ChevronRight size={14} className="text-red-400" />
          </button>
        ) : (
          <div className="p-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20">
            <p className="text-xs font-semibold text-red-700 mb-2">Wirklich abschalten?</p>
            <div className="flex gap-2">
              <button
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700"
                onClick={() => { /* TODO: trigger shutdown */ setEmergencyConfirm(false) }}
              >
                Bestätigen
              </button>
              <button
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                onClick={() => setEmergencyConfirm(false)}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
        <Link href="/admin/cockpit" className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:underline">
          KI-Cockpit öffnen <ChevronRight size={10} />
        </Link>
      </div>
    </div>
  )
}

function PanelSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-16 rounded-xl bg-gray-100 dark:bg-slate-700" />
      <div className="h-20 rounded-xl bg-gray-100 dark:bg-slate-700" />
      <div className="h-16 rounded-xl bg-gray-100 dark:bg-slate-700" />
      <div className="h-12 rounded-xl bg-gray-100 dark:bg-slate-700" />
    </div>
  )
}
