'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Send, CheckCircle2, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface LeaveRequest {
  id: string
  start_date: string
  end_date: string
  leave_type: string
  notes: string | null
  status: string
  created_at: string
}

interface Props {
  userId: string
  siteId: string
  requests: LeaveRequest[]
}

const STATUS_CONFIG = {
  pending:  { label: 'Ausstehend', color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Genehmigt',  color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Abgelehnt',  color: 'bg-red-100 text-red-700' },
}

const LEAVE_TYPES = [
  { value: 'vacation', label: 'Urlaub' },
  { value: 'sick',     label: 'Krank' },
  { value: 'personal', label: 'Persönlich' },
  { value: 'other',    label: 'Sonstiges' },
]

export default function UrlaubClient({ userId, siteId, requests: initial }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [requests, setRequests] = useState<LeaveRequest[]>(initial)
  const [open, setOpen] = useState(false)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [leaveType, setLeaveType] = useState('vacation')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit() {
    if (!startDate || !endDate) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('leave_requests').insert({
      site_id: siteId,
      staff_id: userId,
      start_date: startDate,
      end_date: endDate,
      leave_type: leaveType,
      notes: reason.trim() || null,
      status: 'pending',
    }).select().single()

    setSaving(false)
    if (data) {
      setRequests(prev => [data as LeaveRequest, ...prev])
      setSaved(true)
      setReason('')
      setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
    }
  }

  async function cancelRequest(id: string) {
    const supabase = createClient()
    await supabase.from('leave_requests').delete().eq('id', id).eq('status', 'pending')
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Submit form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <Plus size={16} className="text-brand-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Antrag stellen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className="label">Von *</label>
                <input type="date" className="input-field" value={startDate}
                  min={today} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Bis *</label>
                <input type="date" className="input-field" value={endDate}
                  min={startDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Art</label>
              <select className="input-field" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Begründung (optional)</label>
              <textarea className="input-field resize-none" rows={2}
                value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <button onClick={handleSubmit} disabled={!startDate || !endDate || saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Eingereicht!</>
                : saving ? 'Sende…'
                : <><Send size={15} /> Antrag einreichen</>}
            </button>
          </div>
        )}
      </div>

      {/* Request list */}
      {requests.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-gray-400">Noch keine Anträge gestellt</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(r => {
            const status = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
            const typeLabel = LEAVE_TYPES.find(t => t.value === r.leave_type)?.label ?? r.leave_type
            return (
              <div key={r.id} className="card p-3 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${status.color}`}>{status.label}</span>
                    <span className="text-xs text-gray-500">{typeLabel}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {format(parseISO(r.start_date), 'd. MMM', { locale: de })}
                    {r.start_date !== r.end_date && ` – ${format(parseISO(r.end_date), 'd. MMM yyyy', { locale: de })}`}
                    {r.start_date === r.end_date && ` ${parseISO(r.start_date).getFullYear()}`}
                  </p>
                  {r.notes && <p className="text-xs text-gray-400 mt-0.5">{r.notes}</p>}
                </div>
                {r.status === 'pending' && (
                  <button onClick={() => cancelRequest(r.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 flex-shrink-0">
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
}
