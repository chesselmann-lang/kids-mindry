'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Passwort muss mindestens 8 Zeichen haben.'); return }
    setLoading(true); setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, role: 'parent' },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true); setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Fast fertig!</h3>
        <p className="text-gray-500 text-sm">Wir haben Ihnen eine Bestätigungs-E-Mail geschickt. Bitte bestätigen Sie Ihre E-Mail-Adresse.</p>
        <Link href="/login" className="btn-primary mt-6 w-full block text-center">Zum Login</Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Konto erstellen</h2>
      <p className="text-sm text-gray-500 mb-7">Registrieren Sie sich als Elternteil</p>
      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}
      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className="label">Vor- und Nachname</label>
          <input type="text" required className="input-field" placeholder="Max Mustermann"
            value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">E-Mail-Adresse</label>
          <input type="email" required autoComplete="email" className="input-field" placeholder="name@beispiel.de"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Passwort</label>
          <input type="password" required autoComplete="new-password" className="input-field" placeholder="Mindestens 8 Zeichen"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <p className="text-xs text-gray-400">
          Nach der Registrierung verknüpft die Kita Ihren Account mit Ihrem Kind.
        </p>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? <Loader2 size={18} className="animate-spin"/> : <UserPlus size={18}/>}
          {loading ? 'Registrieren...' : 'Konto erstellen'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Bereits registriert?{' '}
        <Link href="/login" className="text-brand-700 font-semibold hover:underline">Anmelden</Link>
      </p>
    </>
  )
}
