'use client'

import { createClient } from '@/lib/supabase/client'
import { CheckCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MarkAllRead({ userId }: { userId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [done, setDone] = useState(false)

  async function markAll() {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)
    setDone(true)
    router.refresh()
  }

  if (done) return null

  return (
    <button
      onClick={markAll}
      className="flex items-center gap-1.5 text-xs text-brand-600 font-medium hover:text-brand-800 transition-colors"
    >
      <CheckCheck size={14} /> Alle gelesen
    </button>
  )
}
