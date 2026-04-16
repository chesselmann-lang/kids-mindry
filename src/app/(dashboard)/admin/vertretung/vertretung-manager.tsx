'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, Trash2, RefreshCw } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Substitution {
  id: string
  date: string
  absent_staff_id: string
  substitute_staff_id: string | null
  reason: string | null
  notes: string | null
  profiles?: { full_name: string }
  sub?: { full_name: string } | null
}

interface StaffMember { id: string; full_name: string }

interface Props {
  substitutions: Substitution[]
  staff: StaffMember[]
  siteId: string
  today: string
}

const REASONS = [
  { value: 'sick', label: 'Krank' },
  { value: 'vacation', label: 'Urlaub' },
  { value: 'training', label: 'Fortbildung' },
  { value: 'personal', label: 'Persönlich' },
  { value: 'other', label: 'Sonstiges' },
]
const REASON_COLORS: Record<string, string> = {
  sick: 'bg-red-100 text-red-700',
  vacation: 'bg-blue-100 text-blue-700',
  training: 'bg-purple-100 text-purple-700',
  personal: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
}

export default function VertretungManager({ substitutions: initial, staff, siteId, today }: Props) {
  const [substitutions, setSubstitutions] = useState<Substitution[]>(initial)
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(today)
  const [absentId, setAbsentId] = useState('')
  const [substituteId, setSubstituteId] = useState('')
  const [reason, setReason] = useState('sick')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!absentId || !date) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('substitutions').insert({
      site_id: siteId,
      date,
      absent_staff_id: absentId,
      substitute_staff_id: substituteId || null,
      reason,
      notes: notes.trim() || null,
    }).select('*, profiles:absent_staff_id(full_name), sub:substitute_staff_id(full_name)').single()
    setSaving(false)
    if (data) {
      setSubstitutions(prev => [...prev, data as Substitution].sort((a, b) => a.date.localeCompare(b.date)))
      setAbsentId('')
      setSubstituteId('')
      setNotes('')
      setOpen(false)
    }
  }

  async function deleteSubstitution(id: string) {
    const supabase = createClient()
    await supabase.from('substitutions').delete().eq('id', id)
    setSubstitutions(prev => prev.filter(s => s.id !== id))
  }

  // Group by date
  const grouped = new Map<string, Substitution[]>()
  substitutions.forEach(s => {
    const existing = grouped.get(s.date) ?? []
    existing.push(s)
    grouped.set(s.date, existing)
  })

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Plus size={16} className="text-cyan-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Vertretung eintragen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Datum *</label>
                <input type="date" className="input-field" value={date} min={today}
                  onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Grund</label>
                <select className="input-field" value={reason} onChange={e => setReason(e.target.value)}>
                  {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Abwesend: *</label>
              <select className="input-field" value={absentId} onChange={e => setAbsentId(e.target.value)}>
                <option value="">– Person auswählen –</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Vertretung:</label>
              <select className="input-field" value={substituteId} onChange={e => setSubstituteId(e.target.value)}>
                <option value="">– noch offen –</option>
                {staff.filter(s => s.id !== absentId).map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notizen</label>
              <textarea className="input-field resize-none" rows={2} value={notes}
                onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={!absentId || !date || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Speichern…' : 'Eintragen'}
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      {substitutions.length === 0 ? (
        <div className="card p-8 text-center">
          <RefreshCw size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Vertretungen in den nächsten 14 Tagen</p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([date, dayItems]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {format(parseISO(date), 'EEEE, d. MMMM', { locale: de })}
            </p>
            <div className="space-y-2">
              {dayItems.map(s => (
                <div key={s.id} className="card p-3 flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${REASON_COLORS[s.reason ?? 'other'] ?? 'bg-gray-100 text-gray-600'}`}>
                    {REASONS.find(r => r.value === s.reason)?.label ?? 'Sonstiges'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{s.profiles?.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {s.sub?.full_name
                        ? <>Vertretung: <span className="text-green-600 font-semibold">{s.sub.full_name}</span></>
                        : <span className="text-amber-500">Vertretung offen</span>
                      }
                    </p>
                    {s.notes && <p className="text-xs text-gray-400 italic mt-0.5">{s.notes}</p>}
                  </div>
                  <button onClick={() => deleteSubstitution(s.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
