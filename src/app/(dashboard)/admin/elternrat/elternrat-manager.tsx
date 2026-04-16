'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Parent { id: string; full_name: string; email: string }
interface Member { id: string; user_id: string; position: string; notes: string | null; profiles: { full_name: string } | null }
interface Meeting { id: string; meeting_date: string; title: string; summary: string | null; content: string | null }

interface Props {
  siteId: string
  staffId: string
  parents: Parent[]
  members: Member[]
  meetings: Meeting[]
}

const POSITIONS = [
  { value: 'chair', label: 'Vorsitzende/r', order: 1 },
  { value: 'deputy', label: 'Stellvertretung', order: 2 },
  { value: 'treasurer', label: 'Kassenwart/in', order: 3 },
  { value: 'member', label: 'Beisitzer/in', order: 4 },
]

export default function ElternratManager({ siteId, staffId, parents, members: initialMembers, meetings: initialMeetings }: Props) {
  const router = useRouter()
  const today = new Date().toISOString().split('T')[0]
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings)

  // Member form
  const [memberOpen, setMemberOpen] = useState(false)
  const [userId, setUserId] = useState('')
  const [position, setPosition] = useState('member')
  const [notes, setNotes] = useState('')
  const [savingMember, setSavingMember] = useState(false)
  const [savedMember, setSavedMember] = useState(false)

  // Meeting form
  const [meetingOpen, setMeetingOpen] = useState(false)
  const [meetingDate, setMeetingDate] = useState(today)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingSummary, setMeetingSummary] = useState('')
  const [meetingContent, setMeetingContent] = useState('')
  const [savingMeeting, setSavingMeeting] = useState(false)
  const [savedMeeting, setSavedMeeting] = useState(false)

  async function addMember() {
    if (!userId) return
    setSavingMember(true)
    const supabase = createClient()
    const positionOrder = POSITIONS.find(p => p.value === position)?.order ?? 4
    const { data } = await supabase.from('council_members').insert({
      site_id: siteId,
      user_id: userId,
      position,
      position_order: positionOrder,
      notes: notes.trim() || null,
    }).select('*, profiles:user_id(full_name)').single()

    setSavingMember(false)
    if (data) {
      setMembers(prev => [...prev, data as Member])
      setSavedMember(true)
      setUserId(''); setNotes('')
      setTimeout(() => { setSavedMember(false); setMemberOpen(false) }, 1200)
    }
  }

  async function deleteMember(id: string) {
    const supabase = createClient()
    await supabase.from('council_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
  }

  async function addMeeting() {
    if (!meetingTitle.trim() || !meetingDate) return
    setSavingMeeting(true)
    const supabase = createClient()
    const { data } = await supabase.from('council_meetings').insert({
      site_id: siteId,
      meeting_date: meetingDate,
      title: meetingTitle.trim(),
      summary: meetingSummary.trim() || null,
      content: meetingContent.trim() || null,
      created_by: staffId,
    }).select().single()

    setSavingMeeting(false)
    if (data) {
      setMeetings(prev => [data as Meeting, ...prev])
      setSavedMeeting(true)
      setMeetingTitle(''); setMeetingSummary(''); setMeetingContent('')
      setTimeout(() => { setSavedMeeting(false); setMeetingOpen(false) }, 1200)
    }
  }

  return (
    <div className="space-y-5">
      {/* Members section */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mitglieder</p>

        <div className="card overflow-hidden mb-3">
          <button onClick={() => setMemberOpen(v => !v)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
                <Plus size={16} className="text-brand-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Mitglied hinzufügen</span>
            </div>
            {memberOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {memberOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div>
                  <label className="label">Person *</label>
                  <select className="input-field" value={userId} onChange={e => setUserId(e.target.value)}>
                    <option value="">Auswählen…</option>
                    {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Funktion</label>
                  <select className="input-field" value={position} onChange={e => setPosition(e.target.value)}>
                    {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Anmerkung (optional)</label>
                <input className="input-field" placeholder="z.B. Schatzmeister" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <button onClick={addMember} disabled={!userId || savingMember}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
                {savedMember ? <><CheckCircle2 size={16} /> Gespeichert!</> : savingMember ? 'Speichere…' : <><Save size={15} /> Hinzufügen</>}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="card p-3 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{m.profiles?.full_name}</p>
                <p className="text-xs text-brand-600">{POSITIONS.find(p => p.value === m.position)?.label ?? m.position}</p>
              </div>
              <button onClick={() => deleteMember(m.id)} className="p-1 rounded hover:bg-red-50 text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Meetings section */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sitzungsprotokolle</p>

        <div className="card overflow-hidden mb-3">
          <button onClick={() => setMeetingOpen(v => !v)} className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Plus size={16} className="text-green-600" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Sitzungsprotokoll eintragen</span>
            </div>
            {meetingOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {meetingOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-gray-50">
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div>
                  <label className="label">Datum</label>
                  <input type="date" className="input-field" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Titel *</label>
                  <input className="input-field" placeholder="z.B. 1. Sitzung 2026" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Kurzzusammenfassung</label>
                <input className="input-field" placeholder="Was wurde beschlossen?" value={meetingSummary} onChange={e => setMeetingSummary(e.target.value)} />
              </div>
              <div>
                <label className="label">Protokoll</label>
                <textarea className="input-field resize-none" rows={4} placeholder="Vollständiges Protokoll…" value={meetingContent} onChange={e => setMeetingContent(e.target.value)} />
              </div>
              <button onClick={addMeeting} disabled={!meetingTitle.trim() || savingMeeting}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
                {savedMeeting ? <><CheckCircle2 size={16} /> Gespeichert!</> : savingMeeting ? 'Speichere…' : <><Save size={15} /> Protokoll speichern</>}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {meetings.map(m => (
            <div key={m.id} className="card p-3">
              <p className="text-xs text-gray-400">{new Date(m.meeting_date).toLocaleDateString('de-DE')}</p>
              <p className="text-sm font-medium text-gray-800">{m.title}</p>
              {m.summary && <p className="text-xs text-gray-500 mt-0.5">{m.summary}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
