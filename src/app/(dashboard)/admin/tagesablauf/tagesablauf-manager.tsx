'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, Trash2, Pencil, Clock3, GripVertical } from 'lucide-react'

interface ScheduleItem {
  id: string
  time_start: string
  time_end: string | null
  title: string
  description: string | null
  category: string
  group_id: string | null
  color: string | null
}

interface Group { id: string; name: string }

interface Props {
  items: ScheduleItem[]
  groups: Group[]
  siteId: string
}

const CATEGORIES = [
  { value: 'arrival', label: 'Ankommen', color: '#3b82f6' },
  { value: 'breakfast', label: 'Frühstück', color: '#f59e0b' },
  { value: 'play', label: 'Freispiel', color: '#10b981' },
  { value: 'activity', label: 'Aktivität', color: '#8b5cf6' },
  { value: 'outdoor', label: 'Draußen', color: '#06b6d4' },
  { value: 'lunch', label: 'Mittagessen', color: '#f97316' },
  { value: 'rest', label: 'Ruhezeit', color: '#6b7280' },
  { value: 'snack', label: 'Vesper', color: '#ec4899' },
  { value: 'departure', label: 'Abholung', color: '#84cc16' },
  { value: 'other', label: 'Sonstiges', color: '#9ca3af' },
]

export default function TagesablaufManager({ items: initial, groups, siteId }: Props) {
  const [items, setItems] = useState<ScheduleItem[]>(initial)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterGroup, setFilterGroup] = useState('')

  // Form
  const [timeStart, setTimeStart] = useState('07:00')
  const [timeEnd, setTimeEnd] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('activity')
  const [groupId, setGroupId] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(item: ScheduleItem) {
    setEditingId(item.id)
    setTimeStart(item.time_start)
    setTimeEnd(item.time_end ?? '')
    setTitle(item.title)
    setDescription(item.description ?? '')
    setCategory(item.category)
    setGroupId(item.group_id ?? '')
    setOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setTimeStart('07:00')
    setTimeEnd('')
    setTitle('')
    setDescription('')
    setCategory('activity')
    setGroupId('')
  }

  async function handleSave() {
    if (!title.trim() || !timeStart) return
    setSaving(true)
    const supabase = createClient()
    const catColor = CATEGORIES.find(c => c.value === category)?.color ?? '#9ca3af'
    const payload = {
      site_id: siteId,
      time_start: timeStart,
      time_end: timeEnd || null,
      title: title.trim(),
      description: description.trim() || null,
      category,
      group_id: groupId || null,
      color: catColor,
    }

    if (editingId) {
      const { data } = await supabase.from('daily_schedule_items').update(payload).eq('id', editingId).select().single()
      if (data) setItems(prev => prev.map(i => i.id === editingId ? data as ScheduleItem : i).sort((a, b) => a.time_start.localeCompare(b.time_start)))
    } else {
      const { data } = await supabase.from('daily_schedule_items').insert(payload).select().single()
      if (data) setItems(prev => [...prev, data as ScheduleItem].sort((a, b) => a.time_start.localeCompare(b.time_start)))
    }

    setSaving(false)
    resetForm()
    setOpen(false)
  }

  async function deleteItem(id: string) {
    const supabase = createClient()
    await supabase.from('daily_schedule_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const filtered = filterGroup
    ? items.filter(i => !i.group_id || i.group_id === filterGroup)
    : items

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card overflow-hidden">
        <button onClick={() => { if (!open) resetForm(); setOpen(v => !v) }}
          className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <Plus size={16} className="text-green-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">
              {editingId ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen'}
            </span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Von *</label>
                <input type="time" className="input-field" value={timeStart} onChange={e => setTimeStart(e.target.value)} />
              </div>
              <div>
                <label className="label">Bis</label>
                <input type="time" className="input-field" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Bezeichnung *</label>
              <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="z.B. Morgenkreis" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Kategorie</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {groups.length > 0 && (
                <div>
                  <label className="label">Gruppe</label>
                  <select className="input-field" value={groupId} onChange={e => setGroupId(e.target.value)}>
                    <option value="">Alle</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="label">Beschreibung</label>
              <textarea className="input-field resize-none" rows={2}
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={!title.trim() || !timeStart || saving}
                className="flex-1 btn-primary py-2.5 disabled:opacity-50">
                {saving ? 'Speichern…' : editingId ? 'Aktualisieren' : 'Hinzufügen'}
              </button>
              {editingId && (
                <button onClick={() => { resetForm(); setOpen(false) }}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-600">
                  Abbruch
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filter */}
      {groups.length > 0 && (
        <select className="input-field text-sm" value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
          <option value="">Alle Gruppen</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <Clock3 size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Einträge</p>
        </div>
      ) : (
        <div className="relative pl-12">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
          <div className="space-y-3">
            {filtered.map(item => {
              const catCfg = CATEGORIES.find(c => c.value === item.category)
              return (
                <div key={item.id} className="relative">
                  <div
                    className="absolute -left-[26px] top-3 w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: item.color ?? catCfg?.color ?? '#9ca3af' }}
                  />
                  <div className="card p-3 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">
                          {item.time_start}
                          {item.time_end ? ` – ${item.time_end}` : ''}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                          style={{ backgroundColor: (item.color ?? catCfg?.color ?? '#9ca3af') + '20', color: item.color ?? catCfg?.color }}>
                          {catCfg?.label ?? item.category}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5">{item.title}</p>
                      {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => deleteItem(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
