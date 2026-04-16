'use client'

import { useState } from 'react'
import { ArrowLeft, Save, CheckCircle2, User, Phone, Mail, Globe, Bell } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PushNotificationSettings } from '@/components/features/push-notifications'

const LANGUAGES = [
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'tr', label: '🇹🇷 Türkçe' },
  { value: 'ar', label: '🇸🇦 العربية' },
  { value: 'ru', label: '🇷🇺 Русский' },
]

interface Props {
  userId: string
  email: string
  initialFullName: string
  initialPhone: string
  initialLanguage: string
}

export default function ProfilForm({ userId, email, initialFullName, initialPhone, initialLanguage }: Props) {

  const [fullName, setFullName] = useState(initialFullName)
  const [phone, setPhone] = useState(initialPhone)
  const [language, setLanguage] = useState(initialLanguage || 'de')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!fullName.trim()) {
      setError('Bitte Namen eingeben.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error: dbErr } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        language,
      })
      .eq('id', userId)

    setLoading(false)
    if (dbErr) {
      setError('Fehler beim Speichern. Bitte erneut versuchen.')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/profil" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mein Profil</h1>
          <p className="text-sm text-gray-400">Kontaktdaten bearbeiten</p>
        </div>
      </div>

      {/* Avatar placeholder */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
          <span className="text-3xl font-bold text-brand-600">
            {fullName ? fullName[0].toUpperCase() : '?'}
          </span>
        </div>
      </div>

      {/* Name */}
      <div className="card p-4 space-y-4">
        <div>
          <label className="label flex items-center gap-2">
            <User size={14} className="text-gray-400" /> Name *
          </label>
          <input
            className="input-field"
            placeholder="Vor- und Nachname"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Mail size={14} className="text-gray-400" /> E-Mail
          </label>
          <input
            className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
            value={email}
            disabled
          />
          <p className="text-xs text-gray-400 mt-1">E-Mail-Adresse kann nicht geändert werden</p>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Phone size={14} className="text-gray-400" /> Telefon
          </label>
          <input
            className="input-field"
            type="tel"
            placeholder="+49 123 456789"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* Language */}
      <div className="card p-4">
        <label className="label flex items-center gap-2 mb-3">
          <Globe size={14} className="text-gray-400" /> Sprache
        </label>
        <div className="space-y-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                language === lang.value
                  ? 'bg-brand-50 ring-2 ring-brand-400'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{lang.label}</span>
              {language === lang.value && (
                <CheckCircle2 size={16} className="ml-auto text-brand-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Push-Benachrichtigungen */}
      <div className="card p-4 space-y-3">
        <label className="label flex items-center gap-2 mb-1">
          <Bell size={14} className="text-gray-400" /> Push-Benachrichtigungen
        </label>
        <PushNotificationSettings userId={userId} />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 px-1">{error}</p>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saved ? (
          <><CheckCircle2 size={18} /> Gespeichert!</>
        ) : loading ? (
          'Speichere…'
        ) : (
          <><Save size={18} /> Änderungen speichern</>
        )}
      </button>
    </div>
  )
}
