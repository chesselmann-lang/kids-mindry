'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Bell, BellOff, CheckCircle2, Smartphone, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Settings {
  notify_feed: boolean
  notify_tagesbericht: boolean
  notify_kalender: boolean
  notify_nachrichten: boolean
  notify_protokolle: boolean
  notify_abwesenheit: boolean
}

const SETTINGS_CONFIG = [
  { key: 'notify_feed',         label: 'Neuigkeiten & Ankündigungen', emoji: '📣', desc: 'Neue Beiträge im Feed' },
  { key: 'notify_tagesbericht', label: 'Tagesberichte',               emoji: '📋', desc: 'Wenn ein neuer Tagesbericht verfügbar ist' },
  { key: 'notify_kalender',     label: 'Termine & Veranstaltungen',   emoji: '📅', desc: 'Neue Kalendereinträge und Erinnerungen' },
  { key: 'notify_nachrichten',  label: 'Nachrichten',                 emoji: '💬', desc: 'Neue Direktnachrichten' },
  { key: 'notify_protokolle',   label: 'Protokolle',                  emoji: '📄', desc: 'Neue Protokolle veröffentlicht' },
  { key: 'notify_abwesenheit',  label: 'Abwesenheiten',               emoji: '🏠', desc: 'Bestätigungen Ihrer Abwesenheitsmeldungen' },
]

// The VAPID public key must be exposed to the client
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

interface Props {
  userId: string
  settings: Settings
}

type PushState = 'unsupported' | 'checking' | 'subscribed' | 'unsubscribed' | 'denied' | 'subscribing' | 'unsubscribing' | 'error'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function NotificationSettingsForm({ userId, settings: initial }: Props) {
  const [settings, setSettings] = useState<Settings>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pushState, setPushState] = useState<PushState>('checking')
  const [pushError, setPushError] = useState<string | null>(null)

  // Check current push subscription state on mount
  useEffect(() => {
    async function checkPushState() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setPushState('unsupported')
        return
      }
      if (Notification.permission === 'denied') {
        setPushState('denied')
        return
      }
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        setPushState(sub ? 'subscribed' : 'unsubscribed')
      } catch {
        setPushState('unsubscribed')
      }
    }
    checkPushState()
  }, [])

  async function subscribePush() {
    if (!VAPID_PUBLIC_KEY) {
      setPushError('Push-Benachrichtigungen sind noch nicht konfiguriert.')
      return
    }
    setPushState('subscribing')
    setPushError(null)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPushState('denied')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      const sub = subscription.toJSON()
      const res = await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: sub.keys,
          userAgent: navigator.userAgent,
        }),
      })

      if (!res.ok) throw new Error('Speichern fehlgeschlagen')
      setPushState('subscribed')
    } catch (err: any) {
      console.error('Push subscribe error:', err)
      setPushError(err.message ?? 'Fehler beim Aktivieren')
      setPushState('error')
    }
  }

  async function unsubscribePush() {
    setPushState('unsubscribing')
    setPushError(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        await fetch('/api/push-subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint }),
        })
      }
      setPushState('unsubscribed')
    } catch (err: any) {
      console.error('Push unsubscribe error:', err)
      setPushError(err.message ?? 'Fehler beim Deaktivieren')
      setPushState('subscribed') // revert
    }
  }

  function toggle(key: keyof Settings) {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('notification_settings')
      .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const allEnabled = Object.values(settings).every(Boolean)

  function toggleAll() {
    const newVal = !allEnabled
    const updated = Object.fromEntries(Object.keys(settings).map(k => [k, newVal])) as Settings
    setSettings(updated)
  }

  const pushIsSupported = pushState !== 'unsupported'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/benachrichtigungen" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Benachrichtigungen</h1>
          <p className="text-sm text-gray-400">Einstellungen verwalten</p>
        </div>
      </div>

      {/* Push Notifications card — shown first as primary action */}
      {pushIsSupported && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              pushState === 'subscribed' ? 'bg-green-50' : 'bg-indigo-50'
            }`}>
              <Smartphone size={18} className={pushState === 'subscribed' ? 'text-green-600' : 'text-indigo-600'} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">Push-Benachrichtigungen</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {pushState === 'subscribed' && 'Aktiv – Sie erhalten Benachrichtigungen auf diesem Gerät'}
                {pushState === 'unsubscribed' && 'Deaktiviert – Benachrichtigungen auf diesem Gerät aktivieren'}
                {pushState === 'denied' && 'Blockiert – Bitte in den Browser-Einstellungen freigeben'}
                {pushState === 'checking' && 'Status wird geprüft…'}
                {pushState === 'subscribing' && 'Wird aktiviert…'}
                {pushState === 'unsubscribing' && 'Wird deaktiviert…'}
                {pushState === 'error' && 'Fehler aufgetreten'}
              </p>
              {pushError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {pushError}
                </p>
              )}
            </div>
            {/* Status dot */}
            <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
              pushState === 'subscribed' ? 'bg-green-500' :
              pushState === 'denied' ? 'bg-red-400' :
              pushState === 'checking' || pushState === 'subscribing' || pushState === 'unsubscribing' ? 'bg-gray-300 animate-pulse' :
              'bg-gray-200'
            }`} />
          </div>

          {/* Action buttons */}
          {pushState === 'unsubscribed' && (
            <button
              onClick={subscribePush}
              className="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold hover:bg-indigo-100 transition-colors"
            >
              Auf diesem Gerät aktivieren
            </button>
          )}
          {pushState === 'subscribed' && (
            <button
              onClick={unsubscribePush}
              className="w-full py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Auf diesem Gerät deaktivieren
            </button>
          )}
          {(pushState === 'subscribing' || pushState === 'unsubscribing') && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span>{pushState === 'subscribing' ? 'Aktiviere…' : 'Deaktiviere…'}</span>
            </div>
          )}
          {pushState === 'denied' && (
            <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800">
              Push-Benachrichtigungen sind im Browser blockiert. Öffnen Sie die Seiteneinstellungen
              (Schloss-Symbol in der Adressleiste) und erlauben Sie Benachrichtigungen für kids.mindry.de.
            </div>
          )}
          {pushState === 'error' && (
            <button
              onClick={subscribePush}
              className="w-full py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Erneut versuchen
            </button>
          )}
        </div>
      )}

      {/* All toggle */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center">
            {allEnabled ? <Bell size={18} className="text-brand-600" /> : <BellOff size={18} className="text-gray-400" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">Alle Kategorien</p>
            <p className="text-xs text-gray-400">{allEnabled ? 'Alle aktiv' : 'Einige deaktiviert'}</p>
          </div>
        </div>
        <button
          onClick={toggleAll}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            allEnabled ? 'bg-brand-600' : 'bg-gray-200'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            allEnabled ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Individual settings */}
      <div className="card overflow-hidden p-0">
        {SETTINGS_CONFIG.map((item, idx) => {
          const val = settings[item.key as keyof Settings]
          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 px-4 py-4 ${idx > 0 ? 'border-t border-gray-50' : ''}`}
            >
              <span className="text-xl w-8 text-center flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key as keyof Settings)}
                className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  val ? 'bg-brand-600' : 'bg-gray-200'
                }`}
                aria-label={`${item.label} ${val ? 'deaktivieren' : 'aktivieren'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  val ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saved ? (
          <><CheckCircle2 size={18} /> Gespeichert!</>
        ) : saving ? (
          <><Loader2 size={16} className="animate-spin" /> Speichere…</>
        ) : 'Einstellungen speichern'}
      </button>
    </div>
  )
}
