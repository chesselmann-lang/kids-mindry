'use client'
// src/app/(auth)/passwort-vergessen/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/passwort-neu`,
    })

    if (error) {
      setError('Fehler beim Senden. Bitte prüfen Sie die E-Mail-Adresse.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <>
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <div className="bg-green-100 rounded-full p-3">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">E-Mail gesendet</h2>
          <p className="text-sm text-gray-500 max-w-xs">
            Falls ein Konto mit <strong>{email}</strong> existiert, haben wir einen Link zum Zurücksetzen Ihres Passworts gesendet.
          </p>
        </div>
        <p className="text-xs text-center text-gray-400 mb-6">
          Bitte prüfen Sie auch Ihren Spam-Ordner.
        </p>
        <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Anmeldung
        </Link>
      </>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Passwort vergessen?</h2>
      <p className="text-sm text-gray-500 mb-7">
        Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen.
      </p>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">E-Mail-Adresse</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="email" required autoComplete="email"
              className="input-field pl-10"
              placeholder="name@beispiel.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Sende...' : 'Link senden'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Anmeldung
        </Link>
      </div>
    </>
  )
}
