'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, ClipboardCheck, AlertCircle } from 'lucide-react'

interface Child {
  id: string
  first_name: string
  last_name: string
  group_id: string | null
}

interface HandoverCheck {
  id: string
  child_id: string
  date: string
  type: string // 'arrival' | 'departure'
  status: string
  notes: string | null
  items: Record<string, boolean>
  staff_id: string | null
}

interface Props {
  children: Child[]
  todayChecks: HandoverCheck[]
  staffId: string
  today: string
}

const CHECKLIST_ITEMS = [
  { id: 'healthy', label: 'Kind gesund & munter' },
  { id: 'belongings', label: 'Sachen vollständig' },
  { id: 'medication', label: 'Medikamente übergeben' },
  { id: 'notes', label: 'Besonderheiten kommuniziert' },
]

type CheckState = Record<string, Record<string, boolean>>

export default function UebergabeCheckClient({ children, todayChecks, staffId, today }: Props) {
  const [activeTab, setActiveTab] = useState<'arrival' | 'departure'>('departure')
  const [checks, setChecks] = useState<CheckState>({})
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(todayChecks.filter(c => c.type === 'departure').map(c => c.child_id))
  )
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  function toggleCheck(childId: string, itemId: string) {
    setChecks(prev => ({
      ...prev,
      [childId]: { ...(prev[childId] ?? {}), [itemId]: !prev[childId]?.[itemId] },
    }))
  }

  async function completeHandover(child: Child) {
    const childChecks = checks[child.id] ?? {}
    setSaving(child.id)
    const supabase = createClient()
    await supabase.from('child_handover_checks').upsert({
      child_id: child.id,
      staff_id: staffId,
      date: today,
      type: activeTab,
      status: 'completed',
      items: childChecks,
      notes: notes[child.id]?.trim() || null,
    }, { onConflict: 'child_id,date,type' })
    setSaving(null)
    setCompletedIds(prev => new Set([...prev, child.id]))
    setChecks(prev => { const n = { ...prev }; delete n[child.id]; return n })
    setNotes(prev => { const n = { ...prev }; delete n[child.id]; return n })
  }

  const remainingChildren = children.filter(c => !completedIds.has(c.id))
  const doneChildren = children.filter(c => completedIds.has(c.id))

  return (
    <div className="space-y-4">
      {/* Tab selector */}
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
        {(['arrival', 'departure'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}>
            {tab === 'arrival' ? 'Ankunft' : 'Abholung'}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{doneChildren.length}</p>
          <p className="text-xs text-gray-500">Erledigt</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{remainingChildren.length}</p>
          <p className="text-xs text-gray-500">Ausstehend</p>
        </div>
      </div>

      {/* Remaining */}
      {remainingChildren.length > 0 && (
        <div className="space-y-3">
          {remainingChildren.map(child => {
            const childChecks = checks[child.id] ?? {}
            const allChecked = CHECKLIST_ITEMS.every(item => childChecks[item.id])
            return (
              <div key={child.id} className="card overflow-hidden">
                <div className="p-3 flex items-center justify-between border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{child.first_name} {child.last_name}</p>
                  {saving === child.id ? (
                    <span className="text-xs text-gray-400">Speichern…</span>
                  ) : (
                    <button
                      onClick={() => completeHandover(child)}
                      disabled={!allChecked}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        allChecked
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Check size={12} /> Übergabe ✓
                    </button>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  {CHECKLIST_ITEMS.map(item => (
                    <label key={item.id} className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        onClick={() => toggleCheck(child.id, item.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          childChecks[item.id]
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {childChecks[item.id] && <Check size={11} className="text-white" />}
                      </div>
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                  <textarea
                    className="input-field resize-none text-xs mt-1"
                    rows={2}
                    placeholder="Notiz (optional)"
                    value={notes[child.id] ?? ''}
                    onChange={e => setNotes(prev => ({ ...prev, [child.id]: e.target.value }))}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Done */}
      {doneChildren.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Erledigt</p>
          <div className="space-y-2">
            {doneChildren.map(child => (
              <div key={child.id} className="card p-3 flex items-center gap-3 opacity-70">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check size={14} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-700">{child.first_name} {child.last_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {children.length === 0 && (
        <div className="card p-8 text-center">
          <ClipboardCheck size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine aktiven Kinder gefunden</p>
        </div>
      )}
    </div>
  )
}
