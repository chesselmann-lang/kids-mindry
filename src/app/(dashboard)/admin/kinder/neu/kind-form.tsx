'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface Group { id: string; name: string; color: string }

interface Props {
  groups: Group[]
  siteId: string
  initialData?: {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string | null
    gender: string | null
    group_id: string | null
    allergies: string | null
    medical_notes: string | null
    status: string
  }
}

const genderOptions = [
  { value: 'female', label: 'Mädchen' },
  { value: 'male', label: 'Junge' },
  { value: 'diverse', label: 'Divers' },
]

const statusOptions = [
  { value: 'active', label: 'Aktiv' },
  { value: 'waitlist', label: 'Warteliste' },
  { value: 'inactive', label: 'Inaktiv' },
]

export default function KindForm({ groups, siteId, initialData }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!initialData

  const [form, setForm] = useState({
    first_name: initialData?.first_name ?? '',
    last_name: initialData?.last_name ?? '',
    date_of_birth: initialData?.date_of_birth ?? '',
    gender: initialData?.gender ?? 'unknown',
    group_id: initialData?.group_id ?? '',
    status: initialData?.status ?? 'active',
    medical_notes: initialData?.medical_notes ?? '',
  })
  const [allergies, setAllergies] = useState<string>(initialData?.allergies ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Vor- und Nachname sind Pflichtfelder.')
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      site_id: siteId,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      date_of_birth: form.date_of_birth || null,
      gender: form.gender as 'male' | 'female' | 'diverse' | 'unknown',
      group_id: form.group_id || null,
      status: form.status as 'active' | 'inactive' | 'waitlist',
      medical_notes: form.medical_notes || null,
      allergies: allergies.trim() || null,
    }

    let error
    if (isEdit && initialData) {
      ;({ error } = await supabase.from('children').update(payload).eq('id', initialData.id))
    } else {
      ;({ error } = await supabase.from('children').insert(payload))
    }

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    router.push('/admin/kinder')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="card p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stammdaten</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Vorname *</label>
            <input
              className="input"
              value={form.first_name}
              onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              placeholder="Anna"
              required
            />
          </div>
          <div>
            <label className="label">Nachname *</label>
            <input
              className="input"
              value={form.last_name}
              onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              placeholder="Müller"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Geburtsdatum</label>
            <input
              type="date"
              className="input"
              value={form.date_of_birth}
              onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Geschlecht</label>
            <select
              className="input"
              value={form.gender}
              onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
            >
              {genderOptions.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
              <option value="unknown">Keine Angabe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group & Status */}
      <div className="card p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gruppe & Status</p>
        <div>
          <label className="label">Gruppe</label>
          <select
            className="input"
            value={form.group_id}
            onChange={e => setForm(f => ({ ...f, group_id: e.target.value }))}
          >
            <option value="">Keine Gruppe</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {statusOptions.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, status: s.value }))}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                  form.status === s.value
                    ? 'border-brand-500 bg-brand-50 text-brand-800'
                    : 'border-gray-200 bg-white text-gray-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Medical */}
      <div className="card p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gesundheit</p>
        <div>
          <label className="label">Allergien</label>
          <input
            className="input"
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
            placeholder="z.B. Nüsse, Milch, Gluten"
          />
        </div>
        <div>
          <label className="label">Medizinische Hinweise</label>
          <textarea
            className="input resize-none"
            rows={3}
            value={form.medical_notes}
            onChange={e => setForm(f => ({ ...f, medical_notes: e.target.value }))}
            placeholder="z.B. Asthma, regelmäßige Medikamente, besondere Hinweise..."
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full py-3.5"
      >
        {submitting
          ? <><Loader2 size={18} className="animate-spin" />Speichern...</>
          : <><CheckCircle2 size={18} />{isEdit ? 'Änderungen speichern' : 'Kind anlegen'}</>
        }
      </button>
    </form>
  )
}
