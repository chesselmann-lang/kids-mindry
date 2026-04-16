'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2, ChevronDown, X } from 'lucide-react'

interface Guardian {
  user_id: string | null
  full_name: string
  relationship: string
}

interface Props {
  currentUserId: string
  guardians: Guardian[]
  siteId: string
}

export default function ElternSchreibenButton({ currentUserId, guardians, siteId }: Props) {
  const [loading, setLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const linked = guardians.filter(g => g.user_id)
  if (linked.length === 0) return null

  async function openConversation(parentUserId: string) {
    setLoading(true)
    setShowPicker(false)

    // Find existing 2-person direct conversation between me and this parent
    const { data: myParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId)

    const myConvIds = (myParts ?? []).map((p: any) => p.conversation_id)
    let convId: string | null = null

    if (myConvIds.length > 0) {
      const { data: theirParts } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', parentUserId)
        .in('conversation_id', myConvIds)

      for (const p of (theirParts ?? [])) {
        const { count } = await supabase
          .from('conversation_participants')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', (p as any).conversation_id)
        if (count === 2) { convId = (p as any).conversation_id; break }
      }
    }

    if (!convId) {
      const { data: conv } = await supabase
        .from('conversations')
        .insert({ site_id: siteId, type: 'direct' })
        .select('id').single()
      if (conv) {
        convId = (conv as any).id
        await supabase.from('conversation_participants').insert([
          { conversation_id: convId, user_id: currentUserId },
          { conversation_id: convId, user_id: parentUserId },
        ])
      }
    }

    setLoading(false)
    if (convId) router.push(`/nachrichten/${convId}`)
  }

  // Single guardian — direct click
  if (linked.length === 1) {
    return (
      <button
        onClick={() => openConversation(linked[0].user_id!)}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-brand-600 font-medium disabled:opacity-50 hover:text-brand-800 transition-colors"
      >
        {loading
          ? <Loader2 size={12} className="animate-spin" />
          : <MessageCircle size={12} />
        }
        Schreiben
      </button>
    )
  }

  // Multiple guardians — show picker
  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(p => !p)}
        disabled={loading}
        className="flex items-center gap-1 text-xs text-brand-600 font-medium disabled:opacity-50 hover:text-brand-800 transition-colors"
      >
        {loading
          ? <Loader2 size={12} className="animate-spin" />
          : <MessageCircle size={12} />
        }
        Schreiben
        <ChevronDown size={10} />
      </button>

      {showPicker && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
          <div className="absolute right-0 top-6 z-20 bg-white border border-gray-100 rounded-xl shadow-lg p-1 min-w-[180px]">
            <div className="flex items-center justify-between px-3 py-1.5 mb-1">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Elternteil wählen</span>
              <button onClick={() => setShowPicker(false)}>
                <X size={12} className="text-gray-400" />
              </button>
            </div>
            {linked.map(g => (
              <button
                key={g.user_id}
                onClick={() => openConversation(g.user_id!)}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="font-medium">{g.full_name}</span>
                <span className="text-gray-400 ml-1 capitalize">({g.relationship})</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
