'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const EMOJIS = ['❤️', '👍', '👀', '😊', '🙏', '🎉']

interface Counts { [emoji: string]: number }

export default function ReactionBar({ announcementId, userId }: { announcementId: string; userId: string }) {
  const [counts, setCounts] = useState<Counts>({})
  const [mine, setMine] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadReactions()
    // Realtime
    const channel = supabase
      .channel(`reactions:${announcementId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'announcement_reactions',
        filter: `announcement_id=eq.${announcementId}`,
      }, () => loadReactions())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [announcementId])

  async function loadReactions() {
    const { data } = await (supabase as any)
      .from('announcement_reactions')
      .select('emoji, user_id')
      .eq('announcement_id', announcementId)

    if (!data) return
    const c: Counts = {}
    const m = new Set<string>()
    for (const r of data) {
      c[r.emoji] = (c[r.emoji] ?? 0) + 1
      if (r.user_id === userId) m.add(r.emoji)
    }
    setCounts(c)
    setMine(m)
  }

  async function toggle(emoji: string) {
    setLoading(emoji)
    if (mine.has(emoji)) {
      await (supabase as any)
        .from('announcement_reactions')
        .delete()
        .eq('announcement_id', announcementId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
    } else {
      await (supabase as any)
        .from('announcement_reactions')
        .insert({ announcement_id: announcementId, user_id: userId, emoji })
    }
    setLoading(null)
  }

  const hasAny = EMOJIS.some(e => (counts[e] ?? 0) > 0)

  return (
    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
      {EMOJIS.map(emoji => {
        const count = counts[emoji] ?? 0
        const active = mine.has(emoji)
        if (!hasAny && !active) {
          // Kompakter "Reaktion hinzufügen"-Button wenn noch keine da sind
          return null
        }
        if (count === 0 && !active) return null
        return (
          <button key={emoji}
            onClick={() => toggle(emoji)}
            disabled={loading === emoji}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm transition-all active:scale-95 ${
              active
                ? 'bg-brand-100 border border-brand-200 text-brand-700 font-semibold'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}>
            {emoji} {count > 0 && <span className="text-xs font-bold">{count}</span>}
          </button>
        )
      })}
      <button
        onClick={() => {
          // Zeige alle Emojis zum Hinzufügen
          const next = EMOJIS.find(e => !mine.has(e))
          if (next) toggle(next)
        }}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all"
      >
        😊 +
      </button>
      {/* Emoji-Picker */}
      <EmojiPicker emojis={EMOJIS} mine={mine} onToggle={toggle} />
    </div>
  )
}

function EmojiPicker({ emojis, mine, onToggle }: { emojis: string[]; mine: Set<string>; onToggle: (e: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all">
        ＋
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-1.5 z-20">
            {emojis.map(e => (
              <button key={e}
                onClick={() => { onToggle(e); setOpen(false) }}
                className={`text-xl p-1.5 rounded-xl hover:bg-gray-100 transition-all ${mine.has(e) ? 'bg-brand-50 ring-1 ring-brand-200' : ''}`}>
                {e}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
