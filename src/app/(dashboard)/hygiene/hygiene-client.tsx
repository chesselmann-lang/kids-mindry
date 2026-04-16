'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Sparkles, Save } from 'lucide-react'

const CHECKLIST_SECTIONS = [
  {
    id: 'morning',
    label: 'Morgens',
    icon: '🌅',
    items: [
      { id: 'floors_clean', label: 'Böden gereinigt' },
      { id: 'toilets_clean', label: 'Toiletten desinfiziert' },
      { id: 'sinks_clean', label: 'Waschbecken gereinigt' },
      { id: 'soap_filled', label: 'Seife aufgefüllt' },
      { id: 'towels_ready', label: 'Handtücher bereit' },
      { id: 'windows_open', label: 'Gelüftet' },
    ],
  },
  {
    id: 'midday',
    label: 'Mittag',
    icon: '☀️',
    items: [
      { id: 'kitchen_clean', label: 'Küche gereinigt' },
      { id: 'tables_disinfected', label: 'Tische desinfiziert' },
      { id: 'food_stored', label: 'Lebensmittel korrekt gelagert' },
      { id: 'waste_emptied', label: 'Mülleimer geleert' },
    ],
  },
  {
    id: 'afternoon',
    label: 'Nachmittags',
    icon: '🌤',
    items: [
      { id: 'toys_cleaned', label: 'Spielzeug gereinigt' },
      { id: 'outdoor_area', label: 'Außenbereich geprüft' },
      { id: 'final_sweep', label: 'Abschlusskontrolle Räume' },
    ],
  },
]

interface HygieneCheck {
  id: string
  section: string
  item_id: string
  checked: boolean
  checked_by: string
}

interface Props {
  todayChecks: HygieneCheck[]
  userId: string
  siteId: string
  today: string
}

export default function HygieneClient({ todayChecks, userId, siteId, today }: Props) {
  // Build initial state from existing checks
  const initialState: Record<string, boolean> = {}
  todayChecks.forEach(c => {
    initialState[`${c.section}_${c.item_id}`] = c.checked
  })

  const [checks, setChecks] = useState<Record<string, boolean>>(initialState)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(section: string, itemId: string) {
    const key = `${section}_${itemId}`
    setChecks(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  async function saveChecks() {
    setSaving(true)
    const supabase = createClient()

    // Build upsert array for all checked items
    const rows = CHECKLIST_SECTIONS.flatMap(section =>
      section.items.map(item => ({
        site_id: siteId,
        check_date: today,
        section: section.id,
        item_id: item.id,
        checked: checks[`${section.id}_${item.id}`] ?? false,
        checked_by: userId,
      }))
    )

    await supabase.from('hygiene_checks').upsert(rows, {
      onConflict: 'site_id,check_date,section,item_id',
    })

    setSaving(false)
    setSaved(true)
  }

  const totalItems = CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0)
  const checkedCount = Object.values(checks).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800">{checkedCount} / {totalItems} Punkte erledigt</p>
          <span className="text-xs text-gray-400">{Math.round(checkedCount / totalItems * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${checkedCount / totalItems * 100}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      {CHECKLIST_SECTIONS.map(section => {
        const sectionChecked = section.items.filter(i => checks[`${section.id}_${i.id}`]).length
        const sectionDone = sectionChecked === section.items.length
        return (
          <div key={section.id} className={`card p-4 ${sectionDone ? 'border-l-4 border-cyan-400' : ''}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{section.icon}</span>
              <p className="text-sm font-bold text-gray-900">{section.label}</p>
              <span className="text-xs text-gray-400 ml-auto">{sectionChecked}/{section.items.length}</span>
            </div>
            <div className="space-y-2">
              {section.items.map(item => {
                const key = `${section.id}_${item.id}`
                const isChecked = checks[key] ?? false
                return (
                  <label key={item.id} className="flex items-center gap-2.5 cursor-pointer" onClick={() => toggle(section.id, item.id)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isChecked ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300'
                    }`}>
                      {isChecked && <Check size={11} className="text-white" />}
                    </div>
                    <span className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Save */}
      <button onClick={saveChecks} disabled={saving}
        className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
          saved ? 'bg-green-100 text-green-700' : 'btn-primary'
        } disabled:opacity-50`}>
        {saved ? <><Check size={16} /> Gespeichert!</>
          : saving ? 'Speichern…'
          : <><Save size={16} /> Checkliste speichern</>}
      </button>
    </div>
  )
}
