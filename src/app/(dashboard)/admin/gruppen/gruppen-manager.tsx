'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Users, Edit3, Trash2, CheckCircle2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Group {
  id: string
  name: string
  color: string
  capacity: number
  age_min_months: number
  age_max_months: number
}

const COLORS = [
  '#3B6CE8', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
]

interface Props {
  groups: Group[]
  childCountMap: Record<string, number>
  siteId: string
}

export default function GruppenManager({ groups: initialGroups, childCountMap, siteId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [groups, setGroups] = useState(initialGroups)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const emptyForm = { name: '', color: COLORS[0], capacity: 20, age_min_months: 0, age_max_months: 72 }
  const [form, setForm] = useState(emptyForm)

  function startEdit(g: Group) {
    setForm({ name: g.name, color: g.color, capacity: g.capacity, age_min_months: g.age_min_months, age_max_months: g.age_max_months })
    setEditId(g.id)
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(emptyForm)
  }

  async function save() {
    if (!form.name.trim()) return
    setSubmitting(true)
    const payload = { site_id: siteId, name: form.name.trim(), color: form.color, capacity: form.capacity, age_min_months: form.age_min_months, age_max_months: form.age_max_months }

    if (editId) {
      const { data } = await supabase.from('groups').update(payload).eq('id', editId).select().single()
      if (data) setGroups(prev => prev.map(g => g.id === editId ? data : g))
    } else {
      const { data } = await supabase.from('groups').insert(payload).select().single()
      if (data) setGroups(prev => [...prev, data])
    }
    cancelForm()
    setSubmitting(false)
    router.refresh()
  }

  async function deleteGroup(id: string) {
    if (!confirm('Gruppe wirklich löschen? Kinder werden keiner Gruppe mehr zugeordnet.')) return
    setDeleting(id)
    await supabase.from('groups').delete().eq('id', id)
    setGroups(prev => prev.filter(g => g.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      {/* Existing groups */}
      {groups.length > 0 && (
        <div className="space-y-3">
          {groups.map(g => (
            <div key={g.id} className="card p-4 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0"
                style={{ backgroundColor: g.color }}
              >
                {g.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{g.name}</p>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {childCountMap[g.id] ?? 0} / {g.capacity} Kinder
                  </span>
                  <span>{Math.floor(g.age_min_months / 12)}–{Math.floor(g.age_max_months / 12)} Jahre</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(g)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => deleteGroup(g.id)}
                  disabled={deleting === g.id}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                >
                  {deleting === g.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New group form */}
      {showForm ? (
        <div className="card p-5 space-y-4">
          <p className="font-semibold text-gray-900">{editId ? 'Gruppe bearbeiten' : 'Neue Gruppe'}</p>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="z.B. Schmetterlinge"
            />
          </div>
          <div>
            <label className="label">Farbe</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-9 h-9 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Max. Kinder</label>
              <input
                type="number" className="input" min={1} max={50}
                value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: parseInt(e.target.value) || 20 }))}
              />
            </div>
            <div>
              <label className="label">Alter min. (Monate)</label>
              <input
                type="number" className="input" min={0} max={120}
                value={form.age_min_months}
                onChange={e => setForm(f => ({ ...f, age_min_months: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="label">Alter max. (Monate)</label>
              <input
                type="number" className="input" min={0} max={120}
                value={form.age_max_months}
                onChange={e => setForm(f => ({ ...f, age_max_months: parseInt(e.target.value) || 72 }))}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={cancelForm} className="btn-secondary flex-1">
              <X size={16} /> Abbrechen
            </button>
            <button onClick={save} disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Speichern
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          className="btn-secondary w-full py-3"
        >
          <Plus size={18} /> Neue Gruppe anlegen
        </button>
      )}
    </div>
  )
}
