'use client'

import { Plus, Loader2, Search, User } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  className?: string
  showLabel?: boolean
}

interface SiteUser {
  id: string
  full_name: string | null
  role: string
}

const roleLabel: Record<string, string> = {
  parent: 'Elternteil',
  educator: 'Erzieher/in',
  group_lead: 'Gruppenleitung',
  admin: 'Administrator',
  caretaker: 'Betreuer/in',
}

export default function NewConversationButton({ className = '', showLabel = false }: Props) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<SiteUser[]>([])
  const [selectedUser, setSelectedUser] = useState<SiteUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function openDialog() {
    setOpen(true)
    setLoadingUsers(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoadingUsers(false); return }

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('site_id', siteId)
      .neq('id', user.id)
      .order('full_name')

    setUsers((data ?? []) as SiteUser[])
    setLoadingUsers(false)
  }

  function closeDialog() {
    setOpen(false)
    setSubject('')
    setSearch('')
    setSelectedUser(null)
    setUsers([])
  }

  async function handleCreate() {
    if (!selectedUser) return
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

    // Check if a direct conversation already exists between these two users
    const { data: existingParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    const myConvIds = (existingParts ?? []).map(p => p.conversation_id)

    let existingConvId: string | null = null
    if (myConvIds.length > 0) {
      const { data: theirParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', selectedUser.id)
        .in('conversation_id', myConvIds)

      if (theirParts && theirParts.length > 0) {
        // Check if it's a direct (2-person) conversation
        for (const p of theirParts) {
          const { count } = await supabase
            .from('conversation_participants')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', p.conversation_id)
          if (count === 2) {
            existingConvId = p.conversation_id
            break
          }
        }
      }
    }

    if (existingConvId) {
      // Reuse existing conversation
      setLoading(false)
      closeDialog()
      router.push(`/nachrichten/${existingConvId}`)
      return
    }

    // Create new conversation
    const convSubject = subject.trim() || null

    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ site_id: siteId, subject: convSubject, type: 'direct' })
      .select('id')
      .single()

    if (error || !conv) { setLoading(false); return }

    // Add both participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: user.id },
      { conversation_id: conv.id, user_id: selectedUser.id },
    ])

    setLoading(false)
    closeDialog()
    router.push(`/nachrichten/${conv.id}`)
    router.refresh()
  }

  const filteredUsers = users.filter(u =>
    !search.trim() ||
    (u.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    roleLabel[u.role]?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <button
        onClick={openDialog}
        className={`btn-primary flex items-center gap-2 ${className}`}
      >
        <Plus size={18} />
        {showLabel && <span>Neue Nachricht</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Neue Nachricht</h2>
              <p className="text-sm text-gray-400 mt-0.5">Wähle einen Empfänger aus</p>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  className="input pl-8 text-sm"
                  placeholder="Name oder Rolle suchen…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Optional subject */}
            <div className="px-5 py-3 border-b border-gray-100">
              <input
                className="input text-sm"
                placeholder="Betreff (optional)"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* User list */}
            <div className="max-h-64 overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-gray-300" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  {search ? 'Keine Ergebnisse' : 'Keine Nutzer verfügbar'}
                </div>
              ) : (
                filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(prev => prev?.id === u.id ? null : u)}
                    className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedUser?.id === u.id ? 'bg-brand-50' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      selectedUser?.id === u.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {(u.full_name ?? '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedUser?.id === u.id ? 'text-brand-700' : 'text-gray-900'}`}>
                        {u.full_name ?? 'Unbekannt'}
                      </p>
                      <p className="text-xs text-gray-400">{roleLabel[u.role] ?? u.role}</p>
                    </div>
                    {selectedUser?.id === u.id && (
                      <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button onClick={closeDialog} className="btn-secondary flex-1">
                Abbrechen
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedUser || loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Erstelle…</> : 'Nachricht starten'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
