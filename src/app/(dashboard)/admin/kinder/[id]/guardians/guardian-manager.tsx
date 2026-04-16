'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, CheckCircle2, X, Phone, User, Trash2, LinkIcon, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Guardian {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  relationship: string
  is_primary: boolean
  can_pickup: boolean
  consent_photos: boolean
  consent_signed_at: string | null
  user_id: string | null
}

interface SiteUser { id: string; full_name: string | null; role: string }

interface Props {
  childId: string
  guardians: Guardian[]
  siteUsers: SiteUser[]
}

const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  relationship: 'parent',
  is_primary: false,
  can_pickup: true,
  user_id: '',
}

export default function GuardianManager({ childId, guardians: initial, siteUsers }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [guardians, setGuardians] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function save() {
    if (!form.full_name.trim()) return
    setSubmitting(true)

    const { data, error } = await supabase.from('guardians').insert({
      child_id: childId,
      full_name: form.full_name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      relationship: form.relationship,
      is_primary: form.is_primary,
      can_pickup: form.can_pickup,
      user_id: form.user_id || null,
    }).select().single()

    if (!error && data) {
      setGuardians(prev => [...prev, data as Guardian])
      setShowForm(false)
      setForm(emptyForm)
      router.refresh()
    }
    setSubmitting(false)
  }

  async function deleteGuardian(id: string) {
    if (!confirm('Erziehungsberechtigten wirklich entfernen?')) return
    setDeleting(id)
    await supabase.from('guardians').delete().eq('id', id)
    setGuardians(prev => prev.filter(g => g.id !== id))
    setDeleting(null)
  }

  async function linkUser(guardianId: string, userId: string) {
    await supabase.from('guardians').update({ user_id: userId || null }).eq('id', guardianId)
    setGuardians(prev => prev.map(g => g.id === guardianId ? { ...g, user_id: userId || null } : g))
    router.refresh()
  }

  async function toggleConsent(guardianId: string, current: boolean) {
    const newVal = !current
    const signedAt = newVal ? new Date().toISOString() : null
    await supabase.from('guardians').update({ consent_photos: newVal, consent_signed_at: signedAt }).eq('id', guardianId)
    setGuardians(prev => prev.map(g =>
      g.id === guardianId ? { ...g, consent_photos: newVal, consent_signed_at: signedAt } : g
    ))
  }

  return (
    <div className="space-y-4">
      {/* Existing guardians */}
      {guardians.length === 0 ? (
        <div className="card p-8 text-center">
          <User size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Erziehungsberechtigten eingetragen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guardians.map(g => {
            const linkedUser = siteUsers.find(u => u.id === g.user_id)
            return (
              <div key={g.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{g.full_name}</p>
                      {g.is_primary && (
                        <span className="text-[10px] bg-brand-100 text-brand-700 font-medium px-2 py-0.5 rounded-full">
                          Hauptkontakt
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{g.relationship}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {g.phone && (
                        <a href={`tel:${g.phone}`} className="flex items-center gap-1 text-xs text-brand-600">
                          <Phone size={11} /> {g.phone}
                        </a>
                      )}
                      {g.can_pickup && (
                        <span className="text-xs text-green-600">✓ Abholberechtigt</span>
                      )}
                    </div>

                    {/* Foto-Einwilligung */}
                    <div className="mt-3 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Camera size={12} className={g.consent_photos ? 'text-green-600' : 'text-gray-400'} />
                        <span className={g.consent_photos ? 'text-green-700 font-medium' : 'text-gray-500'}>
                          Foto-Einwilligung {g.consent_photos ? 'erteilt' : 'ausstehend'}
                        </span>
                        {g.consent_signed_at && g.consent_photos && (
                          <span className="text-gray-400">
                            ({new Date(g.consent_signed_at).toLocaleDateString('de-DE')})
                          </span>
                        )}
                      </label>
                      <button
                        onClick={() => toggleConsent(g.id, g.consent_photos)}
                        className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 ${g.consent_photos ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform mx-0.5 ${g.consent_photos ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Account linking */}
                    <div className="mt-3 flex items-center gap-2">
                      <LinkIcon size={12} className="text-gray-400" />
                      <select
                        value={g.user_id ?? ''}
                        onChange={e => linkUser(g.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 bg-white flex-1 max-w-xs"
                      >
                        <option value="">Kein Account verknüpft</option>
                        {siteUsers.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.full_name ?? u.id.slice(0, 8)}
                          </option>
                        ))}
                      </select>
                      {linkedUser && (
                        <span className="text-xs text-green-600 font-medium">✓ Verknüpft</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteGuardian(g.id)}
                    disabled={deleting === g.id}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    {deleting === g.id
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Trash2 size={15} />
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <div className="card p-5 space-y-4">
          <p className="font-semibold text-gray-900">Neuer Erziehungsberechtigter</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input className="input" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} placeholder="Vor- und Nachname" />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input className="input" type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+49 151..." />
            </div>
            <div>
              <label className="label">Beziehung</label>
              <select className="input" value={form.relationship} onChange={e => setForm(f => ({...f, relationship: e.target.value}))}>
                <option value="parent">Elternteil</option>
                <option value="grandparent">Großelternteil</option>
                <option value="sibling">Geschwister</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_primary} onChange={e => setForm(f => ({...f, is_primary: e.target.checked}))} className="rounded" />
              Hauptkontakt
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.can_pickup} onChange={e => setForm(f => ({...f, can_pickup: e.target.checked}))} className="rounded" />
              Abholberechtigt
            </label>
          </div>
          <div>
            <label className="label">App-Account verknüpfen (optional)</label>
            <select className="input" value={form.user_id} onChange={e => setForm(f => ({...f, user_id: e.target.value}))}>
              <option value="">Kein Account</option>
              {siteUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name ?? u.id.slice(0, 8)}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {setShowForm(false); setForm(emptyForm)}} className="btn-secondary flex-1">
              <X size={16} /> Abbrechen
            </button>
            <button onClick={save} disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Speichern
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-secondary w-full py-3">
          <Plus size={18} /> Erziehungsberechtigten hinzufügen
        </button>
      )}
    </div>
  )
}
