'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Site {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
}

interface Props {
  site: Site | null
  siteId: string
}

export default function EinstellungenForm({ site, siteId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    name: site?.name ?? '',
    address: site?.address ?? '',
    phone: site?.phone ?? '',
    email: site?.email ?? '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.from('sites').update({
      name: form.name.trim(),
      address: form.address || null,
      phone: form.phone || null,
      email: form.email || null,
    }).eq('id', siteId)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh()
    }
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="card p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Allgemein</p>
        <div>
          <label className="label">Name der Einrichtung *</label>
          <input
            className="input"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Kita Sonnenschein"
            required
          />
        </div>
        <div>
          <label className="label">Adresse</label>
          <input
            className="input"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="Musterstraße 1, 12345 Musterstadt"
          />
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kontakt</p>
        <div>
          <label className="label">Telefon</label>
          <input
            type="tel"
            className="input"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+49 123 456789"
          />
        </div>
        <div>
          <label className="label">E-Mail</label>
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="info@kita.de"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
        {submitting
          ? <><Loader2 size={18} className="animate-spin" />Speichern...</>
          : saved
          ? <><CheckCircle2 size={18} />Gespeichert!</>
          : <><CheckCircle2 size={18} />Einstellungen speichern</>
        }
      </button>
    </form>
  )
}
