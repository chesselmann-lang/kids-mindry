'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  profileId: string
  initialName: string
  initialPhone: string
  onClose: () => void
}

export default function EditForm({ profileId, initialName, initialPhone, onClose }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name.trim(), phone: phone.trim() || null })
      .eq('id', profileId)

    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Profil bearbeiten</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Vorname Nachname"
              required
            />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input
              type="tel"
              className="input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+49 151 12345678"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5">
          {submitting
            ? <><Loader2 size={18} className="animate-spin" />Speichern...</>
            : <><CheckCircle2 size={18} />Speichern</>
          }
        </button>
      </form>
    </div>
  )
}
