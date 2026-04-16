'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Check, AlertCircle } from 'lucide-react'

const DAYS = [
  { key: 'Mo', label: 'Mo' },
  { key: 'Di', label: 'Di' },
  { key: 'Mi', label: 'Mi' },
  { key: 'Do', label: 'Do' },
  { key: 'Fr', label: 'Fr' },
]

interface Props {
  child: {
    id: string
    first_name: string
    last_name: string
    allergies?: string | null
    medical_notes?: string | null
    emergency_contact_name?: string | null
    emergency_contact_phone?: string | null
    doctor_name?: string | null
    doctor_phone?: string | null
    care_days?: string[] | null
    care_start_time?: string | null
    care_end_time?: string | null
  }
}

export default function GesundheitForm({ child }: Props) {
  const supabase = createClient()

  const [allergies, setAllergies] = useState(child.allergies ?? '')
  const [medicalNotes, setMedicalNotes] = useState(child.medical_notes ?? '')
  const [emergencyName, setEmergencyName] = useState(child.emergency_contact_name ?? '')
  const [emergencyPhone, setEmergencyPhone] = useState(child.emergency_contact_phone ?? '')
  const [doctorName, setDoctorName] = useState(child.doctor_name ?? '')
  const [doctorPhone, setDoctorPhone] = useState(child.doctor_phone ?? '')
  const [careDays, setCareDays] = useState<string[]>(child.care_days ?? [])
  const [careStart, setCareStart] = useState(child.care_start_time?.slice(0, 5) ?? '')
  const [careEnd, setCareEnd] = useState(child.care_end_time?.slice(0, 5) ?? '')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDay(day: string) {
    setCareDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const { error: err } = await supabase
      .from('children')
      .update({
        allergies: allergies || null,
        medical_notes: medicalNotes || null,
        emergency_contact_name: emergencyName || null,
        emergency_contact_phone: emergencyPhone || null,
        doctor_name: doctorName || null,
        doctor_phone: doctorPhone || null,
        care_days: careDays,
        care_start_time: careStart || null,
        care_end_time: careEnd || null,
      })
      .eq('id', child.id)

    setSaving(false)
    if (err) {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="space-y-5">
      {/* Notfallkontakt */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Notfallkontakt</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Vollständiger Name"
              value={emergencyName}
              onChange={e => setEmergencyName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Telefon</label>
            <input
              type="tel"
              className="input w-full"
              placeholder="+49 ..."
              value={emergencyPhone}
              onChange={e => setEmergencyPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Kinderarzt */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Kinderarzt</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Name / Praxis</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Dr. ..."
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Telefon</label>
            <input
              type="tel"
              className="input w-full"
              placeholder="+49 ..."
              value={doctorPhone}
              onChange={e => setDoctorPhone(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Gesundheit */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Gesundheit</h2>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Allergien & Unverträglichkeiten</label>
          <textarea
            className="input w-full resize-none"
            rows={3}
            placeholder="z.B. Laktoseintoleranz, Nussallergie ..."
            value={allergies}
            onChange={e => setAllergies(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Medizinische Hinweise</label>
          <textarea
            className="input w-full resize-none"
            rows={3}
            placeholder="z.B. Medikamente, Einschränkungen ..."
            value={medicalNotes}
            onChange={e => setMedicalNotes(e.target.value)}
          />
        </div>
      </div>

      {/* Betreuungszeiten */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Betreuungszeiten</h2>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">Betreuungstage</label>
          <div className="flex gap-2">
            {DAYS.map(d => (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleDay(d.key)}
                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${
                  careDays.includes(d.key)
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Betreuung von</label>
            <input
              type="time"
              className="input w-full"
              value={careStart}
              onChange={e => setCareStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Betreuung bis</label>
            <input
              type="time"
              className="input w-full"
              value={careEnd}
              onChange={e => setCareEnd(e.target.value)}
            />
          </div>
        </div>
        {careDays.length > 0 && careStart && careEnd && (
          <p className="text-xs text-gray-400">
            {careDays.join(', ')} · {careStart} – {careEnd} Uhr
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full"
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Wird gespeichert …
          </span>
        ) : saved ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={16} /> Gespeichert
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Save size={16} /> Speichern
          </span>
        )}
      </button>
    </div>
  )
}
