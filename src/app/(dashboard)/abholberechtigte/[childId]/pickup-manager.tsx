'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Phone, UserCheck, Trash2, X, Save, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Person {
  id: string
  full_name: string
  relationship: string | null
  phone: string | null
  id_required: boolean
  notes: string | null
}

interface Props {
  childId: string
  childName: string
  initialPersons: Person[]
  userId: string
}

export default function PickupManager({ childId, childName, initialPersons, userId }: Props) {
  const router = useRouter()
  const [persons, setPersons] = useState<Person[]>(initialPersons)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Person | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone, setPhone] = useState('')
  const [idRequired, setIdRequired] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditing(null)
    setName(''); setRelationship(''); setPhone(''); setIdRequired(false); setNotes('')
    setShowForm(true)
  }

  function openEdit(p: Person) {
    setEditing(p)
    setName(p.full_name); setRelationship(p.relationship ?? ''); setPhone(p.phone ?? '')
    setIdRequired(p.id_required); setNotes(p.notes ?? '')
    setShowForm(true)
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    const supabase = createClient()

    if (editing) {
      const { data } = await supabase.from('pickup_persons').update({
        full_name: name.trim(),
        relationship: relationship.trim() || null,
        phone: phone.trim() || null,
        id_required: idRequired,
        notes: notes.trim() || null,
      }).eq('id', editing.id).select().single()
      if (data) setPersons(prev => prev.map(p => p.id === editing.id ? data as Person : p))
    } else {
      const { data } = await supabase.from('pickup_persons').insert({
        child_id: childId,
        full_name: name.trim(),
        relationship: relationship.trim() || null,
        phone: phone.trim() || null,
        id_required: idRequired,
        notes: notes.trim() || null,
        created_by: userId,
      }).select().single()
      if (data) setPersons(prev => [...prev, data as Person])
    }

    setSaving(false)
    setShowForm(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('pickup_persons').delete().eq('id', id)
    setPersons(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/mein-kind" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Abholberechtigte</h1>
          <p className="text-sm text-gray-400">{childName}</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Person
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 rounded-2xl p-4 text-xs text-blue-700 flex gap-2">
        <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
        <p>Bitte geben Sie alle Personen an, die Ihr Kind aus der Einrichtung abholen dürfen. Unbekannte Personen dürfen das Kind nicht mitnehmen.</p>
      </div>

      {/* List */}
      {persons.length === 0 ? (
        <div className="card p-10 text-center">
          <UserCheck size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Noch keine Abholberechtigten</p>
          <p className="text-gray-400 text-xs mt-1">Fügen Sie autorisierte Personen hinzu</p>
          <button onClick={openNew} className="btn-primary mt-4 text-sm inline-flex gap-2">
            <Plus size={15} /> Person hinzufügen
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          {persons.map((p, idx) => (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-4 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-green-700">{p.full_name[0]}</span>
              </div>
              <div className="flex-1 min-w-0" onClick={() => openEdit(p)}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{p.full_name}</p>
                  {p.id_required && (
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                      Ausweis
                    </span>
                  )}
                </div>
                {p.relationship && <p className="text-xs text-gray-500">{p.relationship}</p>}
                {p.phone && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} /> {p.phone}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 pb-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Person bearbeiten' : 'Person hinzufügen'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div>
              <label className="label">Name *</label>
              <input className="input-field" placeholder="Vor- und Nachname" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Beziehung</label>
              <input className="input-field" placeholder="z.B. Großmutter, Onkel, Nachbarin…" value={relationship} onChange={e => setRelationship(e.target.value)} />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input-field" type="tel" placeholder="+49 123 456789" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">Ausweis erforderlich</p>
                <p className="text-xs text-gray-400">Person muss sich ausweisen</p>
              </div>
              <button onClick={() => setIdRequired(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${idRequired ? 'bg-brand-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${idRequired ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <div>
              <label className="label">Notizen</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Weitere Hinweise…" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <button onClick={handleSave} disabled={!name.trim() || saving}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              <Save size={18} />
              {saving ? 'Speichere…' : 'Speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
