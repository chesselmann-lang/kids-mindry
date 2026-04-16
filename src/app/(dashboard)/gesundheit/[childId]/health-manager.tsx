'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Save, CheckCircle2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Record {
  id: string
  record_type: string
  title: string
  description: string | null
  record_date: string
  notes: string | null
  is_confidential: boolean
}

interface Props {
  childId: string
  staffId: string
  records: Record[]
}

const RECORD_TYPES = [
  { value: 'vaccination', label: '💉 Impfung' },
  { value: 'checkup',     label: '🩺 Vorsorge' },
  { value: 'diagnosis',   label: '📋 Diagnose' },
  { value: 'medication',  label: '💊 Medikament' },
  { value: 'allergy',     label: '⚠️ Allergie' },
  { value: 'other',       label: '📝 Sonstiges' },
]

const TYPE_LABELS: Record<string, string> = {
  vaccination: 'Impfung', checkup: 'Vorsorge', diagnosis: 'Diagnose',
  medication: 'Medikament', allergy: 'Allergie', other: 'Sonstiges',
}
const TYPE_COLORS: Record<string, string> = {
  vaccination: 'bg-green-100 text-green-700',
  checkup:     'bg-blue-100 text-blue-700',
  diagnosis:   'bg-red-100 text-red-700',
  medication:  'bg-purple-100 text-purple-700',
  allergy:     'bg-amber-100 text-amber-700',
  other:       'bg-gray-100 text-gray-700',
}

export default function HealthManager({ childId, staffId, records: initial }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [records, setRecords] = useState<Record[]>(initial)
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('vaccination')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [isConfidential, setIsConfidential] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('health_records').insert({
      child_id: childId,
      record_type: type,
      title: title.trim(),
      description: description.trim() || null,
      record_date: date,
      notes: notes.trim() || null,
      is_confidential: isConfidential,
      created_by: staffId,
    }).select().single()

    setSaving(false)
    if (data) {
      setRecords(prev => [data as Record, ...prev])
      setSaved(true)
      setTitle(''); setDescription(''); setNotes('')
      setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('health_records').delete().eq('id', id)
    setRecords(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Plus size={16} className="text-red-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Eintrag hinzufügen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className="label">Typ</label>
                <select className="input-field" value={type} onChange={e => setType(e.target.value)}>
                  {RECORD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Datum</label>
                <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Bezeichnung *</label>
              <input className="input-field" placeholder="z.B. Masernimpfung, U9 …"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Details</label>
              <textarea className="input-field resize-none" rows={2}
                placeholder="Weitere Informationen …"
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfidential(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${isConfidential ? 'bg-brand-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isConfidential ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs text-gray-600">Nur für Personal sichtbar</span>
            </div>
            <button onClick={handleSave} disabled={!title.trim() || saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={15} /> Eintrag speichern</>}
            </button>
          </div>
        )}
      </div>

      {/* Record list */}
      {records.length > 0 && (
        <div className="space-y-2">
          {records.map(r => (
            <div key={r.id} className="card p-3 flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TYPE_COLORS[r.record_type] ?? 'bg-gray-100 text-gray-700'}`}>
                    {TYPE_LABELS[r.record_type] ?? r.record_type}
                  </span>
                  {r.is_confidential && (
                    <span className="text-[10px] text-gray-400">🔒 Intern</span>
                  )}
                  <span className="text-[10px] text-gray-400">
                    {format(parseISO(r.record_date), 'd. MMM yyyy', { locale: de })}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">{r.title}</p>
                {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
              </div>
              <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:bg-red-50 text-red-400 flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {records.length === 0 && !open && (
        <div className="card p-8 text-center">
          <p className="text-gray-400 text-sm">Noch keine Gesundheitseinträge vorhanden</p>
        </div>
      )}
    </div>
  )
}
