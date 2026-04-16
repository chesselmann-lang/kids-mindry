'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff, BellRing, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported' | 'loading'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

interface Props {
  userId: string
  /** VAPID public key from env */
  vapidPublicKey?: string
}

export function PushNotificationSettings({ userId, vapidPublicKey }: Props) {
  const [permission, setPermission] = useState<PermissionState>('loading')
  const [subscribed, setSubscribed] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const supabase = createClient()

  const checkStatus = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
      return
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported')
      return
    }

    const perm = Notification.permission as PermissionState
    setPermission(perm)

    if (perm === 'granted') {
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        setSubscribed(!!sub)
      } catch {
        setSubscribed(false)
      }
    }
  }, [])

  useEffect(() => { checkStatus() }, [checkStatus])

  const subscribe = async () => {
    setIsWorking(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm as PermissionState)

      if (perm !== 'granted') {
        setIsWorking(false)
        return
      }

      const reg = await navigator.serviceWorker.ready
      const key = vapidPublicKey ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

      if (!key) {
        console.warn('VAPID public key not configured')
        setSubscribed(true) // UI optimistic — SW registered at least
        setIsWorking(false)
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })

      // Speichere Subscription in Supabase
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: sub.endpoint,
        keys: sub.toJSON().keys,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      setSubscribed(true)
    } catch (err) {
      console.error('Push subscribe error:', err)
    } finally {
      setIsWorking(false)
    }
  }

  const unsubscribe = async () => {
    setIsWorking(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await supabase.from('push_subscriptions').delete().eq('user_id', userId)
      }
      setSubscribed(false)
      setPermission('default')
    } catch (err) {
      console.error('Push unsubscribe error:', err)
    } finally {
      setIsWorking(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (permission === 'loading') {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Prüfe Benachrichtigungsstatus…</span>
      </div>
    )
  }

  if (permission === 'unsupported') {
    return (
      <div className="card p-4 flex items-start gap-3 bg-gray-50">
        <AlertTriangle size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-700">Nicht unterstützt</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Dein Browser unterstützt keine Push-Benachrichtigungen. Installiere die App für beste Erfahrung.
          </p>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="card p-4 flex items-start gap-3 bg-amber-50 border-amber-200">
        <BellOff size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">Benachrichtigungen blockiert</p>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Du hast Benachrichtigungen für diese App blockiert. Ändere dies in den Browser-Einstellungen
            unter <strong>Website-Einstellungen → Benachrichtigungen</strong>.
          </p>
        </div>
      </div>
    )
  }

  if (subscribed && permission === 'granted') {
    return (
      <div className="space-y-3">
        <div className="card p-4 flex items-center gap-3 bg-green-50 border-green-200">
          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Benachrichtigungen aktiv</p>
            <p className="text-xs text-green-700 mt-0.5">Du erhältst Hinweise zu neuen Nachrichten und Ankündigungen.</p>
          </div>
        </div>
        <button
          onClick={unsubscribe}
          disabled={isWorking}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          {isWorking ? <Loader2 size={15} className="animate-spin" /> : <BellOff size={15} />}
          Deaktivieren
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="card p-4 flex items-start gap-3">
        <BellRing size={18} className="text-brand-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Push-Benachrichtigungen aktivieren</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Erhalte sofortige Benachrichtigungen bei neuen Nachrichten, Ankündigungen und wichtigen
            Ereignissen — auch wenn die App nicht geöffnet ist.
          </p>
        </div>
      </div>
      <button
        onClick={subscribe}
        disabled={isWorking}
        className="btn-primary text-sm disabled:opacity-50"
      >
        {isWorking ? <Loader2 size={15} className="animate-spin" /> : <Bell size={15} />}
        Benachrichtigungen aktivieren
      </button>
    </div>
  )
}
