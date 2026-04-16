'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-Mail oder Passwort ist falsch.')
      setLoading(false)
      return
    }
    router.push('/feed')
    router.refresh()
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Anmelden</h2>
      <p className="text-sm text-gray-500 mb-7">Willkommen zurück!</p>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="label">E-Mail-Adresse</label>
          <input
            type="email" required autoComplete="email"
            className="input-field"
            placeholder="name@beispiel.de"
            value={email} onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Passwort</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} required autoComplete="current-password"
              className="input-field pr-12"
              placeholder="Ihr Passwort"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
          {loading ? <Loader2 size={18} className="animate-spin"/> : <LogIn size={18}/>}
          {loading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Noch kein Konto?{' '}
        <Link href="/register" className="text-brand-700 font-semibold hover:underline">
          Registrieren
        </Link>
      </p>
    </>
  )
}
