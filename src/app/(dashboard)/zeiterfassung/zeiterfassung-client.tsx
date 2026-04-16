'use client'

import { useState, useEffect } from 'react'
import { LogIn, LogOut, Clock, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface TimeEntry {
  id: string
  clock_in: string
  clock_out: string | null
  break_minutes: number | null
  notes: string | null
  status: string
}

interface Props {
  userId: string
  siteId: string
  openEntry: TimeEntry | null
  entries: TimeEntry[]
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}:${m.toString().padStart(2, '0')} h`
}

export default function ZeiterfassungClient({ userId, siteId, openEntry: initialOpen, entries: initialEntries }: Props) {
  const router = useRouter()
  const [openEntry, setOpenEntry] = useState<TimeEntry | null>(initialOpen)
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [breakMinutes, setBreakMinutes] = useState('0')
  const [done, setDone] = useState(false)

  // Live clock for open entry
  useEffect(() => {
    if (!openEntry) return
    const update = () => {
      const start = new Date(openEntry.clock_in)
      setElapsed(Math.floor((Date.now() - start.getTime()) / 60000))
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [openEntry])

  async function clockIn() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('time_entries').insert({
      site_id: siteId,
      staff_id: userId,
      clock_in: new Date().toISOString(),
      status: 'pending',
    }).select().single()
    setLoading(false)
    if (data) setOpenEntry(data as TimeEntry)
  }

  async function clockOut() {
    if (!openEntry) return
    setLoading(true)
    const supabase = createClient()
    const clockOut = new Date().toISOString()
    await supabase.from('time_entries').update({
      clock_out: clockOut,
      break_minutes: parseInt(breakMinutes) || 0,
      notes: notes.trim() || null,
    }).eq('id', openEntry.id)

    const updated = { ...openEntry, clock_out: clockOut, break_minutes: parseInt(breakMinutes) || 0, notes: notes.trim() || null }
    setEntries(prev => [updated, ...prev])
    setOpenEntry(null)
    setLoading(false)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  const today = format(new Date(), 'EEEE, d. MMMM', { locale: de })

  return (
    <div className="space-y-4">
      {/* Current status card */}
      <div className={`card p-5 text-center ${openEntry ? 'bg-green-50 border-green-200' : ''}`}>
        <p className="text-xs text-gray-400 mb-1">{today}</p>

        {done ? (
          <div className="space-y-2">
            <CheckCircle2 size={40} className="text-green-500 mx-auto" />
            <p className="font-semibold text-gray-800">Erfolgreich ausgestempelt!</p>
          </div>
        ) : openEntry ? (
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold text-green-700">{formatDuration(elapsed)}</p>
              <p className="text-xs text-green-600 mt-1">
                Eingestempelt seit {format(parseISO(openEntry.clock_in), 'HH:mm', { locale: de })} Uhr
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="label text-left">Pause (min)</label>
                <input type="number" className="input-field" value={breakMinutes}
                  onChange={e => setBreakMinutes(e.target.value)} min="0" step="5" />
              </div>
              <div>
                <label className="label text-left">Notiz</label>
                <input className="input-field" placeholder="Optional …" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>
            <button onClick={clockOut} disabled={loading}
              className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              <LogOut size={20} /> Ausstempeln
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto">
              <Clock size={28} className="text-brand-500" />
            </div>
            <p className="text-sm text-gray-500">Noch nicht eingestempelt</p>
            <button onClick={clockIn} disabled={loading}
              className="w-full py-3 rounded-2xl btn-primary flex items-center justify-center gap-2 text-base disabled:opacity-50">
              <LogIn size={20} /> Einstempeln
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {entries.filter(e => e.clock_out).length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Letzte Einträge</p>
          </div>
          <div className="divide-y divide-gray-50">
            {entries.filter(e => e.clock_out).slice(0, 10).map(e => {
              const duration = differenceInMinutes(new Date(e.clock_out!), new Date(e.clock_in)) - (e.break_minutes ?? 0)
              return (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {format(parseISO(e.clock_in), 'EEE d. MMM', { locale: de })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(parseISO(e.clock_in), 'HH:mm')} – {format(parseISO(e.clock_out!), 'HH:mm')}
                      {e.break_minutes ? ` · ${e.break_minutes} min Pause` : ''}
                    </p>
                    {e.notes && <p className="text-xs text-gray-400 italic">{e.notes}</p>}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{formatDuration(Math.max(duration, 0))}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
