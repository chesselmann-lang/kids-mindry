'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const eventTypes = [
  { value: 'event',          label: '📅 Veranstaltung' },
  { value: 'excursion',      label: '🚌 Ausflug' },
  { value: 'parent_evening', label: '👨‍👩‍👧 Elternabend' },
  { value: 'holiday',        label: '🌴 Feiertag' },
  { value: 'closed',         label: '🔒 Geschlossen' },
  { value: 'other',          label: '📌 Sonstiges' },
]

const colors = ['#3B6CE8', '#16A34A', '#D97706', '#DC2626', '#7C3AED', '#0891B2', '#EA580C']

export default function EventCreateButton({ siteId, authorId }: { siteId: string; authorId: string }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState('event')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [allDay, setAllDay] = useState(false)
  const [rsvp, setRsvp] = useState(false)
  const [color, setColor] = useState(colors[0])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function reset() {
    setTitle(''); setType('event'); setDescription(''); setLocation('')
    setDate(new Date().toISOString().split('T')[0]); setStartTime('09:00')
    setEndTime('10:00'); setAllDay(false); setRsvp(false); setColor(colors[0])
  }

  async function handleCreate() {
    if (!title.trim() || !date) return
    setLoading(true)
    const supabase = createClient()

    const startsAt = allDay ? `${date}T00:00:00.000Z` : `${date}T${startTime}:00.000Z`
    const endsAt = allDay ? null : `${date}T${endTime}:00.000Z`

    await supabase.from('events').insert({
      site_id: siteId,
      author_id: authorId,
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      starts_at: startsAt,
      ends_at: endsAt,
      all_day: allDay,
      type: type as any,
      rsvp_required: rsvp,
      color,
    })

    setLoading(false)
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary flex items-center gap-2">
        <Plus size={18} /> Termin
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-bold text-gray-900">Neuer Termin</h2>
              <button onClick={() => { setOpen(false); reset() }} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Typ */}
              <div>
                <label className="label">Art des Termins</label>
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map(t => (
                    <button key={t.value} onClick={() => setType(t.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        type === t.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Titel */}
              <div>
                <label className="label">Titel *</label>
                <input className="input-field" placeholder="z.B. Sommerfest 2026" value={title}
                  onChange={e => setTitle(e.target.value)} autoFocus />
              </div>

              {/* Datum & Zeit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Datum *</label>
                  <input type="date" className="input-field" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-3">
                    <div onClick={() => setAllDay(p => !p)}
                      className={`w-10 h-6 rounded-full transition-colors ${allDay ? 'bg-brand-600' : 'bg-gray-200'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${allDay ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm text-gray-700">Ganztägig</span>
                  </label>
                </div>
              </div>

              {!allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Beginn</label>
                    <input type="time" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Ende</label>
                    <input type="time" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Ort */}
              <div>
                <label className="label">Ort (optional)</label>
                <input className="input-field" placeholder="z.B. Turnhalle, Kita-Garten…"
                  value={location} onChange={e => setLocation(e.target.value)} />
              </div>

              {/* Beschreibung */}
              <div>
                <label className="label">Beschreibung (optional)</label>
                <textarea className="input-field resize-none" rows={2}
                  placeholder="Weitere Infos für die Eltern…"
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              {/* Farbe */}
              <div>
                <label className="label">Farbe</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c} onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* RSVP */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setRsvp(p => !p)}
                  className={`w-10 h-6 rounded-full transition-colors ${rsvp ? 'bg-brand-600' : 'bg-gray-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${rsvp ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">Anmeldung erforderlich</span>
              </label>
            </div>

            <div className="flex gap-3 px-5 pb-5 sticky bottom-0 bg-white pt-3 border-t border-gray-100">
              <button onClick={() => { setOpen(false); reset() }} className="btn-secondary flex-1">Abbrechen</button>
              <button onClick={handleCreate} disabled={!title.trim() || !date || loading}
                className="btn-primary flex-1 disabled:opacity-50">
                {loading ? 'Speichere…' : 'Termin anlegen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
