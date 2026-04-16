'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  childId: string
  userId: string
  isFavorite: boolean
}

export default function FavoriteButton({ childId, userId, isFavorite: initialFav }: Props) {
  const [fav, setFav] = useState(initialFav)
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const supabase = createClient()
    if (fav) {
      await supabase.from('favorite_children')
        .delete()
        .eq('user_id', userId)
        .eq('child_id', childId)
    } else {
      await supabase.from('favorite_children')
        .insert({ user_id: userId, child_id: childId })
    }
    setFav(v => !v)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
        fav ? 'text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-amber-300'
      }`}
      aria-label={fav ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
    >
      <Star size={15} fill={fav ? 'currentColor' : 'none'} />
    </button>
  )
}
