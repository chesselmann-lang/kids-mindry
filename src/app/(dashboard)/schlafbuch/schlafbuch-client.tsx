'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Moon, Sun, Clock, Minus, Plus } from 'lucide-react'

interface Child { id: string; first_name: string; last_name: string }
interface SleepRecord {
  id: string
  child_id: string
  sleep_date: string
  sleep_start: string | null
  sleep_end: string | null
  quality: number | null
  notes: string | null
}

interface Props {
  children: Child[]
  todayEntries: SleepRecord[]
  today: string
}

const QUALITY_LABELS: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: 'Schlecht', color: 'text-red-500', emoji: '😟' },
  2: { label: 'Unruhig', color: 'text-amber-500', emoji: '😕' },
  3: { label: 'Normal', color: 'text-blue-500', emoji: '😐' },
  4: { label: 'Gut', color: 'text-green-500', emoji: '😊' },
  5: { label: 'Sehr gut', color: 'text-emerald-600', emoji: '😴' },
}

export default function SchlafbuchClient({ children, todayEntries, today }: Props) {
  const [entries, setEntries] = useState<SleepRecord[]>(todayEntries)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [sleepStart, setSleepStart] = useState('12:00')
  const [sleepEnd, setSleepEnd] = useState('14:00')
  const [quality, setQuality] = useState<number>(3)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  function getEntry(childId: string) {
    return entries.find(e => e.child_id === childId)
  }

  function startEdit(child: Child) {
    const existing = getEntry(child.id)
    setEditingId(child.id)
    setSleepStart(existing?.sleep_start ?? '12:00')
    setSleepEnd(existing?.sleep_end ?? '14:00')
    setQuality(existing?.quality ?? 3)
    setNotes(existing?.notes ?? '')
  }

  async function saveEntry(child: Child) {
    setSaving(child.id)
    const supabase = createClient()
    const payload = {
      child_id: child.id,
      sleep_date: today,
      sleep_start: sleepStart || null,
      sleep_end: sleepEnd || null,
      quality,
      notes: notes.trim() || null,
    }
    const existing = getEntry(child.id)
    let data: any
    if (existing) {
      const res = await supabase.from('sleep_records').update(payload).eq('id', existing.id).select().single()
      data = res.data
    } else {
      const res = await supabase.from('sleep_records').insert(payload).select().single()
      data = res.data
    }
    setSaving(null)
    if (data) {
      setEntries(prev => {
        const without = prev.filter(e => e.child_id !== child.id)
        return [...without, data as SleepRecord]
      })
    }
    setEditingId(null)
  }

  function calcDuration(start: string, end: string): string {
    if (!start || !end) return ''
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins <= 0) return ''
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h > 0 ? `${h}h ${m > 0 ? m + 'min' : ''}` : `${m}min`
  }

  return (
    <div className="space-y-3">
      {children.map(child => {
        const entry = getEntry(child.id)
        const isEditing = editingId === child.id
        const q = entry ? QUALITY_LABELS[entry.quality ?? 3] : null
        const duration = entry?.sleep_start && entry?.sleep_end
          ? calcDuration(entry.sleep_start, entry.sleep_end) : null

        return (
          <div key={child.id} className="card overflow-hidden">
            <div
              className="p-3 flex items-center gap-3 cursor-pointer"
              onClick={() => isEditing ? setEditingId(null) : startEdit(child)}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                entry ? 'bg-indigo-100' : 'bg-gray-100'
              }`}>
                <Moon size={15} className={entry ? 'text-indigo-500' : 'text-gray-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{child.first_name} {child.last_name}</p>
                {entry ? (
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Clock size={10} />
                    {entry.sleep_start ?? '?'} – {entry.sleep_end ?? '?'}
                    {duration && <span className="text-indigo-500 font-medium">({duration})</span>}
                    {q && <span>{q.emoji}</span>}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">Noch nicht eingetragen</p>
                )}
              </div>
              <span className="text-xs text-brand-500 font-semibold">
                {isEditing ? 'Schließen' : entry ? 'Ändern' : 'Eintragen'}
              </span>
            </div>

            {isEditing && (
              <div className="px-3 pb-3 border-t border-gray-50 pt-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label flex items-center gap-1"><Moon size={11} /> Eingeschlafen</label>
                    <input type="time" className="input-field" value={sleepStart}
                      onChange={e => setSleepStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="label flex items-center gap-1"><Sun size={11} /> Aufgewacht</label>
                    <input type="time" className="input-field" value={sleepEnd}
                      onChange={e => setSleepEnd(e.target.value)} />
                  </div>
                </div>
                {sleepStart && sleepEnd && calcDuration(sleepStart, sleepEnd) && (
                  <p className="text-xs text-indigo-500 font-medium text-center">
                    Schlafdauer: {calcDuration(sleepStart, sleepEnd)}
                  </p>
                )}
                <div>
                  <label className="label">Schlafqualität</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(v => (
                      <button key={v} onClick={() => setQuality(v)}
                        className={`flex-1 py-2 rounded-xl text-lg transition-all ${
                          quality === v ? 'bg-indigo-100 scale-110' : 'bg-gray-50'
                        }`}>
                        {QUALITY_LABELS[v].emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-500">{QUALITY_LABELS[quality]?.label}</p>
                </div>
                <div>
                  <label className="label">Notiz</label>
                  <textarea className="input-field resize-none" rows={2}
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Besonderheiten beim Schlafen…" />
                </div>
                <button onClick={() => saveEntry(child)} disabled={saving === child.id}
                  className="btn-primary w-full py-2 text-sm disabled:opacity-50">
                  {saving === child.id ? 'Speichern…' : 'Eintrag speichern'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
