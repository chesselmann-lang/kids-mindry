'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KeyRound, Loader2, CheckCircle2, X } from 'lucide-react'

interface Props {
  email: string
}

export default function PasswortReset({ email }: Props) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendReset() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <KeyRound size={17} className="text-gray-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">Passwort ändern</p>
          <p className="text-xs text-gray-400">Reset-Link per E-Mail</p>
        </div>
      </button>
    )
  }

  if (done) {
    return (
      <div className="flex items-center gap-4 px-5 py-4 bg-green-50">
        <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Reset-Link verschickt</p>
          <p className="text-xs text-green-600">Bitte prüfen Sie Ihr E-Mail-Postfach</p>
        </div>
        <button onClick={() => { setOpen(false); setDone(false) }} className="text-green-600">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 space-y-3 bg-gray-50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">Passwort zurücksetzen</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      <p className="text-xs text-gray-500">
        Ein Reset-Link wird an <strong>{email}</strong> geschickt.
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        onClick={sendReset}
        disabled={loading}
        className="btn-primary w-full py-2.5 text-sm"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" />Wird gesendet...</>
          : <><KeyRound size={15} />Reset-Link senden</>
        }
      </button>
    </div>
  )
}
