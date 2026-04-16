import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Star } from 'lucide-react'

interface Props {
  userId: string
  siteId: string
}

export default async function FavoritenStrip({ userId, siteId }: Props) {
  const supabase = await createClient()

  const { data: favRows } = await supabase
    .from('favorite_children')
    .select('child_id, children(id, first_name, last_name, group_id, groups(color))')
    .eq('user_id', userId)
    .limit(10)

  const favorites = (favRows ?? [])
    .map((f: any) => f.children)
    .filter(Boolean)

  if (favorites.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meine Favoriten</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x scrollbar-none">
        {favorites.map((child: any) => {
          const color = child.groups?.color ?? '#3B6CE8'
          return (
            <Link key={child.id} href={`/kinder/${child.id}`}
              className="snap-start flex-shrink-0 flex flex-col items-center gap-1.5 w-14">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: color }}>
                {child.first_name[0]}{child.last_name[0]}
              </div>
              <span className="text-[10px] text-gray-500 font-medium text-center leading-tight truncate w-full text-center">
                {child.first_name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
