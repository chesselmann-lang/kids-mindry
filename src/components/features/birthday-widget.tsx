import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Cake } from 'lucide-react'

export default async function BirthdayWidget() {
  const supabase = await createClient()
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const today = new Date()
  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, last_name, date_of_birth, group_id, groups(name, color)')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .not('date_of_birth', 'is', null)

  // Geburtstage der nächsten 7 Tage finden
  const upcoming = (children ?? []).filter((c: any) => {
    if (!c.date_of_birth) return false
    const dob = new Date(c.date_of_birth)
    for (let i = 0; i <= 7; i++) {
      const check = new Date(today)
      check.setDate(check.getDate() + i)
      if (dob.getDate() === check.getDate() && dob.getMonth() === check.getMonth()) return true
    }
    return false
  }).map((c: any) => {
    const dob = new Date(c.date_of_birth)
    const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
    const isToday = thisYear.toDateString() === today.toDateString()
    const daysUntil = Math.round((thisYear.getTime() - today.getTime()) / 86400000)
    const age = today.getFullYear() - dob.getFullYear()
    return { ...c, isToday, daysUntil: daysUntil < 0 ? daysUntil + 365 : daysUntil, age }
  }).sort((a: any, b: any) => a.daysUntil - b.daysUntil)

  if (upcoming.length === 0) return null

  return (
    <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Cake size={16} className="text-pink-500" />
        <p className="text-xs font-black uppercase tracking-widest text-pink-500">Geburtstage</p>
      </div>
      <div className="space-y-2">
        {(upcoming as any[]).map((child) => (
          <Link
            key={child.id}
            href={`/admin/kinder/${child.id}/bearbeiten`}
            className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 hover:shadow-sm transition-shadow"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: ((child.groups as any)?.color ?? '#ec4899') + '20' }}>
              {child.isToday ? '🎂' : '🎁'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{child.first_name} {child.last_name}</p>
              <p className="text-xs text-gray-400">
                {child.isToday
                  ? `🎉 Heute! Wird ${child.age} Jahre`
                  : `In ${child.daysUntil} Tag${child.daysUntil === 1 ? '' : 'en'} · ${child.age} Jahre`}
              </p>
            </div>
            {(child.groups as any)?.name && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: (child.groups as any)?.color ?? '#9ca3af' }}>
                {(child.groups as any).name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
