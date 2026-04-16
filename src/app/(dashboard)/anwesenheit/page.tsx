'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, addDays, isToday, isTomorrow, isWeekend } from 'date-fns'
import { de } from 'date-fns/locale'
import { UserCheck, UserX, Loader2, CheckCircle2, AlertCircle, CalendarDays } from 'lucide-react'
import type { Child, Attendance } from '@/types/database'
import { PullToRefresh } from '@/components/ui/pull-to-refresh'
import AiAnwesenheit from './ai-anwesenheit'

const absenceReasons = [
  { value: 'absent_sick',     label: 'Krank',           emoji: '🤒' },
  { value: 'absent_vacation', label: 'Urlaub / Reise',  emoji: '🏖️' },
  { value: 'absent_other',    label: 'Sonstiger Grund', emoji: '📋' },
]

// Generate next 8 working days (skip weekends)
function getWorkingDays(count = 8): Date[] {
  const days: Date[] = []
  let d = new Date()
  while (days.length < count) {
    if (!isWeekend(d)) days.push(new Date(d))
    d = addDays(d, 1)
  }
  return days
}

function dayLabel(date: Date) {
  if (isToday(date)) return 'Heute'
  if (isTomorrow(date)) return 'Morgen'
  return format(date, 'EEEE', { locale: de })
}

export default function AnwesenheitPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [attendance, setAttendance] = useState<Record<string, Record<string, Attendance>>>({}) // childId → date → att
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState<Record<string, string>>({})
  const [absenceNote, setAbsenceNote] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState<{ childId: string; date: string } | null>(null)

  const workingDays = getWorkingDays(8)
  const [selectedDate, setSelectedDate] = useState(format(workingDays[0], 'yyyy-MM-dd'))

  const supabase = createClient()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const fetchData = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: guardians } = await supabase
      .from('guardians')
      .select('children(*)')
      .eq('user_id', user.id)

    if (guardians) {
      const kids = (guardians as any[])
        .filter(g => g.children)
        .map(g => g.children as Child)
      setChildren(kids)

      if (kids.length > 0) {
        const dateFrom = format(workingDays[0], 'yyyy-MM-dd')
        const dateTo = format(workingDays[workingDays.length - 1], 'yyyy-MM-dd')

        const { data: att } = await supabase
          .from('attendance')
          .select('*')
          .in('child_id', kids.map(k => k.id))
          .gte('date', dateFrom)
          .lte('date', dateTo)

        // Build nested map: childId → date → attendance
        const attMap: Record<string, Record<string, Attendance>> = {}
        for (const k of kids) attMap[k.id] = {}
        for (const a of (att ?? []) as any[]) {
          if (!attMap[a.child_id]) attMap[a.child_id] = {}
          attMap[a.child_id][a.date] = a as Attendance
        }
        setAttendance(attMap)
      }
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function reportAbsence(childId: string) {
    const reason = selectedReason[childId] ?? 'absent_sick'
    const note = absenceNote[childId] ?? ''
    const key = `${childId}:${selectedDate}`
    setSubmitting(key)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(null); return }

    const { error } = await (supabase as any).from('attendance').upsert({
      child_id: childId,
      site_id: siteId,
      date: selectedDate,
      status: reason as Attendance['status'],
      absence_note: note || null,
      reported_by: user.id,
    }, { onConflict: 'child_id,date' })

    if (!error) {
      setSuccess(key)
      setShowForm(null)
      await fetchData()
      setTimeout(() => setSuccess(null), 3000)
    }
    setSubmitting(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={28} className="animate-spin text-brand-500"/>
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={async () => { await fetchData() }}>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Abwesenheit melden</h1>
        <p className="text-sm text-gray-500 mt-0.5">Für heute oder kommende Tage</p>
      </div>

      <AiAnwesenheit />

      {/* Date selector */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Datum wählen</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 snap-x">
          {workingDays.map(day => {
            const ds = format(day, 'yyyy-MM-dd')
            const isSelected = ds === selectedDate
            return (
              <button
                key={ds}
                onClick={() => { setSelectedDate(ds); setShowForm(null) }}
                className={`snap-start flex-shrink-0 flex flex-col items-center px-3 py-2.5 rounded-2xl min-w-[60px] transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSelected ? 'text-brand-100' : 'text-gray-400'}`}>
                  {dayLabel(day) === 'Heute' || dayLabel(day) === 'Morgen'
                    ? dayLabel(day).slice(0, 4)
                    : format(day, 'EEE', { locale: de })}
                </span>
                <span className={`text-lg font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                  {format(day, 'd')}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-brand-100' : 'text-gray-400'}`}>
                  {format(day, 'MMM', { locale: de })}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Children */}
      {children.length === 0 ? (
        <div className="card p-8 text-center">
          <UserCheck size={40} className="text-gray-200 mx-auto mb-3"/>
          <p className="text-gray-500 text-sm">Kein Kind mit Ihrem Konto verknüpft.</p>
          <p className="text-gray-400 text-xs mt-1">Bitte wenden Sie sich an die Kita-Verwaltung.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map(child => {
            const att = attendance[child.id]?.[selectedDate]
            const isAbsent = att && att.status !== 'present' && att.status !== 'unknown'
            const isPresent = att?.status === 'present'
            const formKey = `${child.id}:${selectedDate}`
            const isOpen = showForm?.childId === child.id && showForm?.date === selectedDate
            const isSucceeded = success === formKey
            const isSubmitting = submitting === formKey

            return (
              <div key={child.id} className="card p-5">
                {/* Child header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-800 font-bold text-lg flex-shrink-0">
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{child.first_name} {child.last_name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <CalendarDays size={11}/>
                      {format(new Date(selectedDate), 'EEEE, d. MMMM', { locale: de })}
                    </p>
                  </div>
                  {isAbsent && (
                    <span className="badge bg-red-100 text-red-700 flex-shrink-0">
                      <UserX size={10}/> {absenceReasons.find(r => r.value === att!.status)?.label ?? 'Abwesend'}
                    </span>
                  )}
                  {isPresent && (
                    <span className="badge bg-green-100 text-green-700 flex-shrink-0">
                      <UserCheck size={10}/> Anwesend
                    </span>
                  )}
                  {isSucceeded && !isAbsent && !isPresent && (
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0"/>
                  )}
                </div>

                {/* Already absent */}
                {isAbsent && att && (
                  <div className="mt-4 p-3 bg-red-50 rounded-xl text-sm text-red-700">
                    <p className="font-medium">✓ Abmeldung erfasst</p>
                    {att.absence_note && <p className="text-xs mt-0.5 opacity-80">{att.absence_note}</p>}
                    <button
                      onClick={async () => {
                        await (supabase as any)
                          .from('attendance')
                          .update({ status: 'unknown' })
                          .eq('child_id', child.id)
                          .eq('date', selectedDate)
                        await fetchData()
                      }}
                      className="text-xs text-red-500 underline mt-2 block hover:text-red-700"
                    >
                      Abmeldung widerrufen
                    </button>
                  </div>
                )}

                {/* Absence form */}
                {!isAbsent && !isPresent && (
                  <>
                    {!isOpen ? (
                      <button
                        onClick={() => setShowForm({ childId: child.id, date: selectedDate })}
                        className="mt-4 w-full btn-secondary py-2.5 text-sm flex items-center justify-center gap-2">
                        <UserX size={16}/> Kind abmelden
                      </button>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="label">Grund der Abwesenheit</label>
                          <div className="grid grid-cols-3 gap-2">
                            {absenceReasons.map(r => (
                              <button key={r.value} type="button"
                                onClick={() => setSelectedReason(prev => ({ ...prev, [child.id]: r.value }))}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${
                                  (selectedReason[child.id] ?? 'absent_sick') === r.value
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-gray-200 bg-white'
                                }`}>
                                <div className="text-2xl mb-1">{r.emoji}</div>
                                <div className="text-xs font-medium text-gray-700">{r.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="label">Notiz (optional)</label>
                          <textarea className="input resize-none" rows={2}
                            placeholder="z.B. Fieber seit gestern Abend"
                            value={absenceNote[child.id] ?? ''}
                            onChange={e => setAbsenceNote(prev => ({ ...prev, [child.id]: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowForm(null)} className="btn-secondary flex-1">
                            Abbrechen
                          </button>
                          <button onClick={() => reportAbsence(child.id)} disabled={isSubmitting}
                            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSubmitting
                              ? <><Loader2 size={16} className="animate-spin"/>Senden…</>
                              : <><CheckCircle2 size={16}/>Abmelden</>}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Info box */}
      <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl">
        <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
        <p className="text-xs text-blue-700">
          Abmeldungen bis <strong>7:30 Uhr</strong> helfen uns bei der Tagesplanung.
          Zukünftige Abmeldungen können jederzeit widerrufen werden.
        </p>
      </div>
    </div>
    </PullToRefresh>
  )
}
