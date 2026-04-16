'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { CalendarX, X, Loader2, Check, ChevronDown } from 'lucide-react'

interface Child {
  id: string
  first_name: string
  last_name: string
}

interface Props {
  currentUserId: string
  children: Child[]
  siteId: string
}

const REASONS = [
  { value: 'sick', label: '🤒 Krank' },
  { value: 'vacation', label: '🏖️ Urlaub' },
  { value: 'appointment', label: '🏥 Termin' },
  { value: 'other', label: '📋 Sonstiges' },
]

function getStaffConversationOrCreate(supabase: ReturnType<typeof createClient>, currentUserId: string, staffId: string, siteId: string) {
  // This is handled inline in sendReport
}

export default function AbwesenheitMeldenButton({ currentUserId, children, siteId }: Props) {
  const [open, setOpen] = useState(false)
  const [childId, setChildId] = useState(children[0]?.id ?? '')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('sick')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function reset() {
    setChildId(children[0]?.id ?? '')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
    setReason('sick')
    setNotes('')
    setDone(false)
  }

  const selectedChild = children.find(c => c.id === childId)
  const reasonLabel = REASONS.find(r => r.value === reason)?.label ?? reason

  async function send() {
    if (!childId) return
    setSending(true)

    const start = new Date(startDate + 'T12:00:00')
    const end = new Date(endDate + 'T12:00:00')
    if (end < start) { setSending(false); return }

    // Absence status from reason
    const statusMap: Record<string, string> = {
      sick: 'absent_sick',
      vacation: 'absent_vacation',
      appointment: 'absent_other',
      other: 'absent_other',
    }
    const attStatus = statusMap[reason] ?? 'absent_other'

    // Insert attendance records for each working day in range
    const dates: string[] = []
    const cur = new Date(start)
    while (cur <= end) {
      const dow = cur.getDay()
      if (dow >= 1 && dow <= 5) { // Mon–Fri
        dates.push(cur.toISOString().split('T')[0])
      }
      cur.setDate(cur.getDate() + 1)
    }

    if (dates.length > 0) {
      await supabase.from('attendance').upsert(
        dates.map(date => ({
          child_id: childId,
          site_id: siteId,
          date,
          status: attStatus,
        })),
        { onConflict: 'child_id,date' }
      )
    }

    // Find or create conversation with a staff member (find any admin/educator in site)
    const { data: staffProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('site_id', siteId)
      .in('role', ['admin', 'group_lead', 'educator'])
      .limit(1)

    const staffId = staffProfiles?.[0]?.id

    if (staffId) {
      // Find existing 2-person conversation
      const { data: myParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId)

      const myConvIds = (myParts ?? []).map((p: any) => p.conversation_id)
      let convId: string | null = null

      if (myConvIds.length > 0) {
        const { data: theirParts } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', staffId)
          .in('conversation_id', myConvIds)

        for (const p of (theirParts ?? [])) {
          const { count } = await supabase
            .from('conversation_participants')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', (p as any).conversation_id)
          if (count === 2) { convId = (p as any).conversation_id; break }
        }
      }

      if (!convId) {
        const { data: conv } = await supabase
          .from('conversations')
          .insert({ site_id: siteId, type: 'direct' })
          .select('id').single()
        if (conv) {
          convId = (conv as any).id
          await supabase.from('conversation_participants').insert([
            { conversation_id: convId, user_id: currentUserId },
            { conversation_id: convId, user_id: staffId },
          ])
        }
      }

      if (convId) {
        const childName = `${selectedChild?.first_name} ${selectedChild?.last_name}`
        const dateRange = startDate === endDate
          ? new Date(startDate + 'T12:00:00').toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })
          : `${new Date(startDate + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })} – ${new Date(endDate + 'T12:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}`
        const body = `${childName} ist ${dateRange} abwesend (${reasonLabel})${notes ? ': ' + notes : '.'}`

        await supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: currentUserId,
          body,
          type: 'absence_report',
        })
      }
    }

    setSending(false)
    setDone(true)
    router.refresh()
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset() }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
      >
        <CalendarX size={16} /> Abwesenheit melden
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarX size={18} className="text-red-500" />
                <h2 className="font-bold text-gray-900">Abwesenheit melden</h2>
              </div>
              <button onClick={() => { setOpen(false); reset() }} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {done ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-green-600" />
                </div>
                <p className="font-bold text-gray-900">Abwesenheit gemeldet!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Die Kita wurde benachrichtigt und die Anwesenheit aktualisiert.
                </p>
                <button onClick={() => { setOpen(false); reset() }} className="btn-primary mt-5">
                  Schließen
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Kind */}
                {children.length > 1 && (
                  <div>
                    <label className="label">Kind</label>
                    <select className="input" value={childId} onChange={e => setChildId(e.target.value)}>
                      {children.map(c => (
                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Zeitraum */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Von</label>
                    <input
                      type="date"
                      className="input"
                      min={today}
                      value={startDate}
                      onChange={e => {
                        setStartDate(e.target.value)
                        if (e.target.value > endDate) setEndDate(e.target.value)
                      }}
                    />
                  </div>
                  <div>
                    <label className="label">Bis</label>
                    <input
                      type="date"
                      className="input"
                      min={startDate}
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Grund */}
                <div>
                  <label className="label">Grund</label>
                  <div className="flex flex-wrap gap-2">
                    {REASONS.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setReason(r.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          reason === r.value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notiz */}
                <div>
                  <label className="label">Hinweis (optional)</label>
                  <input
                    className="input"
                    placeholder="z.B. Hat Fieber, kommt am Montag wieder…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div className="p-3 bg-red-50 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <CalendarX size={13} className="flex-shrink-0 mt-0.5" />
                  Die Abwesenheit wird direkt in der Anwesenheitsliste eingetragen und
                  eine Nachricht an die Kita gesendet.
                </div>
              </div>
            )}

            {!done && (
              <div className="flex gap-3 px-5 pb-5 border-t border-gray-100 pt-3">
                <button onClick={() => { setOpen(false); reset() }} className="btn-secondary flex-1">
                  Abbrechen
                </button>
                <button
                  onClick={send}
                  disabled={!childId || sending}
                  className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending
                    ? <><Loader2 size={16} className="animate-spin" /> Sende…</>
                    : <><CalendarX size={16} /> Melden</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
