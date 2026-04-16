'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { usePushSubscription } from '@/hooks/usePushSubscription'

export default function PushToggle() {
  const { supported, subscribed, loading, subscribe, unsubscribe } = usePushSubscription()

  if (!supported) return null

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
          <Bell size={16} className="text-brand-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Push-Benachrichtigungen</p>
          <p className="text-xs text-gray-400">
            {subscribed ? 'Aktiv – du erhältst Benachrichtigungen' : 'Deaktiviert – klicken zum Aktivieren'}
          </p>
        </div>
      </div>
      <button
        onClick={subscribed ? unsubscribe : subscribe}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          subscribed ? 'bg-brand-600' : 'bg-gray-200'
        }`}
        aria-label={subscribed ? 'Push deaktivieren' : 'Push aktivieren'}
      >
        {loading ? (
          <Loader2 size={12} className="absolute left-1/2 -translate-x-1/2 text-white animate-spin" />
        ) : (
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
            subscribed ? 'translate-x-6' : 'translate-x-1'
          }`} />
        )}
      </button>
    </div>
  )
}
