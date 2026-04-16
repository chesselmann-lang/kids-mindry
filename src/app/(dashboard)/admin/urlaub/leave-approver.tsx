'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Request {
  id: string
  start_date: string
  end_date: string
  leave_type: string
  reason: string | null
  status: string
  profiles?: { full_name: string; role: string }
}

interface Props {
  pending: Request[]
  others: Request[]
}

const LEAVE_LABELS: Record<string, string> = {
  vacation: 'Urlaub', sick: 'Krank', personal: 'Persönlich', other: 'Sonstiges',
}
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}
const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend', approved: 'Genehmigt', rejected: 'Abgelehnt',
}

export default function LeaveApprover({ pending: initialPending, others: initialOthers }: Props) {
  const [pending, setPending] = useState<Request[]>(initialPending)
  const [others, setOthers] = useState<Request[]>(initialOthers)

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    const supabase = createClient()
    await supabase.from('leave_requests').update({ status }).eq('id', id)
    const req = pending.find(r => r.id === id)
    if (req) {
      setPending(prev => prev.filter(r => r.id !== id))
      setOthers(prev => [{ ...req, status }, ...prev])
    }
  }

  return (
    <div className="space-y-4">
      {/* Pending requests */}
      {pending.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Zur Genehmigung</p>
          <div className="space-y-2">
            {pending.map(r => (
              <div key={r.id} className="card p-4 border-l-4 border-amber-400">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.profiles?.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {LEAVE_LABELS[r.leave_type] ?? r.leave_type}
                      {' · '}{format(parseISO(r.start_date), 'd. MMM', { locale: de })}
                      {r.start_date !== r.end_date && ` – ${format(parseISO(r.end_date), 'd. MMM yyyy', { locale: de })}`}
                      {r.start_date === r.end_date && ` ${parseISO(r.start_date).getFullYear()}`}
                    </p>
                    {r.notes && <p className="text-xs text-gray-500 mt-0.5 italic">{r.notes}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(r.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-100 rounded-xl text-xs font-semibold text-green-700 hover:bg-green-200 transition-colors">
                    <CheckCircle2 size={14} /> Genehmigen
                  </button>
                  <button onClick={() => updateStatus(r.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-100 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-200 transition-colors">
                    <XCircle size={14} /> Ablehnen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="card p-6 text-center">
          <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Keine offenen Anträge</p>
        </div>
      )}

      {/* History */}
      {others.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Verlauf</p>
          <div className="space-y-2">
            {others.slice(0, 20).map(r => (
              <div key={r.id} className="card p-3 flex items-center gap-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[r.status] ?? r.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{r.profiles?.full_name}</p>
                  <p className="text-[10px] text-gray-400">
                    {format(parseISO(r.start_date), 'd. MMM', { locale: de })}
                    {r.start_date !== r.end_date && ` – ${format(parseISO(r.end_date), 'd. MMM', { locale: de })}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
