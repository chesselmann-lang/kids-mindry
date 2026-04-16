'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Camera, Check, Loader2, Info } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Guardian {
  id: string
  child_id: string
  full_name: string
  consent_photos: boolean
  consent_signed_at: string | null
  children: {
    id: string
    first_name: string
    last_name: string
    date_of_birth: string | null
  } | null
}

export default function ConsentManager({ guardians }: { guardians: Guardian[] }) {
  const supabase = createClient()
  const [consents, setConsents] = useState<Record<string, boolean>>(
    Object.fromEntries(guardians.map(g => [g.id, g.consent_photos]))
  )
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  async function toggleConsent(guardianId: string, value: boolean) {
    setSaving(s => ({ ...s, [guardianId]: true }))
    const { error } = await supabase
      .from('guardians')
      .update({
        consent_photos: value,
        consent_signed_at: value ? new Date().toISOString() : null,
      })
      .eq('id', guardianId)
    setSaving(s => ({ ...s, [guardianId]: false }))
    if (!error) {
      setConsents(c => ({ ...c, [guardianId]: value }))
      setSaved(s => ({ ...s, [guardianId]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [guardianId]: false })), 2000)
    }
  }

  if (guardians.length === 0) {
    return (
      <div className="card p-10 text-center">
        <ShieldCheck size={40} className="text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Kein Kind verknüpft</p>
        <p className="text-xs text-gray-400 mt-1">Bitte wenden Sie sich an die Kita</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Info box */}
      <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl text-xs text-blue-700">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <span>
          Die Kita darf Fotos Ihres Kindes nur mit Ihrer ausdrücklichen Einwilligung machen und weiterverwenden.
          Sie können diese Einwilligung jederzeit widerrufen.
        </span>
      </div>

      {guardians.map(g => {
        const child = g.children
        const given = consents[g.id] ?? false
        const isSaving = saving[g.id]
        const wasSaved = saved[g.id]
        const signedAt = g.consent_signed_at

        return (
          <div key={g.id} className="card p-5 space-y-4">
            {/* Child name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                {child?.first_name?.[0]}{child?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{child?.first_name} {child?.last_name}</p>
                {child?.date_of_birth && (
                  <p className="text-xs text-gray-400">
                    * {format(new Date(child.date_of_birth), 'd. MMMM yyyy', { locale: de })}
                  </p>
                )}
              </div>
            </div>

            {/* Photo consent toggle */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Camera size={18} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Foto-Einwilligung</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ich bin damit einverstanden, dass Fotos meines Kindes in der Kita-App und in Gruppenalben veröffentlicht werden dürfen.
                </p>
                {given && signedAt && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Erteilt am {format(new Date(signedAt), 'd. MMM yyyy', { locale: de })}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                <button
                  onClick={() => toggleConsent(g.id, !given)}
                  disabled={isSaving}
                  className={`relative w-12 h-6 rounded-full transition-colors ${given ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  {isSaving ? (
                    <Loader2 size={12} className="absolute inset-0 m-auto animate-spin text-white" />
                  ) : (
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${given ? 'translate-x-6.5' : 'translate-x-0.5'}`} />
                  )}
                </button>
                <span className={`text-[10px] font-medium ${given ? 'text-green-600' : 'text-gray-400'}`}>
                  {given ? 'Erteilt' : 'Nicht erteilt'}
                </span>
                {wasSaved && (
                  <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                    <Check size={10} /> Gespeichert
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <div className="text-xs text-gray-400 text-center px-4">
        Gemäß DSGVO Art. 6 Abs. 1 lit. a. Fragen Sie bei der Kita-Leitung nach weiteren Informationen zum Datenschutz.
      </div>
    </div>
  )
}
