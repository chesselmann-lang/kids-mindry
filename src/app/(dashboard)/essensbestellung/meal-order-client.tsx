'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Save, CheckCircle2, Utensils } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
  dayKeys: string[]
  dayLabels: string[]
  weekDates: string[]
  weekStartStr: string
  weekLabel: string
  menuByDay: Record<string, any>
  existingOrders: Record<string, Record<string, boolean>>
  userId: string
  siteId: string
  prevWeek: string
  nextWeek: string
  isStaff: boolean
}

export default function MealOrderClient({
  children, dayKeys, dayLabels, weekDates, weekStartStr, weekLabel,
  menuByDay, existingOrders, userId, siteId, prevWeek, nextWeek, isStaff
}: Props) {
  // orders: { childId: { dayKey: boolean } }
  const [orders, setOrders] = useState<Record<string, Record<string, boolean>>>(existingOrders)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeChild, setActiveChild] = useState(children[0]?.id ?? '')

  function toggle(childId: string, dayKey: string) {
    setOrders(prev => ({
      ...prev,
      [childId]: {
        ...(prev[childId] ?? {}),
        [dayKey]: !(prev[childId]?.[dayKey] ?? false),
      }
    }))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    // Save order for each child that has any selection
    for (const child of children) {
      const childOrders = orders[child.id] ?? {}
      await supabase.from('meal_orders').upsert({
        child_id: child.id,
        site_id: siteId,
        week_start: weekStartStr,
        monday: childOrders['monday'] ?? false,
        tuesday: childOrders['tuesday'] ?? false,
        wednesday: childOrders['wednesday'] ?? false,
        thursday: childOrders['thursday'] ?? false,
        friday: childOrders['friday'] ?? false,
        ordered_by: userId,
      }, { onConflict: 'child_id,week_start' })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Count ordered meals per child per week
  function countOrders(childId: string) {
    return dayKeys.filter(k => orders[childId]?.[k]).length
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Essensbestellung</h1>
        <p className="text-sm text-gray-500 mt-0.5">Mahlzeiten für die Woche bestellen</p>
      </div>

      {/* Week navigation */}
      <div className="card p-3 flex items-center justify-between">
        <Link href={`/essensbestellung?week=${prevWeek}`}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </Link>
        <p className="text-sm font-semibold text-gray-900">{weekLabel}</p>
        <Link href={`/essensbestellung?week=${nextWeek}`}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} className="text-gray-600" />
        </Link>
      </div>

      {/* Child tabs if multiple children */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setActiveChild(child.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeChild === child.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {child.first_name}
              {countOrders(child.id) > 0 && (
                <span className={`text-xs px-1.5 rounded-full ${activeChild === child.id ? 'bg-white/20' : 'bg-brand-100 text-brand-600'}`}>
                  {countOrders(child.id)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {children.length === 0 && (
        <div className="card p-10 text-center">
          <Utensils size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Kein Kind verknüpft</p>
        </div>
      )}

      {/* Day grid for active child */}
      {children.filter(c => c.id === activeChild).map(child => (
        <div key={child.id} className="space-y-3">
          {children.length === 1 && (
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                {child.first_name[0]}{child.last_name[0]}
              </div>
              <p className="font-semibold text-gray-900">{child.first_name} {child.last_name}</p>
            </div>
          )}

          {dayKeys.map((key, idx) => {
            const menu = menuByDay[key]
            const isOrdered = orders[child.id]?.[key] ?? false

            return (
              <button
                key={key}
                onClick={() => toggle(child.id, key)}
                className={`w-full card p-4 text-left transition-all ${
                  isOrdered ? 'ring-2 ring-brand-400 bg-brand-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isOrdered ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Utensils size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{dayLabels[idx]}</p>
                      <p className="text-xs text-gray-400">{weekDates[idx]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {menu ? (
                      <p className="text-xs text-gray-600 max-w-[120px] text-right leading-tight">
                        {menu.lunch ?? menu.main ?? 'Menü vorhanden'}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-300">Kein Menü</p>
                    )}
                    <div className={`w-5 h-5 rounded-full border-2 mt-1 ml-auto flex items-center justify-center ${
                      isOrdered ? 'bg-brand-600 border-brand-600' : 'border-gray-300'
                    }`}>
                      {isOrdered && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ))}

      {/* Summary */}
      {children.length > 0 && (
        <div className="card p-4 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Gesamt diese Woche</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {children.reduce((acc, c) => acc + countOrders(c.id), 0)} Mahlzeit(en) bestellt
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
          >
            {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={16} /> Speichern</>}
          </button>
        </div>
      )}
    </div>
  )
}
