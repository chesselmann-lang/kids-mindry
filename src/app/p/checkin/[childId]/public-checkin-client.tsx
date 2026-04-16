'use client'

import { useState } from 'react'
import { CheckCircle2, LogIn, LogOut, Clock, Users } from 'lucide-react'

interface Props {
  child: {
    id: string
    first_name: string
    last_name: string
    photo_url: string | null
    groups: { name: string; color: string } | null
  }
  todayAttendance: {
    id: string
    status: string
    check_in_at: string | null
    check_out_at: string | null
  } | null
}

export default function PublicCheckinClient({ child, todayAttendance }: Props) {
  const [attendance, setAttendance] = useState(todayAttendance)
  const [loading, setLoading] = useState<'in' | 'out' | null>(null)
  const [done, setDone] = useState(false)

  const now = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  const isCheckedIn = attendance?.status === 'present' && !attendance?.check_out_at
  const isCheckedOut = attendance?.check_out_at != null

  const action = async (type: 'in' | 'out') => {
    setLoading(type)
    try {
      const res = await fetch('/api/checkin/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId: child.id, action: type }),
      })
      const data = await res.json()
      if (res.ok) {
        setAttendance(data)
        setDone(true)
      }
    } finally {
      setLoading(null)
    }
  }

  const initials = `${child.first_name[0]}${child.last_name[0]}`
  const color = (child.groups as any)?.color ?? '#6366f1'

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Logo */}
        <div className="text-center mb-2">
          <span className="text-2xl font-black text-brand-700 tracking-tight">KitaHub</span>
        </div>

        {/* Kind-Karte */}
        <div className="bg-white rounded-3xl shadow-lg p-6 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-inner"
            style={{ background: color }}>
            {child.photo_url
              ? <img src={child.photo_url} className="w-full h-full rounded-full object-cover" alt="" />
              : initials}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">{child.first_name} {child.last_name}</h1>
          {child.groups && (
            <p className="text-sm text-gray-400 mt-1 flex items-center justify-center gap-1">
              <Users size={13}/> {(child.groups as any).name}
            </p>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock size={14}/>
            <span>{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>

        {/* Status + Aktion */}
        {done ? (
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <CheckCircle2 size={56} className="mx-auto mb-3 text-green-500"/>
            <h2 className="text-xl font-bold text-gray-900">
              {attendance?.check_out_at ? 'Tschüss!' : 'Guten Morgen!'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {attendance?.check_out_at
                ? `${child.first_name} wurde um ${new Date(attendance.check_out_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr abgemeldet.`
                : `${child.first_name} wurde um ${now} Uhr eingecheckt.`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-6 space-y-3">
            {attendance?.check_in_at && (
              <div className="bg-green-50 rounded-2xl p-3 text-center">
                <p className="text-xs text-green-600 font-semibold">Eingecheckt um</p>
                <p className="text-lg font-bold text-green-700">
                  {new Date(attendance.check_in_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                </p>
              </div>
            )}

            {!isCheckedIn && !isCheckedOut && (
              <button
                onClick={() => action('in')}
                disabled={loading !== null}
                className="w-full py-4 rounded-2xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-brand-700 transition-colors disabled:opacity-50">
                <LogIn size={22}/>
                {loading === 'in' ? 'Moment...' : `${child.first_name} anmelden`}
              </button>
            )}

            {isCheckedIn && (
              <button
                onClick={() => action('out')}
                disabled={loading !== null}
                className="w-full py-4 rounded-2xl bg-gray-700 text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50">
                <LogOut size={22}/>
                {loading === 'out' ? 'Moment...' : `${child.first_name} abmelden`}
              </button>
            )}

            {isCheckedOut && (
              <div className="text-center py-4">
                <CheckCircle2 size={36} className="mx-auto text-gray-400 mb-2"/>
                <p className="text-gray-500 text-sm">Heute bereits abgemeldet.</p>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Powered by KitaHub · kids.mindry.de
        </p>
      </div>
    </div>
  )
}
