'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, LogIn, Users } from 'lucide-react'

const ADMIN_EMAIL    = 'hallo@hesselmann-service.de'
const ADMIN_PASSWORD = 'Hesselmann2026!'

type DemoRole = 'erzieher' | 'leitung' | 'elternteil' | 'traeger'
const DEMO_ROLES: { role: DemoRole; label: string; color: string; desc: string }[] = [
  { role: 'erzieher',  label: 'Erzieherin',    color: 'bg-green-100 text-green-800',  desc: 'Sarah Weber · Gruppe Sonnenkinder' },
  { role: 'leitung',   label: 'Kita-Leitung',  color: 'bg-purple-100 text-purple-800', desc: 'Monika Braun · Leiterin Kita Regenbogen' },
  { role: 'elternteil',label: 'Elternteil',     color: 'bg-yellow-100 text-yellow-800', desc: 'Familie Müller · Kind: Jonas, 4 J.' },
  { role: 'traeger',   label: 'Träger-Admin',   color: 'bg-blue-100 text-blue-800',   desc: 'Stadt Münster · 12 Einrichtungen' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [demoLoading, setDemoLoading] = useState<DemoRole | null>(null)
  const [error, setError]       = useState<string | null>(null)

  function enterDemoAs(role: DemoRole) {
    setDemoLoading(role)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kids-demo-mode', '1')
      localStorage.setItem('kids-demo-role', role)
    }
    router.push('/feed')
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Admin bypass (demo mode)
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('kids-demo-mode', '1')
        localStorage.setItem('kids-demo-role', 'leitung')
        localStorage.setItem('kids-admin-email', ADMIN_EMAIL)
      }
      router.push('/feed')
      return
    }

    // Real Supabase auth
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
      <p className="text-sm text-gray-500 mb-6">Willkommen zurück bei mindry Kids!</p>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Demo-Schnellzugang */}
      <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={15} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Demo-Zugang</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ROLES.map(({ role, label, color, desc }) => (
            <button
              key={role}
              onClick={() => enterDemoAs(role)}
              disabled={demoLoading !== null}
              className={`text-left rounded-lg px-3 py-2 text-xs font-medium transition hover:opacity-80 disabled:opacity-50 ${color}`}
            >
              <span className="block font-semibold">{label}</span>
              <span className="block text-xs opacity-70 mt-0.5 leading-tight">{desc}</span>
              {demoLoading === role && <Loader2 size={12} className="animate-spin mt-1" />}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">oder mit E-Mail anmelden</div>
      </div>

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
