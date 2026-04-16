'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Phone, User, Loader2, X, Check, StickyNote } from 'lucide-react'

interface PickupPerson {
  id: string
  full_name: string
  phone: string | null
  notes: string | null
  created_at: string
}

interface Props {
  childId: string
  pickupPersons: PickupPerson[]
}

const emptyForm = { full_name: '', phone: '', notes: '' }

export default function AbholenManager({ childId, pickupPersons: initial }: Props) {
  const [persons, setPersons] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function save() {
    if (!form.full_name.trim()) return
    setSaving(true)
    const { data, error } = await supabase.from('pickup_persons').insert({
      child_id: childId,
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
    }).select().single()

    if (!error && data) {
      setPersons(prev => [...prev, data as PickupPerson])
      setForm(emptyForm)
      setShowForm(false)
      router.refresh()
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Person wirklich entfernen?')) return
    setDeleting(id)
    await supabase.from('pickup_persons').delete().eq('id', id)
    setPersons(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-4">
      {persons.length === 0 && !showForm ? (
        <div className="card p-8 text-center">
          <User size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Keine zusätzlichen Abholberechtigten</p>
          <p className="text-gray-400 text-xs mt-1">
            Die Erziehungsberechtigten mit „Abholberechtigt" dürfen immer abholen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {persons.map(p => (
            <div key={p.id} className="card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-200 flex items-center justify-center flex-shrink-0 text-teal-700 font-bold text-sm">
                {p.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{p.full_name}</p>
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-xs text-brand-600 mt-0.5">
                    <Phone size={11} /> {p.phone}
                  </a>
                )}
                {p.notes && (
                  <p className="flex items-start gap-1 text-xs text-gray-500 mt-1">
                    <StickyNote size={11} className="mt-0.5 flex-shrink-0" /> {p.notes}
                  </p>
                )}
              </div>
              <button onClick={() => remove(p.id)} disabled={deleting === p.id}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                {deleting === p.id
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Trash2 size={15} />}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="card p-5 space-y-3">
          <p className="font-semibold text-sm text-gray-900">Neue Person hinzufügen</p>
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="Vor- und Nachname" value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="label">Telefon (optional)</label>
            <input className="input" type="tel" placeholder="+49 151…" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Hinweis (optional)</label>
            <input className="input" placeholder="z.B. Oma, nur dienstags" value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowForm(false); setForm(emptyForm) }} className="btn-secondary flex-1">
              <X size={15} /> Abbrechen
            </button>
            <button onClick={save} disabled={!form.full_name.trim() || saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Speichern
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-secondary w-full py-3">
          <Plus size={18} /> Person hinzufügen
        </button>
      )}
    </div>
  )
}
