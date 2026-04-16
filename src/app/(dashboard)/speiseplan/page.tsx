import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight, Leaf, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import SpeiseplanEditor from './speiseplan-editor'
import AiSpeiseplanAnalyse from './ai-speiseplan-analyse'

export const metadata = { title: 'Speiseplan' }

const DAYS = [
  { key: 'monday',    label: 'Montag' },
  { key: 'tuesday',   label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday',  label: 'Donnerstag' },
  { key: 'friday',    label: 'Freitag' },
]

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Frühstück', emoji: '🥐' },
  { key: 'lunch',     label: 'Mittagessen', emoji: '🍽️' },
  { key: 'snack',     label: 'Nachmittagssnack', emoji: '🍎' },
]

function getMondayOfWeek(offset = 0): Date {
  const now = new Date()
  const day = now.getDay() // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day // adjust so Monday = 0
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function formatWeekStart(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatWeekLabel(date: Date): string {
  const end = new Date(date)
  end.setDate(date.getDate() + 4)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
  return `${date.toLocaleDateString('de-DE', opts)} – ${end.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

export default async function SpeiseplanPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Determine the week to show
  // If searchParams.week provided (YYYY-MM-DD), use it; else use current week
  let weekStart: Date
  if (searchParams.week) {
    weekStart = new Date(searchParams.week + 'T00:00:00')
  } else {
    weekStart = getMondayOfWeek(0)
  }

  const weekStartStr = formatWeekStart(weekStart)
  const prevWeekStr = formatWeekStart(new Date(weekStart.getTime() - 7 * 86400000))
  const nextWeekStr = formatWeekStart(new Date(weekStart.getTime() + 7 * 86400000))

  // Load menu entries for this week
  const { data: entries } = await supabase
    .from('weekly_menus')
    .select('*')
    .eq('site_id', siteId)
    .eq('week_start', weekStartStr)

  // Build a nested map: day → meal_type → entry
  const menuMap: Record<string, Record<string, {
    id: string
    title: string
    description: string
    is_vegetarian: boolean
    is_vegan: boolean
  }>> = {}

  for (const e of entries ?? []) {
    if (!menuMap[e.day]) menuMap[e.day] = {}
    menuMap[e.day][e.meal_type] = {
      id: e.id,
      title: e.title,
      description: e.description ?? '',
      is_vegetarian: e.is_vegetarian,
      is_vegan: e.is_vegan,
    }
  }

  const hasAnyEntry = (entries ?? []).length > 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Speiseplan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Wöchentlicher Mahlzeitenplan der Kita</p>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/speiseplan?week=${prevWeekStr}`}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </Link>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">KW {getWeekNumber(weekStart)}</p>
          <p className="text-xs text-gray-400">{formatWeekLabel(weekStart)}</p>
        </div>
        <Link
          href={`/speiseplan?week=${nextWeekStr}`}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </Link>
      </div>

      {/* AI Speiseplan Analyse — staff only */}
      <AiSpeiseplanAnalyse weekStart={weekStartStr} isStaff={isStaff} />

      {/* Staff: editable view */}
      {isStaff ? (
        <SpeiseplanEditor
          siteId={siteId}
          weekStart={weekStartStr}
          initialMenu={menuMap}
        />
      ) : (
        /* Parent: read-only view */
        !hasAnyEntry ? (
          <div className="card p-10 text-center">
            <UtensilsCrossed size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Noch kein Speiseplan für diese Woche</p>
            <p className="text-xs text-gray-400 mt-1">Das Kita-Team wird den Plan bald eintragen</p>
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS.map(({ key: dayKey, label: dayLabel }) => {
              const dayEntries = menuMap[dayKey]
              if (!dayEntries || Object.keys(dayEntries).length === 0) return null
              return (
                <div key={dayKey} className="card overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-semibold text-sm text-gray-800">{dayLabel}</h3>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {MEAL_TYPES.map(({ key: mealKey, label: mealLabel, emoji }) => {
                      const entry = dayEntries[mealKey]
                      if (!entry) return null
                      return (
                        <div key={mealKey} className="px-4 py-3 flex items-start gap-3">
                          <span className="text-base mt-0.5">{emoji}</span>
                          <div>
                            <p className="text-xs text-gray-400 font-medium mb-0.5">{mealLabel}</p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                              {entry.is_vegan && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                  <Leaf size={9} /> Vegan
                                </span>
                              )}
                              {!entry.is_vegan && entry.is_vegetarian && (
                                <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                  <Leaf size={9} /> Vegetarisch
                                </span>
                              )}
                            </div>
                            {entry.description && <p className="text-xs text-gray-400 mt-0.5">{entry.description}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
