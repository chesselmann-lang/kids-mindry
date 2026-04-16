'use client'

import { useState } from 'react'
import { AlertTriangle, Plus, ChevronDown, ChevronUp, CheckCircle2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
  staffId: string
  siteId: string
}

export default function UnfallForm({ children, staffId, siteId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [injuryType, setInjuryType] = useState('')
  const [firstAid, setFirstAid] = useState('')
  const [witness, setWitness] = useState('')
  const [parentNotified, setParentNotified] = useState(false)
  const [severity, setSeverity] = useState('minor')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!childId || !description.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('incident_reports').insert({
      child_id: childId,
      site_id: siteId,
      title: injuryType.trim() || 'Unfallbericht',
      incident_type: injuryType.trim() || 'accident',
      description: description.trim(),
      location: location.trim() || null,
      first_aid: firstAid.trim() || null,
      witnesses: witness.trim() || null,
      parent_notified: parentNotified,
      parent_notified_at: parentNotified ? new Date().toISOString() : null,
      reported_by: staffId,
      severity,
    })

    setSaving(false)
    setSaved(true)
    setChildId(''); setDescription(''); setLocation(''); setInjuryType('')
    setFirstAid(''); setWitness(''); setParentNotified(false); setSeverity('minor')
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
            <Plus size={16} className="text-red-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Neuer Unfallbericht</span>
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

          {/* Schweregrad */}
          <div>
            <label className="label">Schweregrad</label>
            <div className="flex gap-2">
              {[
                { v: 'minor', l: '🟡 Leicht' },
                { v: 'moderate', l: '🟠 Mittel' },
                { v: 'serious', l: '🔴 Schwer' },
              ].map(s => (
                <button key={s.v} onClick={() => setSeverity(s.v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${severity === s.v ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Ort</label>
              <input className="input-field" placeholder="z.B. Spielplatz" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="label">Verletzung</label>
              <input className="input-field" placeholder="z.B. Schürfwunde" value={injuryType} onChange={e => setInjuryType(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Beschreibung *</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Was ist passiert?"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="label">Erste Hilfe</label>
            <input className="input-field" placeholder="Durchgeführte Maßnahmen…" value={firstAid} onChange={e => setFirstAid(e.target.value)} />
          </div>
          <div>
            <label className="label">Zeugen</label>
            <input className="input-field" placeholder="Namen der anwesenden Personen" value={witness} onChange={e => setWitness(e.target.value)} />
          </div>

          <div className="flex items-center justify-between py-1">
            <p className="text-sm text-gray-700">Eltern wurden informiert</p>
            <button onClick={() => setParentNotified(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${parentNotified ? 'bg-brand-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${parentNotified ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <button onClick={handleSave} disabled={!childId || !description.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={15} /> Bericht speichern</>}
          </button>
        </div>
      )}
    </div>
  )
}
