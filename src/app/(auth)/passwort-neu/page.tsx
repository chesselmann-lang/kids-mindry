'use client'
// src/app/(auth)/passwort-neu/page.tsx

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, CheckCircle2, Lock } from 'lucide-react'

export default function PasswortNeuPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Die Passwörter stimmen nicht überein.'); return }
    if (password.length < 8) { setError('Das Passwort muss mindestens 8 Zeichen lang sein.'); return }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Fehler beim Ändern des Passworts. Der Link ist möglicherweise abgelaufen.')
      setLoading(false)
      return
    }

    setDone(true)
    setTimeout(() => router.push('/feed'), 2500)
  }

  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : password.length < 12 ? 2
    : 3

  const strengthLabel = ['', 'Zu kurz', 'Ausreichend', 'Stark']
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-green-500']

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-3">
        <div className="bg-green-100 rounded-full p-3">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Passwort geändert</h2>
        <p className="text-sm text-gray-500">Sie werden automatisch weitergeleitet…</p>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Neues Passwort</h2>
      <p className="text-sm text-gray-500 mb-7">Wählen Sie ein sicheres, neues Passwort.</p>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Neues Passwort</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type={showPw ? 'text' : 'password'} required
              className="input-field pl-10 pr-12"
              placeholder="Mindestens 8 Zeichen"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500">{strengthLabel[strength]}</p>
            </div>
          )}
        </div>

        <div>
          <label className="label">Passwort bestätigen</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="password" required
              className={`input-field pl-10 ${confirm && confirm !== password ? 'border-red-300 focus:ring-red-300' : ''}`}
              placeholder="Passwort wiederholen"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>
          {confirm && confirm !== password && (
            <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Speichern...' : 'Passwort ändern'}
        </button>
      </form>
    </>
  )
}
