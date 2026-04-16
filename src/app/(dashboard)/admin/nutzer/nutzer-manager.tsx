'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserPlus, Loader2, CheckCircle2, Mail, Shield, User, Link2, Copy, Check } from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string | null
  role: string
  created_at: string
}

const roleLabels: Record<string, string> = {
  parent: 'Elternteil',
  educator: 'Erzieher/in',
  group_lead: 'Gruppenleitung',
  admin: 'Administrator',
  caretaker: 'Betreuer/in',
}

const roleColors: Record<string, string> = {
  parent: 'bg-gray-100 text-gray-600',
  educator: 'bg-blue-100 text-blue-700',
  group_lead: 'bg-purple-100 text-purple-700',
  admin: 'bg-brand-100 text-brand-700',
  caretaker: 'bg-green-100 text-green-700',
}

interface Props {
  users: UserProfile[]
  siteId: string
}

export default function NutzerManager({ users, siteId }: Props) {
  const supabase = createClient()
  const [showInvite, setShowInvite] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'parent' | 'educator' | 'group_lead' | 'admin'>('parent')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function copyLink(role: 'parent' | 'educator') {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://kids.mindry.de'
    const token = btoa(`site:${siteId}:role:${role}:ts:${Date.now()}`)
    const url = `${base}/register?token=${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(role)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  // Group users by role
  const staff = users.filter(u => u.role !== 'parent')
  const parents = users.filter(u => u.role === 'parent')

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Einladung fehlgeschlagen')
      setSuccess(`Einladung an ${inviteEmail} verschickt (${roleLabels[inviteRole]})`)
      setInviteEmail('')
      setShowInvite(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Einladung fehlgeschlagen')
    }
    setSubmitting(false)
  }

  function UserRow({ u }: { u: UserProfile }) {
    const initials = (u.full_name ?? '?').split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)
    return (
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900">{u.full_name ?? 'Unbekannt'}</p>
          <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${roleColors[u.role] ?? 'bg-gray-100 text-gray-500'}`}>
            {roleLabels[u.role] ?? u.role}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(u.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Invite button / form */}
      {showInvite ? (
        <form onSubmit={sendInvite} className="card p-5 space-y-4">
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus size={18} className="text-brand-600" /> Nutzer einladen
          </p>
          <div>
            <label className="label">E-Mail-Adresse</label>
            <input
              type="email"
              className="input"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="eltern@example.de"
              required
            />
          </div>
          <div>
            <label className="label">Rolle</label>
            <div className="grid grid-cols-2 gap-2">
              {(['parent', 'educator', 'group_lead', 'admin'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setInviteRole(r)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                    inviteRole === r
                      ? 'border-brand-500 bg-brand-50 text-brand-800'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary flex-1">Abbrechen</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
              Einladung senden
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowInvite(true)} className="btn-primary w-full py-3">
          <UserPlus size={18} /> Nutzer einladen
        </button>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 rounded-2xl text-sm text-green-700">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {/* Invite links */}
      <div className="card p-4 space-y-3">
        <p className="font-semibold text-sm text-gray-900 flex items-center gap-2">
          <Link2 size={16} className="text-brand-600" /> Einladungslinks
        </p>
        <p className="text-xs text-gray-500">Kopiere einen Link und teile ihn direkt mit neuen Nutzern.</p>
        <div className="space-y-2">
          {(['parent', 'educator'] as const).map(r => (
            <button
              key={r}
              onClick={() => copyLink(r)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
              <span className="font-medium text-gray-700">
                {r === 'parent' ? '👨‍👩‍👧 Eltern-Registrierungslink' : '👩‍🏫 Erzieher-Registrierungslink'}
              </span>
              {copied === r
                ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><Check size={13} /> Kopiert!</span>
                : <span className="flex items-center gap-1 text-gray-400 text-xs"><Copy size={13} /> Kopieren</span>
              }
            </button>
          ))}
        </div>
      </div>

      {/* Staff */}
      {staff.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Shield size={12} /> Team ({staff.length})
          </p>
          <div className="card overflow-hidden p-0 divide-y divide-gray-100">
            {staff.map(u => <UserRow key={u.id} u={u} />)}
          </div>
        </div>
      )}

      {/* Parents */}
      {parents.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <User size={12} /> Eltern ({parents.length})
          </p>
          <div className="card overflow-hidden p-0 divide-y divide-gray-100">
            {parents.map(u => <UserRow key={u.id} u={u} />)}
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className="card p-10 text-center">
          <User size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Nutzer registriert</p>
        </div>
      )}
    </div>
  )
}
