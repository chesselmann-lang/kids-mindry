'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Save, CheckCircle2, Euro } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Child { id: string; first_name: string; last_name: string }
interface Fee {
  id: string
  child_id: string
  period_month: string
  amount: number
  status: 'unpaid' | 'paid' | 'overdue'
  due_date: string | null
  notes: string | null
  children?: { first_name: string; last_name: string }
}

interface Props {
  siteId: string
  staffId: string
  children: Child[]
  fees: Fee[]
}

const STATUS_LABELS = { unpaid: 'Offen', paid: 'Bezahlt', overdue: 'Überfällig' }
const STATUS_COLORS = {
  unpaid:  'bg-amber-100 text-amber-700',
  paid:    'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function GebuehrenManager({ siteId, staffId, children, fees: initialFees }: Props) {
  const router = useRouter()
  const thisMonth = new Date().toISOString().slice(0, 7) + '-01'
  const [fees, setFees] = useState<Fee[]>(initialFees)
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [periodMonth, setPeriodMonth] = useState(thisMonth.slice(0, 7))
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!childId || !amount) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('fees').insert({
      site_id: siteId,
      child_id: childId,
      period: periodMonth + '-01',
      amount: parseFloat(amount),
      status: 'unpaid',
      due_date: dueDate || null,
      notes: notes.trim() || null,
      created_by: staffId,
    }).select('*, children(first_name, last_name)').single()

    setSaving(false)
    if (data) {
      setFees(prev => [data as Fee, ...prev])
      setSaved(true)
      setChildId(''); setAmount(''); setDueDate(''); setNotes('')
      setTimeout(() => { setSaved(false); setOpen(false) }, 1200)
    }
  }

  async function updateStatus(id: string, status: 'unpaid' | 'paid' | 'overdue') {
    const supabase = createClient()
    const updates: any = { status }
    if (status === 'paid') updates.paid_at = new Date().toISOString()
    await supabase.from('fees').update(updates).eq('id', id)
    setFees(prev => prev.map(f => f.id === id ? { ...f, status } : f))
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
              <Plus size={16} className="text-green-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Gebühr eintragen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {open && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className="label">Kind *</label>
                <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
                  <option value="">Auswählen…</option>
                  {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Monat *</label>
                <input type="month" className="input-field" value={periodMonth} onChange={e => setPeriodMonth(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Betrag (€) *</label>
                <input type="number" step="0.01" className="input-field" placeholder="0.00"
                  value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Fällig am</label>
                <input type="date" className="input-field" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Notiz</label>
              <input className="input-field" placeholder="z.B. inkl. Verpflegung" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={!childId || !amount || saving}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={15} /> Gebühr speichern</>}
            </button>
          </div>
        )}
      </div>

      {/* Fee list */}
      <div className="space-y-2">
        {fees.length === 0 ? (
          <div className="card p-8 text-center">
            <Euro size={32} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Noch keine Gebühren eingetragen</p>
          </div>
        ) : fees.map(fee => (
          <div key={fee.id} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {fee.children?.first_name} {fee.children?.last_name}
                </p>
                <p className="text-xs text-gray-400">
                  {format(parseISO(fee.period_month), 'MMMM yyyy', { locale: de })}
                </p>
              </div>
              <p className="text-lg font-bold text-gray-800">{Number(fee.amount).toFixed(2)} €</p>
            </div>
            <div className="flex items-center gap-2">
              {(['unpaid', 'paid', 'overdue'] as const).map(s => (
                <button key={s}
                  onClick={() => updateStatus(fee.id, s)}
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full transition-all ${
                    fee.status === s ? STATUS_COLORS[s] : 'bg-gray-100 text-gray-400'
                  }`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
            {fee.notes && <p className="text-xs text-gray-400 mt-1">{fee.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
