'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, ChevronDown, ChevronUp, ShoppingCart, Check, X, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

interface Order {
  id: string
  item_name: string
  quantity: string
  category: string | null
  priority: string
  status: string
  notes: string | null
  requested_by: string
  created_at: string
  profiles?: { full_name: string }
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: 'Niedrig',   color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Normal',    color: 'bg-blue-100 text-blue-700' },
  high:   { label: 'Dringend',  color: 'bg-red-100 text-red-700' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Beantragt',   color: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Genehmigt',   color: 'bg-green-100 text-green-700' },
  ordered:  { label: 'Bestellt',    color: 'bg-blue-100 text-blue-700' },
  received: { label: 'Eingegangen', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Abgelehnt',   color: 'bg-red-100 text-red-700' },
}

const CATEGORIES = ['Bastelmaterial', 'Hygiene', 'Bürobedarf', 'Spielzeug', 'Lebensmittel', 'Technik', 'Sonstiges']

interface Props {
  orders: Order[]
  userId: string
  siteId: string
  isAdmin: boolean
}

export default function MaterialClient({ orders: initial, userId, siteId, isAdmin }: Props) {
  const [orders, setOrders] = useState<Order[]>(initial)
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [category, setCategory] = useState('Bastelmaterial')
  const [priority, setPriority] = useState('medium')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('pending')

  async function handleSave() {
    if (!itemName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('material_orders').insert({
      site_id: siteId,
      requested_by: userId,
      item_name: itemName.trim(),
      quantity: quantity.trim(),
      category,
      priority,
      notes: notes.trim() || null,
      status: 'pending',
    }).select('*, profiles:requested_by(full_name)').single()
    setSaving(false)
    if (data) {
      setOrders(prev => [data as Order, ...prev])
      setItemName(''); setQuantity('1'); setNotes(''); setOpen(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    await supabase.from('material_orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  async function deleteOrder(id: string) {
    const supabase = createClient()
    await supabase.from('material_orders').delete().eq('id', id)
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const otherOrders = orders.filter(o => o.status !== 'pending')
  const displayOrders = filterStatus === 'pending' ? pendingOrders : otherOrders

  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        {['pending', 'ordered', 'received'].map(s => {
          const cfg = STATUS_CONFIG[s]
          const count = orders.filter(o => o.status === s).length
          return (
            <div key={s} className="card p-3 text-center">
              <p className="text-xl font-bold text-gray-800">{count}</p>
              <p className="text-[10px] text-gray-500">{cfg.label}</p>
            </div>
          )
        })}
      </div>

      {/* Add form */}
      <div className="card overflow-hidden">
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Plus size={16} className="text-emerald-600" />
            </div>
            <span className="font-semibold text-sm text-gray-900">Material beantragen</span>
          </div>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {open && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
            <div>
              <label className="label">Artikel *</label>
              <input className="input-field" value={itemName} onChange={e => setItemName(e.target.value)}
                placeholder="z.B. Wasserfarben 12er Set" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Menge</label>
                <input className="input-field" value={quantity} onChange={e => setQuantity(e.target.value)}
                  placeholder="z.B. 5 Stück" />
              </div>
              <div>
                <label className="label">Priorität</label>
                <select className="input-field" value={priority} onChange={e => setPriority(e.target.value)}>
                  {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
                    <option key={v} value={v}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Kategorie</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Notiz</label>
              <textarea className="input-field resize-none" rows={2} value={notes}
                onChange={e => setNotes(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={!itemName.trim() || saving}
              className="btn-primary w-full py-2.5 disabled:opacity-50">
              {saving ? 'Beantragen…' : 'Antrag einreichen'}
            </button>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
        <button onClick={() => setFilterStatus('pending')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${filterStatus === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Offen ({pendingOrders.length})
        </button>
        <button onClick={() => setFilterStatus('other')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${filterStatus !== 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          Alle anderen ({otherOrders.length})
        </button>
      </div>

      {/* List */}
      {displayOrders.length === 0 ? (
        <div className="card p-8 text-center">
          <ShoppingCart size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Bestellungen in diesem Status</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayOrders.map(o => {
            const pCfg = PRIORITY_CONFIG[o.priority] ?? PRIORITY_CONFIG.medium
            const sCfg = STATUS_CONFIG[o.status] ?? STATUS_CONFIG.pending
            return (
              <div key={o.id} className="card p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sCfg.color}`}>{sCfg.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${pCfg.color}`}>{pCfg.label}</span>
                    {o.category && <span className="text-[10px] text-gray-400">{o.category}</span>}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{o.item_name}</p>
                  <p className="text-xs text-gray-500">{o.quantity} · {o.profiles?.full_name}</p>
                  {o.notes && <p className="text-xs text-gray-400 italic mt-0.5">{o.notes}</p>}
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {isAdmin && o.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(o.id, 'approved')}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                        <Check size={13} />
                      </button>
                      <button onClick={() => updateStatus(o.id, 'rejected')}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                        <X size={13} />
                      </button>
                    </>
                  )}
                  {isAdmin && o.status === 'approved' && (
                    <button onClick={() => updateStatus(o.id, 'ordered')}
                      className="text-[10px] px-2 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold">
                      Bestellt
                    </button>
                  )}
                  {isAdmin && o.status === 'ordered' && (
                    <button onClick={() => updateStatus(o.id, 'received')}
                      className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 font-semibold">
                      Erhalten
                    </button>
                  )}
                  {(isAdmin || o.requested_by === userId) && (
                    <button onClick={() => deleteOrder(o.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
