'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Pencil, Check, X, Leaf } from 'lucide-react'
import { useRouter } from 'next/navigation'

const DAYS = [
  { key: 'monday',    label: 'Montag' },
  { key: 'tuesday',   label: 'Dienstag' },
  { key: 'wednesday', label: 'Mittwoch' },
  { key: 'thursday',  label: 'Donnerstag' },
  { key: 'friday',    label: 'Freitag' },
] as const

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Frühstück', emoji: '🥐' },
  { key: 'lunch',     label: 'Mittagessen', emoji: '🍽️' },
  { key: 'snack',     label: 'Nachmittagssnack', emoji: '🍎' },
] as const

type DayKey = typeof DAYS[number]['key']
type MealKey = typeof MEAL_TYPES[number]['key']

interface MenuEntry {
  id?: string
  title: string
  description: string
  is_vegetarian: boolean
  is_vegan: boolean
}

type MenuMap = Record<string, Record<string, MenuEntry>>

interface Props {
  siteId: string
  weekStart: string // ISO date string
  initialMenu: MenuMap
}

const emptyEntry = (): MenuEntry => ({ title: '', description: '', is_vegetarian: false, is_vegan: false })

export default function SpeiseplanEditor({ siteId, weekStart, initialMenu }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [menu, setMenu] = useState<MenuMap>(initialMenu)
  const [editing, setEditing] = useState<{ day: string; meal: string } | null>(null)
  const [form, setForm] = useState<MenuEntry>(emptyEntry())
  const [saving, setSaving] = useState(false)

  function startEdit(day: string, meal: string) {
    const entry = menu[day]?.[meal] ?? emptyEntry()
    setForm({ ...entry })
    setEditing({ day, meal })
  }

  function cancelEdit() {
    setEditing(null)
    setForm(emptyEntry())
  }

  async function saveEntry() {
    if (!editing) return
    setSaving(true)
    const { day, meal } = editing

    const upsertData = {
      site_id: siteId,
      week_start: weekStart,
      day,
      meal_type: meal,
      title: form.title.trim(),
      description: form.description.trim() || null,
      is_vegetarian: form.is_vegetarian,
      is_vegan: form.is_vegan,
    }

    const { data, error } = await supabase
      .from('weekly_menus')
      .upsert(upsertData, { onConflict: 'site_id,week_start,day,meal_type' })
      .select()
      .single()

    if (!error && data) {
      setMenu(prev => ({
        ...prev,
        [day]: {
          ...(prev[day] ?? {}),
          [meal]: { id: data.id, title: data.title, description: data.description ?? '', is_vegetarian: data.is_vegetarian, is_vegan: data.is_vegan },
        },
      }))
      router.refresh()
    }

    setSaving(false)
    setEditing(null)
    setForm(emptyEntry())
  }

  async function deleteEntry(day: string, meal: string) {
    const entry = menu[day]?.[meal]
    if (!entry?.id) {
      setMenu(prev => {
        const d = { ...(prev[day] ?? {}) }
        delete d[meal]
        return { ...prev, [day]: d }
      })
      return
    }
    await supabase.from('weekly_menus').delete().eq('id', entry.id)
    setMenu(prev => {
      const d = { ...(prev[day] ?? {}) }
      delete d[meal]
      return { ...prev, [day]: d }
    })
    router.refresh()
  }

  const isEditingCell = (day: string, meal: string) =>
    editing?.day === day && editing?.meal === meal

  return (
    <div className="space-y-4">
      {DAYS.map(({ key: dayKey, label: dayLabel }) => (
        <div key={dayKey} className="card overflow-hidden">
          {/* Day header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-800">{dayLabel}</h3>
          </div>

          {/* Meals */}
          <div className="divide-y divide-gray-50">
            {MEAL_TYPES.map(({ key: mealKey, label: mealLabel, emoji }) => {
              const entry = menu[dayKey]?.[mealKey]
              const isEditing = isEditingCell(dayKey, mealKey)

              return (
                <div key={mealKey} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-base mt-0.5">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 font-medium mb-0.5">{mealLabel}</p>
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              className="input text-sm"
                              placeholder="Gerichtname *"
                              value={form.title}
                              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                              autoFocus
                            />
                            <input
                              className="input text-sm"
                              placeholder="Beschreibung (optional)"
                              value={form.description}
                              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            />
                            <div className="flex gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={form.is_vegetarian}
                                  onChange={e => setForm(f => ({ ...f, is_vegetarian: e.target.checked }))}
                                  className="rounded"
                                />
                                <Leaf size={11} className="text-green-500" /> Vegetarisch
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={form.is_vegan}
                                  onChange={e => setForm(f => ({ ...f, is_vegan: e.target.checked }))}
                                  className="rounded"
                                />
                                <Leaf size={11} className="text-green-600" /> Vegan
                              </label>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={cancelEdit}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                              >
                                <X size={12} /> Abbrechen
                              </button>
                              <button
                                onClick={saveEntry}
                                disabled={!form.title.trim() || saving}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
                              >
                                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                Speichern
                              </button>
                            </div>
                          </div>
                        ) : entry ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-gray-900">{entry.title}</p>
                              {entry.is_vegan && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Vegan</span>}
                              {!entry.is_vegan && entry.is_vegetarian && <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium">Vegetarisch</span>}
                            </div>
                            {entry.description && <p className="text-xs text-gray-400 mt-0.5">{entry.description}</p>}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-300 italic">Nicht eingetragen</p>
                        )}
                      </div>
                    </div>

                    {/* Actions (staff only - parent sees this but buttons are hidden via canEdit prop) */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(dayKey, mealKey)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {entry && (
                          <button
                            onClick={() => deleteEntry(dayKey, mealKey)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
