'use client'

import { useState } from 'react'
import { Plus, ChevronDown, ChevronUp, Save, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  children: { id: string; first_name: string; last_name: string }[]
  staffId: string
  siteId: string
}

export default function ElterngespraechForm({ children, staffId, siteId }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState('')
  const [meetingDate, setMeetingDate] = useState(today)
  const [attendees, setAttendees] = useState('')
  const [topics, setTopics] = useState('')
  const [agreements, setAgreements] = useState('')
  const [nextMeeting, setNextMeeting] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!childId || !topics.trim()) return
    setSaving(true)
    const supabase = createClient()

    await supabase.from('parent_meetings').insert({
      child_id: childId,
      site_id: siteId,
      meeting_date: meetingDate,
      attendees: attendees.trim() || null,
      topics: topics.trim(),
      agreements: agreements.trim() || null,
      next_meeting: nextMeeting || null,
      conducted_by: staffId,
    })

    setSaving(false)
    setSaved(true)
    setChildId(''); setAttendees(''); setTopics(''); setAgreements(''); setNextMeeting('')
    setTimeout(() => { setSaved(false); setOpen(false) }, 1500)
    router.refresh()
  }

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
            <Plus size={16} className="text-brand-600" />
          </div>
          <span className="font-semibold text-sm text-gray-900">Neues Gespräch dokumentieren</span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div>
              <label className="label">Kind *</label>
              <select className="input-field" value={childId} onChange={e => setChildId(e.target.value)}>
                <option value="">Auswählen…</option>
                {children.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Datum</label>
              <input type="date" className="input-field" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Anwesende Personen</label>
            <input className="input-field" placeholder="z.B. Frau Müller (Mutter), Hr. Schmidt (Erzieher)"
              value={attendees} onChange={e => setAttendees(e.target.value)} />
          </div>
          <div>
            <label className="label">Besprochene Themen *</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder="Was wurde besprochen?"
              value={topics} onChange={e => setTopics(e.target.value)} />
          </div>
          <div>
            <label className="label">Vereinbarungen</label>
            <textarea className="input-field resize-none" rows={2}
              placeholder="Getroffene Vereinbarungen und nächste Schritte…"
              value={agreements} onChange={e => setAgreements(e.target.value)} />
          </div>
          <div>
            <label className="label">Nächstes Gespräch (optional)</label>
            <input type="date" className="input-field" value={nextMeeting} onChange={e => setNextMeeting(e.target.value)} />
          </div>
          <button onClick={handleSave} disabled={!childId || !topics.trim() || saving}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            {saved ? <><CheckCircle2 size={16} /> Gespeichert!</> : saving ? 'Speichere…' : <><Save size={15} /> Protokoll speichern</>}
          </button>
        </div>
      )}
    </div>
  )
}
