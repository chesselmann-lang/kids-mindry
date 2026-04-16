'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  newsletterId: string
  userId: string
  alreadyRead: boolean
}

export default function ReadTracker({ newsletterId, userId, alreadyRead }: Props) {
  useEffect(() => {
    if (alreadyRead) return
    const supabase = createClient()
    supabase.from('newsletter_reads').upsert({
      newsletter_id: newsletterId,
      user_id: userId,
    }, { onConflict: 'newsletter_id,user_id' }).then(() => {})
  }, [newsletterId, userId, alreadyRead])

  return null
}
