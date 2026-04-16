import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Baby, Plus, Cake, Monitor } from 'lucide-react'
import Link from 'next/link'
import CheckInList from './check-in-list'
import AiKinderTagesuebersicht from './ai-kinder-tagesuebersicht'

export const metadata = { title: 'Kinder' }

export default async function KinderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, site_id')
    .eq('id', user.id)
    .single()

  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes(profile?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .order('first_name')

  const childIds = (children ?? []).map(c => c.id)
  const attendanceMap: Record<string, 'present' | 'absent_sick' | 'absent_vacation' | 'absent_other' | 'unknown'> = {}

  if (childIds.length > 0) {
    const { data: att } = await supabase
      .from('attendance')
      .select('child_id, status')
      .in('child_id', childIds)
      .eq('date', today)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(att ?? []).forEach((a: any) => { attendanceMap[a.child_id] = a.status })
  }

  const { data: groups } = await supabase
    .from('groups')
    .select('id, name, color')
    .eq('site_id', siteId)
  const groupMap = Object.fromEntries((groups ?? []).map(g => [g.id, g]))

  // Load favorites for current user
  const { data: favRows } = await supabase
    .from('favorite_children')
    .select('child_id')
    .eq('user_id', user.id)
  const favoriteIds = new Set((favRows ?? []).map((f: any) => f.child_id))

  const enrichedChildren = (children ?? []).map(child => ({
    ...child,
    groupName: child.group_id ? groupMap[child.group_id]?.name : undefined,
    groupColor: child.group_id ? groupMap[child.group_id]?.color : undefined,
    isFavorite: favoriteIds.has(child.id),
  }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kinder</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStaff && (
            <Link href="/geburtstage" className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Geburtstage">
              <Cake size={20} className="text-yellow-500" />
            </Link>
          )}
          {isStaff && (
            <Link href="/admin/anwesenheit/live" className="p-2 rounded-xl hover:bg-gray-100 transition-colors" title="Live-Anwesenheitstafel">
              <Monitor size={20} className="text-brand-500" />
            </Link>
          )}
          {isAdmin && (
            <Link href="/admin/kinder/neu" className="btn-primary text-sm px-4 py-2">
              <Plus size={16} /> Kind anlegen
            </Link>
          )}
        </div>
      </div>

      {!children || children.length === 0 ? (
        <div className="card p-12 text-center">
          <Baby size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600">Noch keine Kinder erfasst</p>
          <p className="text-sm text-gray-400 mt-1">Kinder können im Admin-Bereich angelegt werden</p>
          {isAdmin && (
            <Link href="/admin/kinder/neu" className="btn-primary mt-4 inline-flex">
              <Plus size={16} /> Kind anlegen
            </Link>
          )}
        </div>
      ) : (
        <>
          <AiKinderTagesuebersicht />
          <CheckInList
            children={enrichedChildren}
            initialAttendance={attendanceMap}
            siteId={siteId}
            today={today}
            groups={(groups ?? []) as { id: string; name: string; color: string }[]}
            userId={user.id}
          />
        </>
      )}
    </div>
  )
}
