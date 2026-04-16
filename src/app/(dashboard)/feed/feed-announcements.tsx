'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { Bell, Pin, Info, CalendarDays, Utensils, Clock, Users, Loader2, ThumbsUp, Heart, Eye, Smile, Sparkles, PartyPopper, Languages, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const typeConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  info:      { label: 'Info',          color: 'bg-blue-100 text-blue-700',    icon: Info },
  important: { label: 'Wichtig',       color: 'bg-red-100 text-red-700',      icon: Bell },
  event:     { label: 'Veranstaltung', color: 'bg-purple-100 text-purple-700', icon: CalendarDays },
  menu:      { label: 'Speiseplan',    color: 'bg-green-100 text-green-700',  icon: Utensils },
  reminder:  { label: 'Erinnerung',    color: 'bg-yellow-100 text-yellow-700', icon: Clock },
}

const REACTIONS = ['❤️', '👍', '👀', '😊', '🙏', '🎉']

interface Announcement {
  id: string
  title: string
  body: string | null
  type: string
  pinned: boolean
  published_at: string
  group_id: string | null
  site_id: string
  [key: string]: any
}

interface Group { name: string; color: string }

interface Props {
  initialAnnouncements: Announcement[]
  initialHasMore: boolean
  initialTotal: number
  siteId: string
  isStaff: boolean
  userId: string
  userLanguage?: string
  groupMap: Record<string, Group>
}

function ReactionBar({ announcementId, userId }: { announcementId: string; userId: string }) {
  const [reactions, setReactions] = useState<Record<string, number>>({})
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    // Load existing reactions
    const load = async () => {
      const { data } = await (supabase as any)
        .from('announcement_reactions')
        .select('emoji, user_id')
        .eq('announcement_id', announcementId)

      const counts: Record<string, number> = {}
      const mine = new Set<string>()
      for (const r of data ?? []) {
        counts[r.emoji] = (counts[r.emoji] ?? 0) + 1
        if (r.user_id === userId) mine.add(r.emoji)
      }
      setReactions(counts)
      setMyReactions(mine)
    }
    load()

    // Realtime
    const channel = supabase
      .channel(`reactions:${announcementId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'announcement_reactions',
        filter: `announcement_id=eq.${announcementId}`,
      }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcementId])

  const toggle = async (emoji: string) => {
    if (myReactions.has(emoji)) {
      // Remove
      await (supabase as any)
        .from('announcement_reactions')
        .delete()
        .eq('announcement_id', announcementId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
      setMyReactions(prev => { const s = new Set(prev); s.delete(emoji); return s })
      setReactions(prev => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] ?? 1) - 1) }))
    } else {
      // Add
      await (supabase as any)
        .from('announcement_reactions')
        .upsert({ announcement_id: announcementId, user_id: userId, emoji })
      setMyReactions(prev => new Set(Array.from(prev).concat(emoji)))
      setReactions(prev => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + 1 }))
    }
  }

  const active = REACTIONS.filter(e => (reactions[e] ?? 0) > 0)
  const all    = REACTIONS

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {all.map(emoji => {
        const count = reactions[emoji] ?? 0
        const isMe = myReactions.has(emoji)
        if (count === 0 && !isMe) return (
          <button key={emoji} onClick={() => toggle(emoji)}
            className="text-base opacity-30 hover:opacity-80 transition-opacity leading-none"
            title={`Mit ${emoji} reagieren`}
          >{emoji}</button>
        )
        return (
          <button key={emoji} onClick={() => toggle(emoji)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
              isMe ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}

function AnnouncementCard({
  a, group, isStaff, userId, userLanguage
}: {
  a: Announcement
  group: Group | null
  isStaff: boolean
  userId: string
  userLanguage?: string
}) {
  const [translating, setTranslating] = useState(false)
  const [translated, setTranslated] = useState<string | null>(null)
  const [showOriginal, setShowOriginal] = useState(false)

  const cfg = typeConfig[a.type] ?? typeConfig.info
  const Icon = cfg.icon
  const ago = formatDistanceToNow(new Date(a.published_at), { locale: de, addSuffix: true })

  const handleTranslate = async () => {
    setTranslating(true)
    try {
      const res = await fetch(`/api/announcements/${a.id}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLang: userLanguage ?? 'DE' }),
      })
      const json = await res.json()
      if (json.translatedContent) setTranslated(json.translatedContent)
    } catch {}
    setTranslating(false)
  }

  const displayBody = (!showOriginal && translated) ? translated : a.body

  return (
    <div className={`card p-5 ${a.pinned ? 'ring-1 ring-brand-200' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${cfg.color}`}>
            <Icon size={10}/> {cfg.label}
          </span>
          {group && (
            <span className="badge text-white text-[10px]" style={{ backgroundColor: group.color }}>
              <Users size={9}/> {group.name}
            </span>
          )}
          {a.pinned && (
            <span className="badge bg-brand-50 text-brand-700">
              <Pin size={10}/> Angepinnt
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{ago}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mt-3 text-base">{a.title}</h3>
      {displayBody && (
        <div
          className="text-sm text-gray-600 mt-1.5 leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: displayBody }}
        />
      )}

      {/* Translate button */}
      {!isStaff && a.body && (
        <div className="mt-2 flex items-center gap-2">
          {!translated ? (
            <button onClick={handleTranslate} disabled={translating}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-brand-600 transition-colors disabled:opacity-50">
              {translating
                ? <><Loader2 size={12} className="animate-spin"/>Übersetze…</>
                : <><Languages size={12}/>Übersetzen</>
              }
            </button>
          ) : (
            <button onClick={() => setShowOriginal(o => !o)}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800">
              <CheckCheck size={12}/>
              {showOriginal ? 'Übersetzung zeigen' : 'Original zeigen'}
            </button>
          )}
        </div>
      )}

      {/* Reactions */}
      <ReactionBar announcementId={a.id} userId={userId} />
    </div>
  )
}

export default function FeedAnnouncements({
  initialAnnouncements,
  initialHasMore,
  initialTotal,
  siteId,
  isStaff,
  userId,
  userLanguage,
  groupMap,
}: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [localGroupMap, setLocalGroupMap] = useState<Record<string, Group>>(groupMap)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(initialAnnouncements.length)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/feed/announcements?offset=${offsetRef.current}&limit=15&siteId=${siteId}`
      )
      const json = await res.json()
      if (json.announcements?.length > 0) {
        setAnnouncements(prev => [...prev, ...json.announcements])
        offsetRef.current += json.announcements.length

        // Load groups for any new group_ids
        const newGroupIds = json.announcements
          .map((a: any) => a.group_id)
          .filter((id: string | null) => id && !localGroupMap[id])
        if (newGroupIds.length > 0) {
          // Could load group data here, but typically already cached
        }
      }
      setHasMore(json.hasMore ?? false)
    } catch {}
    setLoading(false)
  }, [loading, hasMore, siteId, localGroupMap])

  // IntersectionObserver: fire loadMore when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { rootMargin: '200px' }  // start loading 200px before the end
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  return (
    <div>
      <div className="space-y-3">
        {announcements.map(a => {
          const group = a.group_id ? (localGroupMap[a.group_id] ?? null) : null
          return (
            <AnnouncementCard
              key={a.id}
              a={a}
              group={group}
              isStaff={isStaff}
              userId={userId}
              userLanguage={userLanguage}
            />
          )
        })}
      </div>

      {/* Sentinel + loading indicator */}
      <div ref={sentinelRef} className="h-4" />
      {loading && (
        <div className="flex justify-center py-4">
          <Loader2 size={20} className="animate-spin text-brand-400" />
        </div>
      )}
      {!hasMore && announcements.length > 0 && (
        <p className="text-center text-xs text-gray-400 py-4">
          Alle {announcements.length} Beiträge geladen
        </p>
      )}
    </div>
  )
}
