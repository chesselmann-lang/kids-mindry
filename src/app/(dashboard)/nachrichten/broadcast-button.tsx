'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Megaphone, X, Loader2, Users, Check, Sparkles } from 'lucide-react'

interface Group { id: string; name: string; color: string }

interface Props {
  siteId: string
  currentUserId: string
  groups: Group[]
}

export default function BroadcastButton({ siteId, currentUserId, groups }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null) // null = alle
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [tonalitaet, setTonalitaet] = useState<'informell' | 'formell' | 'dringend'>('informell')
  const router = useRouter()
  const supabase = createClient()

  async function generateDraft() {
    if (!subject.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/eltern-nachricht', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thema: subject.trim(), tonalitaet }),
      })
      const data = await res.json()
      if (data.text) setMessage(data.text)
    } catch { /* silent */ }
    finally { setAiLoading(false) }
  }

  function reset() {
    setSelectedGroup(null); setMessage(''); setSubject(''); setSentCount(null)
  }

  async function sendBroadcast() {
    if (!message.trim()) return
    setSending(true)

    // Load parent profiles for the selected group (via children → guardians → profiles)
    let parentIds: string[] = []

    if (selectedGroup) {
      // Parents whose children are in that group
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .eq('site_id', siteId)
        .eq('group_id', selectedGroup)
        .eq('status', 'active')

      const childIds = (children ?? []).map((c: any) => c.id)
      if (childIds.length > 0) {
        const { data: guardians } = await supabase
          .from('guardians')
          .select('user_id')
          .in('child_id', childIds)
          .not('user_id', 'is', null)

        parentIds = [...new Set((guardians ?? []).map((g: any) => g.user_id).filter(Boolean))]
      }
    } else {
      // All parents in site
      const { data: parents } = await supabase
        .from('profiles')
        .select('id')
        .eq('site_id', siteId)
        .eq('role', 'parent')

      parentIds = (parents ?? []).map((p: any) => p.id)
    }

    // Remove current user from list
    parentIds = parentIds.filter(id => id !== currentUserId)

    if (parentIds.length === 0) {
      setSending(false)
      setSentCount(0)
      return
    }

    // For each parent: find or create a direct conversation, then send message
    let sent = 0

    // Get current user's conversations
    const { data: myParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId)

    const myConvIds = (myParts ?? []).map((p: any) => p.conversation_id)

    for (const parentId of parentIds) {
      let convId: string | null = null

      // Find existing direct conversation with this parent
      if (myConvIds.length > 0) {
        const { data: theirParts } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', parentId)
          .in('conversation_id', myConvIds)

        for (const p of (theirParts ?? [])) {
          const { count } = await supabase
            .from('conversation_participants')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', p.conversation_id)
          if (count === 2) { convId = p.conversation_id; break }
        }
      }

      // Create new conversation if needed
      if (!convId) {
        const { data: conv } = await supabase
          .from('conversations')
          .insert({ site_id: siteId, subject: subject.trim() || null, type: 'direct' })
          .select('id').single()

        if (conv) {
          convId = conv.id
          await supabase.from('conversation_participants').insert([
            { conversation_id: convId, user_id: currentUserId },
            { conversation_id: convId, user_id: parentId },
          ])
        }
      }

      if (convId) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          sender_id: currentUserId,
          body: message.trim(),
          type: 'text',
        })
        sent++
      }
    }

    setSending(false)
    setSentCount(sent)
    router.refresh()
  }

  const groupLabel = selectedGroup
    ? groups.find(g => g.id === selectedGroup)?.name ?? 'Gruppe'
    : 'alle Eltern'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
      >
        <Megaphone size={16} /> Broadcast
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Megaphone size={18} className="text-amber-600" />
                <h2 className="font-bold text-gray-900">Broadcast-Nachricht</h2>
              </div>
              <button onClick={() => { setOpen(false); reset() }} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {sentCount !== null ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Check size={28} className="text-green-600" />
                </div>
                <p className="font-bold text-gray-900">Gesendet!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Nachricht an <strong>{sentCount}</strong> {sentCount === 1 ? 'Elternteil' : 'Eltern'} verschickt.
                </p>
                <button onClick={() => { setOpen(false); reset() }} className="btn-primary mt-5">
                  Schließen
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Zielgruppe */}
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Users size={13} className="text-gray-400" /> Empfänger
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedGroup(null)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedGroup === null ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Alle Eltern
                    </button>
                    {groups.map(g => (
                      <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selectedGroup === g.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={selectedGroup === g.id ? { backgroundColor: g.color } : {}}>
                        {g.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Betreff */}
                <div>
                  <label className="label">Betreff (optional)</label>
                  <input className="input" placeholder="z.B. Wichtige Info zur morgigen Exkursion"
                    value={subject} onChange={e => setSubject(e.target.value)} />
                </div>

                {/* KI-Entwurf */}
                {subject.trim() && (
                  <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {(['informell', 'formell', 'dringend'] as const).map(t => (
                        <button key={t} onClick={() => setTonalitaet(t)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                            tonalitaet === t ? 'bg-violet-600 text-white' : 'bg-white text-violet-600 border border-violet-200'
                          }`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={generateDraft}
                      disabled={aiLoading}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:bg-violet-700 transition-colors disabled:opacity-40"
                    >
                      {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                      KI-Entwurf
                    </button>
                  </div>
                )}

                {/* Nachricht */}
                <div>
                  <label className="label">Nachricht *</label>
                  <textarea className="input resize-none" rows={4}
                    placeholder={`Nachricht an ${groupLabel}…`}
                    value={message} onChange={e => setMessage(e.target.value)} />
                </div>

                <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700 flex items-start gap-2">
                  <Megaphone size={13} className="flex-shrink-0 mt-0.5" />
                  Diese Nachricht wird als direkte Nachricht an {groupLabel} gesendet.
                  Jede Familie erhält sie separat in ihrem Posteingang.
                </div>
              </div>
            )}

            {sentCount === null && (
              <div className="flex gap-3 px-5 pb-5 border-t border-gray-100 pt-3">
                <button onClick={() => { setOpen(false); reset() }} className="btn-secondary flex-1">
                  Abbrechen
                </button>
                <button onClick={sendBroadcast} disabled={!message.trim() || sending}
                  className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2">
                  {sending
                    ? <><Loader2 size={16} className="animate-spin" /> Sende…</>
                    : <><Megaphone size={16} /> Senden</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
