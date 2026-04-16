'use client'

import { useState } from 'react'
import { CheckCircle2, Clock, CreditCard, Euro, Plus, FileText, Loader2, Receipt, Landmark, Calculator, ListOrdered } from 'lucide-react'
import { formatAmount } from '@/lib/stripe'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const PaymentModal = dynamic(() => import('@/components/features/payment-modal'), { ssr: false })

interface PaymentItem {
  id: string
  title: string
  description: string | null
  amount: number
  currency: string
  due_date: string | null
  created_at: string
}

interface Props {
  items: PaymentItem[]
  paidItemIds: string[]
  userId: string
  role: string
}

function LexofficeButton({ itemId, itemTitle }: { itemId: string; itemTitle: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/lexoffice/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentItemId: itemId, finalize: false }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Fehler')
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) return <span className="text-xs text-green-600 font-medium">✓ Rechnung erstellt</span>
  if (error) return <span className="text-xs text-red-500">{error.includes('not configured') ? 'Lexoffice nicht konfiguriert' : error}</span>

  return (
    <button
      onClick={create}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600 transition-colors"
      title="Lexoffice-Rechnung erstellen"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
      Rechnung
    </button>
  )
}

export default function ZahlungenClient({ items, paidItemIds: initial, role }: Props) {
  const [paidIds, setPaidIds] = useState(new Set(initial))
  const [activeItem, setActiveItem] = useState<PaymentItem | null>(null)

  const open = items.filter(i => !paidIds.has(i.id))
  const done = items.filter(i => paidIds.has(i.id))
  const total = open.reduce((s, i) => s + i.amount, 0)
  const isAdmin = role === 'admin'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Zahlungen</h1>
          <p className="text-sm text-gray-400">Kita-Beiträge & Auslagen</p>
        </div>
        {(role === 'admin' || role === 'erzieher') && (
          <a href="/zahlungen/neu" className="btn-primary px-4 py-2 flex items-center gap-1.5 text-sm">
            <Plus size={16} /> Neu
          </a>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/zahlungen/lastschrift"
          className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex-shrink-0 flex items-center justify-center">
            <Landmark size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Lastschrift</p>
            <p className="text-xs text-gray-400">SEPA einrichten</p>
          </div>
        </Link>
        <Link href="/zahlungen/steuerbescheinigung"
          className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex-shrink-0 flex items-center justify-center">
            <Receipt size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Steuerbescheinigung</p>
            <p className="text-xs text-gray-400">§ 10 EStG</p>
          </div>
        </Link>
        {isAdmin && (
          <>
            <Link href="/zahlungen/sozialstaffel"
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 flex-shrink-0 flex items-center justify-center">
                <Calculator size={18} className="text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Sozialstaffel</p>
                <p className="text-xs text-gray-400">Beitrag berechnen</p>
              </div>
            </Link>
            <Link href="/zahlungen/bescheide"
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 flex-shrink-0 flex items-center justify-center">
                <ListOrdered size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Monatsbescheide</p>
                <p className="text-xs text-gray-400">Rechnungen erstellen</p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Summary */}
      {open.length > 0 && (
        <div className="card p-4 bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Euro size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Offen: {formatAmount(total)}</p>
              <p className="text-xs text-amber-600">{open.length} {open.length === 1 ? 'Zahlung' : 'Zahlungen'} ausstehend</p>
            </div>
          </div>
        </div>
      )}

      {/* Open items */}
      {open.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Offen</p>
          <div className="space-y-2">
            {open.map(item => (
              <div key={item.id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 flex-shrink-0 flex items-center justify-center">
                  <CreditCard size={18} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{item.title}</p>
                  {item.due_date && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} />
                      Fällig: {new Date(item.due_date).toLocaleDateString('de-DE')}
                    </p>
                  )}
                  {isAdmin && (
                    <div className="mt-1">
                      <LexofficeButton itemId={item.id} itemTitle={item.title} />
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 text-sm">{formatAmount(item.amount, item.currency)}</p>
                  <button
                    onClick={() => setActiveItem(item)}
                    className="mt-1 text-xs font-medium text-brand-600 hover:text-brand-800"
                  >
                    Jetzt zahlen →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid items */}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Bezahlt</p>
          <div className="space-y-2">
            {done.map(item => (
              <div key={item.id} className="card p-4 flex items-center gap-3 opacity-60">
                <div className="w-10 h-10 rounded-2xl bg-green-50 flex-shrink-0 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-700 truncate">{item.title}</p>
                </div>
                <p className="font-medium text-sm text-gray-500">{formatAmount(item.amount, item.currency)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Keine offenen Zahlungen</p>
        </div>
      )}

      {activeItem && (
        <PaymentModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onPaid={() => setPaidIds(prev => new Set([...prev, activeItem.id]))}
        />
      )}
    </div>
  )
}
