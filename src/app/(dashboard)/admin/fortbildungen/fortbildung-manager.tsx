'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, Trash2, GraduationCap, Award } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Training {
  id: string
  staff_id: string
  training_date: string
  title: string
  provider: string | null
  hours: number | null
  certificate_url: string | null
  notes: string | null
  profiles?: { full_name: string }
}

interface StaffMember { id: string; full_name: string }

interface Props {
  trainings: Training[]
  staff: StaffMember[]
  siteId: string
}

const today = new Date().toISOString().split('T')[0]

export default function FortbildungManager({ trainings: initial, staff, siteId }: Props) {
  const [trainings, setTrainings] = useState<Training[]>(initial)
  const [open, setOpen] = useState(false)
  const [staffId, setStaffId] = useState('')
  const [date, setDate] = useState(today)
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStaff, setFilterStaff] = useState('')

  async function handleSave() {
    if (!staffId || !title.trim() || !date) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('trainings').insert({
      site_id: siteId,
      staff_id: staffId,
      training_date: date,
      title: title.trim(),
      provider: provider.trim() || null,
      hours: hours ? parseFloat(hours) : null,
      notes: notes.trim() || null,
    }).select('*, profiles:staff_id(full_name)').single()

    setSaving(false)
    if (data) {
      setTrainings(prev => [data as Training, ...prev])
      setTitle('')
      setProvider('')
      setHours('')
      setNotes('')
      setOpen(false)
    }
  }

  async function deleteTraining(id: string) {
    const supabase = createClient()
    await supabase.from('trainings').delete().eq('id', id)
    setTrainings(prev => prev.filter(t => t.id !== id))
  }

  const filtered = filterStaff ? trainings.filter(t => t.staff_id === filterStaff) : trainings

  // Total hours per staff
  const hoursByStaff = staff.map(s => ({
    ...s,
    total: trainings.filter(t => t.staff_id === s.id).reduce((sum, t) => sum + (t.hours ?? 0), 0),
    count: trainings.filter(t => t.staff_id === s.id).length,
  })).filter(s => s.count > 0).sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-4">
      {/* Summary tiles */}
      {hoursByStaff.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Übersicht</p>
          <div className="grid grid-cols-2 gap-2">
            {hoursByStaff.slice(0, 4).map(s => (
              <div key={s.id} className="card p-3 flex items-center gap-2">
                <Award size={16} className="text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{s.full_name}</p>
                  <p className="text-[10px] text-gray-400">{s.total}h · {s.count} Kurse</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Plus size={16} className="text-indigo-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Fortbildung eintragen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div>
              <label className="label">Mitarbeiter/in *</label>
              <select className="input-field" value={staffId} onChange={e => setStaffId(e.target.value)}>
                <option value="">– auswählen –</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Datum *</label>
                <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Stunden</label>
                <input type="number" min="0.5" step="0.5" className="input-field" value={hours}
                  onChange={e => setHours(e.target.value)} placeholder="z.B. 8" />
              </div>
            </div>
            <div>
              <label className="label">Titel / Thema *</label>
              <input className="input-field" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="z.B. Erste Hilfe am Kind" />
            </div>
            <div>
              <label className="label">Anbieter</label>
              <input className="input-field" value={provider} onChange={e => setProvider(e.target.value)}
                placeholder="z.B. DRK, AWO…" />
            </div>
            <div>
              <label className="label">Notizen</label>
              <textarea className="input-field resize-none" rows={2} value={notes}
                onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={!staffId || !title.trim() || !date || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Speichern…' : 'Eintragen'}
            </button>
          </div>
        )}
      </div>

      {/* Filter */}
      {staff.length > 1 && (
        <select className="input-field text-sm" value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
          <option value="">Alle Mitarbeiter/innen</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
        </select>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <GraduationCap size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Fortbildungen erfasst</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="card p-3 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={15} className="text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-500">{t.profiles?.full_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-gray-400">
                    {format(parseISO(t.training_date), 'd. MMM yyyy', { locale: de })}
                  </span>
                  {t.hours && <span className="text-[10px] font-semibold text-indigo-500">{t.hours}h</span>}
                  {t.provider && <span className="text-[10px] text-gray-400">{t.provider}</span>}
                </div>
                {t.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{t.notes}</p>}
              </div>
              <button onClick={() => deleteTraining(t.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
