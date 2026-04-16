'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, XCircle, HelpCircle, Loader2 } from 'lucide-react'

type RsvpStatus = 'yes' | 'no' | 'maybe' | null

interface Props {
  eventId: string
  userId: string
  currentStatus: RsvpStatus
  eventTitle: string
  eventColor: string
}

export default function RsvpButton({ eventId, userId, currentStatus: initial, eventColor }: Props) {
  const supabase = createClient()
  const [status, setStatus] = useState<RsvpStatus>(initial)
  const [pending, setPending] = useState<RsvpStatus>(null)

  async function rsvp(newStatus: RsvpStatus) {
    if (newStatus === status || !newStatus) return
    setPending(newStatus)

    await supabase.from('event_rsvps').upsert({
      event_id: eventId,
      user_id: userId,
      status: newStatus,
    }, { onConflict: 'event_id,user_id' })

    setStatus(newStatus)
    setPending(null)
  }

  const buttons = [
    { value: 'yes'   as const, label: 'Ich komme',     icon: CheckCircle2, activeClass: 'bg-green-600 text-white border-green-600' },
    { value: 'maybe' as const, label: 'Vielleicht',    icon: HelpCircle,   activeClass: 'bg-amber-500 text-white border-amber-500' },
    { value: 'no'    as const, label: 'Ich komme nicht', icon: XCircle,     activeClass: 'bg-red-500 text-white border-red-500' },
  ]

  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Teilnahme</p>
      <div className="grid grid-cols-3 gap-2">
        {buttons.map(btn => {
          const Icon = btn.icon
          const isActive = status === btn.value
          const isLoading = pending === btn.value
          return (
            <button
              key={btn.value}
              onClick={() => rsvp(btn.value)}
              disabled={!!pending}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 text-center transition-all ${
                isActive
                  ? btn.activeClass
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isLoading
                ? <Loader2 size={22} className="animate-spin" />
                : <Icon size={22} />
              }
              <span className="text-xs font-semibold leading-tight">{btn.label}</span>
            </button>
          )
        })}
      </div>

      {status && (
        <p className="text-center text-xs text-gray-400 mt-3">
          {status === 'yes' && '✓ Du hast zugesagt'}
          {status === 'maybe' && '? Deine Teilnahme ist ungewiss'}
          {status === 'no' && '✗ Du hast abgesagt'}
        </p>
      )}
    </div>
  )
}
