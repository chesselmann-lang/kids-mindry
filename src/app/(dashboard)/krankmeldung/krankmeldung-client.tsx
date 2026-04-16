'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle2, Thermometer, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface SickReport {
  id: string
  start_date: string
  end_date: string | null
  notes: string | null
  status: string
  created_at: string
}

interface Props {
  userId: string
  siteId: string
  today: string
  reports: SickReport[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Eingereicht', color: 'bg-amber-100 text-amber-700' },
  noted:    { label: 'Zur Kenntnis genommen', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Zurückgewiesen', color: 'bg-red-100 text-red-700' },
}

export default function KrankmeldungClient({ userId, siteId, today, reports: initial }: Props) {
  const [reports, setReports] = useState<SickReport[]>(initial)
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit() {
    if (!startDate) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('sick_reports').insert({
      site_id: siteId,
      staff_id: userId,
      start_date: startDate,
      end_date: endDate || null,
      notes: notes.trim() || null,
      status: 'pending',
    }).select().single()
    setSaving(false)
    if (data) {
      setReports(prev => [data as SickReport, ...prev])
      setSaved(true)
      setNotes('')
      setTimeout(() => { setSaved(false); setOpen(false) }, 1400)
    }
  }

  async function cancelReport(id: string) {
    const supabase = createClient()
    await supabase.from('sick_reports').delete().eq('id', id).eq('status', 'pending')
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const activeReport = reports.find(r => {
    const end = r.end_date ?? r.start_date
    return end >= today && r.start_date <= today
  })

  return (
    <div className="space-y-4">
      {/* Current status banner */}
      {activeReport && (
        <div className="card p-4 bg-red-50 border border-red-100 flex items-center gap-3">
          <Thermometer size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Aktuell krankgemeldet</p>
            <p className="text-xs text-red-600">
              Seit {format(parseISO(activeReport.start_date), 'd. MMMM', { locale: de })}
              {activeReport.end_date && ` bis ${format(parseISO(activeReport.end_date), 'd. MMMM', { locale: de })}`}
            </p>
          </div>
        </div>
      )}

      {/* New report form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Plus size={16} className="text-red-500" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Krank melden</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Erster Kranktag *</label>
                <input type="date" className="input-field" value={startDate}
                  onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Voraussichtlich bis</label>
                <input type="date" className="input-field" value={endDate}
                  min={startDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Hinweis (optional)</label>
              <textarea className="input-field resize-none" rows={2}
                placeholder="z.B. Attest folgt per Post"
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleSubmit} disabled={!startDate || saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Gemeldet!</>
                : saving ? 'Sende…'
                : <><Send size={15} /> Krankmeldung einreichen</>}
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {reports.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verlauf</p>
          <div className="space-y-2">
            {reports.map(r => {
              const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending
              return (
                <div key={r.id} className="card p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      {format(parseISO(r.start_date), 'd. MMM', { locale: de })}
                      {r.end_date && r.end_date !== r.start_date && ` – ${format(parseISO(r.end_date), 'd. MMM yyyy', { locale: de })}`}
                      {(!r.end_date || r.end_date === r.start_date) && ` ${parseISO(r.start_date).getFullYear()}`}
                    </p>
                    {r.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{r.notes}</p>}
                  </div>
                  {r.status === 'pending' && (
                    <button onClick={() => cancelReport(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
