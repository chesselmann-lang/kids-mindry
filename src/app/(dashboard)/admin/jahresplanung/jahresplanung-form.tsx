'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Save, CheckCircle2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  title: string
  event_date: string
  event_type: string
  description: string | null
}

interface Props {
  staffId: string
  siteId: string
  events: Event[]
}

const EVENT_TYPES = [
  { value: 'holiday',  label: 'Feiertag' },
  { value: 'closing',  label: 'Schließtag' },
  { value: 'special',  label: 'Besonderer Tag' },
  { value: 'trip',     label: 'Ausflug' },
  { value: 'meeting',  label: 'Elternabend' },
  { value: 'other',    label: 'Sonstiges' },
]

export default function JahresplanungForm({ staffId, siteId, events: initialEvents }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [open, setOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [title, setTitle] = useState('')
  const [eventDate, setEventDate] = useState(today)
  const [eventType, setEventType] = useState('special')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!title.trim() || !eventDate) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('annual_events').insert({
      site_id: siteId,
      title: title.trim(),
      event_date: eventDate,
      event_type: eventType,
      description: description.trim() || null,
      created_by: staffId,
    }).select().single()

    setSaving(false)
    if (data) {
      setEvents(prev => [...prev, data as Event].sort((a, b) => a.event_date.localeCompare(b.event_date)))
      setSaved(true)
      setTitle(''); setDescription('')
      setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('annual_events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Plus size={16} className="text-brand-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Neuen Termin hinzufügen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className="label">Datum *</label>
                <input type="date" className="input-field" value={eventDate} onChange={e => setEventDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Typ</label>
                <select className="input-field" value={eventType} onChange={e => setEventType(e.target.value)}>
                  {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Bezeichnung *</label>
              <input className="input-field" placeholder="z.B. Betriebsausflug, Ferienbeginn …"
                value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="label">Beschreibung (optional)</label>
              <input className="input-field" placeholder="Weitere Details …"
                value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={!title.trim() || !eventDate || saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={15} /> Termin speichern</>}
            </button>
          </div>
        )}
      </div>

      {/* Event list */}
      {events.length > 0 && (
        <div className="space-y-2">
          {events.map(ev => (
            <div key={ev.id} className="card p-3 flex items-center gap-3">
              <div className="text-center w-10 flex-shrink-0">
                <p className="text-base font-bold text-gray-700 leading-none">{ev.event_date.split('-')[2]}</p>
                <p className="text-[9px] text-gray-400">{ev.event_date.split('-').slice(0,2).join('/')}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                {ev.description && <p className="text-xs text-gray-400">{ev.description}</p>}
              </div>
              <button onClick={() => handleDelete(ev.id)} className="p-1 rounded hover:bg-red-50 text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
