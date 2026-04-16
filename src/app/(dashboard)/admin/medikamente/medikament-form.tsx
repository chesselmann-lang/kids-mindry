'use client'

import { useState } from 'react'
import { Pill, Plus, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
  staffId: string
  staffName: string
  siteId: string
}

export default function MedikamentForm({ children, staffId, staffName, siteId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [medicationName, setMedicationName] = useState('')
  const [dosage, setDosage] = useState('')
  const [notes, setNotes] = useState('')
  const [parentConsent, setParentConsent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!childId || !medicationName.trim() || !dosage.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('medication_logs').insert({
      child_id: childId,
      site_id: siteId,
      medication_name: medicationName.trim(),
      dosage: dosage.trim(),
      administered_at: new Date().toISOString(),
      administered_by: staffId,
      notes: notes.trim() || null,
      parent_consent: parentConsent,
    })

    setSaving(false)
    setSaved(true)
    setChildId(''); setMedicationName(''); setDosage(''); setNotes(''); setParentConsent(false)
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
            <Plus size={16} className="text-purple-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Neue Medikamentengabe</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          <div>
            <label className="label mt-3">Kind *</label>
            <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
              <option value="">Kind auswählen…</option>
              {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Medikament *</label>
              <input className="input-field" placeholder="z.B. Ibuprofen" value={medicationName} onChange={e => setMedicationName(e.target.value)} />
            </div>
            <div>
              <label className="label">Dosierung *</label>
              <input className="input-field" placeholder="z.B. 5ml" value={dosage} onChange={e => setDosage(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Hinweise</label>
            <input className="input-field" placeholder="Besonderheiten, Grund…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex items-center justify-between py-1">
            <p className="text-sm text-gray-700">Elterliche Einwilligung vorliegt</p>
            <button onClick={() => setParentConsent(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${parentConsent ? 'bg-brand-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${parentConsent ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <button onClick={handleSave} disabled={!childId || !medicationName.trim() || !dosage.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Pill size={15} /> Jetzt dokumentieren</>}
          </button>
        </div>
      )}
    </div>
  )
}
