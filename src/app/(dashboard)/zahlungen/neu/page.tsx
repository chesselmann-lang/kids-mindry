'use client'

import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Euro, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AiZahlungNeu from './ai-zahlung-neu'

export default function NeueZahlungPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!title || !amount) { setError('Titel und Betrag sind Pflichtfelder'); return }
    setSaving(true); setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles').select('site_id').eq('id', user.id).single()

    const cents = Math.round(parseFloat(amount.replace(',', '.')) * 100)
    if (isNaN(cents) || cents <= 0) { setError('Ungültiger Betrag'); setSaving(false); return }

    const { error: err } = await supabase.from('payment_items').insert({
      title,
      description: description || null,
      amount: cents,
      currency: 'eur',
      due_date: dueDate || null,
      site_id: (profile as any).site_id,
      created_by: user.id,
    })

    if (err) { setError(err.message); setSaving(false); return }
    setSaved(true)
    setTimeout(() => router.push('/zahlungen'), 1500)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/zahlungen" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Neue Zahlung</h1>
          <p className="text-sm text-gray-400">Zahlungsposten erstellen</p>
        </div>
      </div>

      <AiZahlungNeu />

      <div className="card p-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Titel *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="z.B. Monatsbeitrag Mai, Ausflug Zoo"
            className="input mt-1 w-full"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Beschreibung</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="input mt-1 w-full resize-none"
            placeholder="Optional"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Betrag (€) *</label>
            <div className="relative mt-1">
              <Euro size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                className="input w-full pl-8"
                type="text"
                inputMode="decimal"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fällig am</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="input mt-1 w-full"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 px-1">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2"
      >
        {saved ? (
          <><CheckCircle2 size={18} /> Gespeichert!</>
        ) : saving ? (
          <><Loader2 size={16} className="animate-spin" /> Speichere…</>
        ) : 'Zahlungsposten erstellen'}
      </button>
    </div>
  )
}
