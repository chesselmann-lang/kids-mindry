'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Plus, X, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Shift {
  id: string
  staff_id: string
  shift_date: string
  start_time: string
  end_time: string
  role_note: string | null
  profiles: { full_name: string } | null
}

interface Props {
  days: { date: string; label: string; isToday: boolean }[]
  shifts: Shift[]
  staffMembers: { id: string; full_name: string; role: string }[]
  weekLabel: string
  prevWeek: string
  nextWeek: string
  isAdmin: boolean
  userId: string
  siteId: string
}

const COLOR_MAP = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800', 'bg-rose-100 text-rose-800', 'bg-teal-100 text-teal-800']

export default function DienstplanClient({ days, shifts, staffMembers, weekLabel, prevWeek, nextWeek, isAdmin, userId, siteId }: Props) {
  const router = useRouter()
  const [localShifts, setLocalShifts] = useState<Shift[]>(shifts)
  const [showForm, setShowForm] = useState(false)
  const [staffId, setStaffId] = useState('')
  const [shiftDate, setShiftDate] = useState(days[0]?.date ?? '')
  const [startTime, setStartTime] = useState('07:00')
  const [endTime, setEndTime] = useState('16:00')
  const [roleNote, setRoleNote] = useState('')
  const [saving, setSaving] = useState(false)

  // Color per staff member
  const staffColorMap: Record<string, string> = {}
  staffMembers.forEach((s, i) => { staffColorMap[s.id] = COLOR_MAP[i % COLOR_MAP.length] })

  async function handleAdd() {
    if (!staffId || !shiftDate) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('shifts').insert({
      site_id: siteId,
      staff_id: staffId,
      shift_date: shiftDate,
      start_time: startTime,
      end_time: endTime,
      role_note: roleNote.trim() || null,
      created_by: userId,
    }).select('*, profiles:staff_id(full_name)').single()

    setSaving(false)
    if (data) {
      setLocalShifts(prev => [...prev, data as Shift])
      setShowForm(false)
    }
  }

  async function deleteShift(id: string) {
    const supabase = createClient()
    await supabase.from('shifts').delete().eq('id', id)
    setLocalShifts(prev => prev.filter(s => s.id !== id))
  }

  // Group shifts by day
  const shiftsByDay: Record<string, Shift[]> = {}
  for (const s of localShifts) {
    if (!shiftsByDay[s.shift_date]) shiftsByDay[s.shift_date] = []
    shiftsByDay[s.shift_date].push(s)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dienstplan</h1>
          <p className="text-sm text-gray-500 mt-0.5">{weekLabel}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Schicht
          </button>
        )}
      </div>

      {/* Week nav */}
      <div className="flex items-center justify-between card p-3">
        <Link href={`/dienstplan?week=${prevWeek}`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} className="text-gray-600" />
        </Link>
        <span className="text-sm font-semibold text-gray-700">{weekLabel}</span>
        <Link href={`/dienstplan?week=${nextWeek}`} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} className="text-gray-600" />
        </Link>
      </div>

      {/* Add shift form */}
      {showForm && isAdmin && (
        <div className="card p-4 space-y-3 border-2 border-brand-100">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-gray-900">Neue Schicht</p>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <label className="label">Mitarbeiter *</label>
            <select className="input-field" value={staffId} onChange={e => setStaffId(e.target.value)}>
              <option value="">Auswählen…</option>
              {staffMembers.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tag *</label>
            <select className="input-field" value={shiftDate} onChange={e => setShiftDate(e.target.value)}>
              {days.map(d => <option key={d.date} value={d.date}>{d.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Von</label>
              <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="label">Bis</label>
              <input type="time" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Aufgabe / Bereich</label>
            <input className="input-field" placeholder="z.B. Gruppe Sonne" value={roleNote} onChange={e => setRoleNote(e.target.value)} />
          </div>
          <button onClick={handleAdd} disabled={!staffId || !shiftDate || saving}
            className="btn-primary w-full py-2.5 disabled:opacity-50">
            {saving ? 'Speichere…' : 'Schicht hinzufügen'}
          </button>
        </div>
      )}

      {/* Weekly grid */}
      <div className="space-y-3">
        {days.map(day => {
          const dayShifts = shiftsByDay[day.date] ?? []
          return (
            <div key={day.date} className={`card overflow-hidden ${day.isToday ? 'ring-2 ring-brand-400' : ''}`}>
              <div className={`px-4 py-2.5 flex items-center justify-between ${day.isToday ? 'bg-brand-50' : 'bg-gray-50'}`}>
                <p className={`text-sm font-semibold ${day.isToday ? 'text-brand-700' : 'text-gray-700'}`}>
                  {day.label}
                  {day.isToday && <span className="ml-2 text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded-full">Heute</span>}
                </p>
                <span className="text-xs text-gray-400">{dayShifts.length} Schicht{dayShifts.length !== 1 ? 'en' : ''}</span>
              </div>

              {dayShifts.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-300 italic">Keine Schichten geplant</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {dayShifts.map(shift => {
                    const color = staffColorMap[shift.staff_id] ?? COLOR_MAP[0]
                    return (
                      <div key={shift.id} className="flex items-center gap-3 px-4 py-3">
                        <div className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${color}`}>
                          {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{shift.profiles?.full_name}</p>
                          {shift.role_note && <p className="text-xs text-gray-400">{shift.role_note}</p>}
                        </div>
                        {isAdmin && (
                          <button onClick={() => deleteShift(shift.id)} className="p-1 rounded hover:bg-red-50 text-red-400 flex-shrink-0">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
