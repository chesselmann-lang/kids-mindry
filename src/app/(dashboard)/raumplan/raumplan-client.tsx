'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2, LayoutGrid, Users, Maximize2 } from 'lucide-react'

interface Room {
  id: string
  name: string
  capacity: number | null
  floor: string | null
  assigned_group_id: string | null
  notes: string | null
}

interface Group {
  id: string
  name: string
  color: string | null
}

interface Props {
  rooms: Room[]
  groups: Group[]
  isAdmin: boolean
  siteId: string
}

const FLOOR_LABELS: Record<string, string> = {
  ug: 'Untergeschoss', eg: 'Erdgeschoss', og1: 'Obergeschoss 1', og2: 'Obergeschoss 2', other: 'Sonstiges',
}
const FLOORS = ['eg', 'og1', 'og2', 'ug', 'other']

export default function RaumplanClient({ rooms: initial, groups, isAdmin, siteId }: Props) {
  const [rooms, setRooms] = useState<Room[]>(initial)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [floor, setFloor] = useState('eg')
  const [assignedGroupId, setAssignedGroupId] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  function startEdit(r: Room) {
    setEditingId(r.id)
    setName(r.name)
    setCapacity(r.capacity?.toString() ?? '')
    setFloor(r.floor ?? 'eg')
    setAssignedGroupId(r.assigned_group_id ?? '')
    setNotes(r.notes ?? '')
    setOpen(true)
  }

  function resetForm() {
    setEditingId(null)
    setName('')
    setCapacity('')
    setFloor('eg')
    setAssignedGroupId('')
    setNotes('')
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      site_id: siteId,
      name: name.trim(),
      capacity: capacity ? parseInt(capacity) : null,
      floor: floor || null,
      assigned_group_id: assignedGroupId || null,
      notes: notes.trim() || null,
    }

    if (editingId) {
      const { data } = await supabase.from('rooms').update(payload).eq('id', editingId).select().single()
      if (data) setRooms(prev => prev.map(r => r.id === editingId ? data as Room : r))
    } else {
      const { data } = await supabase.from('rooms').insert(payload).select().single()
      if (data) setRooms(prev => [...prev, data as Room])
    }

    setSaving(false)
    resetForm()
    setOpen(false)
  }

  async function deleteRoom(id: string) {
    if (!confirm('Raum löschen?')) return
    const supabase = createClient()
    await supabase.from('rooms').delete().eq('id', id)
    setRooms(prev => prev.filter(r => r.id !== id))
  }

  // Group by floor
  const byFloor = FLOORS.map(f => ({
    floor: f,
    label: FLOOR_LABELS[f],
    rooms: rooms.filter(r => (r.floor ?? 'eg') === f),
  })).filter(f => f.rooms.length > 0 || f.floor === 'eg')

  function groupName(groupId: string | null) {
    if (!groupId) return null
    return groups.find(g => g.id === groupId)?.name ?? null
  }
  function groupColor(groupId: string | null) {
    if (!groupId) return null
    return groups.find(g => g.id === groupId)?.color ?? null
  }

  return (
    <div className="space-y-4">
      {/* Add room accordion — admin only */}
      {isAdmin && (
        <div className="card overflow-hidden">
          <button onClick={() => { if (!open) resetForm(); setOpen(v => !v) }}
            className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                <Plus size={16} className="text-teal-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">
                {editingId ? 'Raum bearbeiten' : 'Raum hinzufügen'}
              </span>
            </div>
            {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {open && (
            <div className="px-4 pb-4 border-t border-gray-50 space-y-3 pt-3">
              <div>
                <label className="label">Name *</label>
                <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="z.B. Turnraum" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Etage</label>
                  <select className="input-field" value={floor} onChange={e => setFloor(e.target.value)}>
                    {FLOORS.map(f => <option key={f} value={f}>{FLOOR_LABELS[f]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Kapazität</label>
                  <input type="number" min="1" className="input-field" value={capacity}
                    onChange={e => setCapacity(e.target.value)} placeholder="Personen" />
                </div>
              </div>
              <div>
                <label className="label">Zugeordnete Gruppe</label>
                <select className="input-field" value={assignedGroupId} onChange={e => setAssignedGroupId(e.target.value)}>
                  <option value="">– Keine –</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Notizen</label>
                <textarea className="input-field resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={!name.trim() || saving}
                  className="flex-1 btn-primary py-2.5 disabled:opacity-50">
                  {saving ? 'Speichern…' : editingId ? 'Aktualisieren' : 'Raum anlegen'}
                </button>
                {editingId && (
                  <button onClick={() => { resetForm(); setOpen(false) }}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 text-sm text-gray-600">
                    Abbrechen
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rooms by floor */}
      {rooms.length === 0 ? (
        <div className="card p-8 text-center">
          <LayoutGrid size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Noch keine Räume angelegt</p>
        </div>
      ) : (
        byFloor.filter(f => f.rooms.length > 0).map(({ floor: f, label, rooms: floorRooms }) => (
          <div key={f}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <div className="grid grid-cols-1 gap-2">
              {floorRooms.map(room => {
                const gName = groupName(room.assigned_group_id)
                const gColor = groupColor(room.assigned_group_id)
                return (
                  <div key={room.id} className="card p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <LayoutGrid size={18} className="text-teal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{room.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {room.capacity && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Maximize2 size={10} /> {room.capacity} Personen
                          </span>
                        )}
                        {gName && (
                          <span className="flex items-center gap-1 text-xs font-semibold"
                            style={{ color: gColor ?? '#6b7280' }}>
                            <Users size={10} /> {gName}
                          </span>
                        )}
                      </div>
                      {room.notes && <p className="text-xs text-gray-400 mt-1 italic">{room.notes}</p>}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => startEdit(room)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => deleteRoom(room.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
