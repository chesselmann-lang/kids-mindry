'use client'

import { useState } from 'react'
import { CheckCircle2, LogIn, LogOut, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  childId: string
  childName: string
  siteId: string
  todayAttendance: { id: string; status: string } | null
}

export default function CheckinClient({ childId, childName, siteId, todayAttendance }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(todayAttendance?.status ?? null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function markAttendance(newStatus: 'present' | 'absent_other') {
    setLoading(true)
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    await supabase.from('attendance').upsert({
      child_id: childId,
      site_id: siteId,
      date: today,
      status: newStatus,
      check_in_at: new Date().toISOString(),
    }, { onConflict: 'child_id,date' })

    setStatus(newStatus)
    setLoading(false)
    setDone(true)
    setTimeout(() => router.push('/heute'), 2000)
  }

  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto shadow-lg">
          <span className="text-4xl font-bold text-white">{childName[0]}</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{childName}</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-gray-400">
            <Clock size={14} />
            <p className="text-sm">{today}</p>
          </div>
        </div>

        {done ? (
          <div className="card p-6">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">
              {status === 'present' ? 'Angemeldet! 👋' : 'Abgemeldet!'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Weiterleitung…</p>
          </div>
        ) : (
          <>
            {/* Current status */}
            {status && (
              <div className={`card p-3 ${status === 'present' ? 'bg-green-50 border-none' : 'bg-gray-50 border-none'}`}>
                <p className="text-sm font-medium text-gray-700">
                  Aktueller Status:
                  <span className={`ml-2 font-bold ${status === 'present' ? 'text-green-600' : 'text-gray-500'}`}>
                    {status === 'present' ? '✅ Anwesend' : '⬜ Abwesend'}
                  </span>
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => markAttendance('present')}
                disabled={loading || status === 'present'}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-default rounded-2xl">
                <LogIn size={22} />
                {status === 'present' ? 'Bereits angemeldet' : 'Jetzt anmelden'}
              </button>
              <button
                onClick={() => markAttendance('absent_other')}
                disabled={loading}
                className="w-full py-4 text-base flex items-center justify-center gap-3 card rounded-2xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                <LogOut size={22} />
                Als abwesend markieren
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
