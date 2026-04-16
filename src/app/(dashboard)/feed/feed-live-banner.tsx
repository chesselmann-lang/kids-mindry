'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowUp, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  siteId: string
  initialCount: number
}

export default function FeedLiveBanner({ siteId, initialCount }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [newCount, setNewCount] = useState(0)
  const [lastKnown, setLastKnown] = useState(initialCount)

  useEffect(() => {
    const channel = supabase
      .channel('feed-announcements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
          filter: `site_id=eq.${siteId}`,
        },
        () => {
          setNewCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase, siteId])

  if (newCount === 0) return null

  return (
    <button
      onClick={() => { setNewCount(0); router.refresh() }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-brand-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg hover:bg-brand-700 transition-all animate-bounce-once"
    >
      <ArrowUp size={16} />
      {newCount} neuer Beitrag{newCount > 1 ? 'e' : ''}
      <RefreshCw size={14} />
    </button>
  )
}
