import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Baby, Plus, ChevronRight, Edit3 } from 'lucide-react'
import type { Child } from '@/types/database'
import AiKinderUebersicht from './ai-kinder-uebersicht'

export const metadata = { title: 'Kinder verwalten' }

export default async function AdminKinderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes(profile?.role ?? '')) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('site_id', siteId)
    .order('first_name')

  const { data: groups } = await supabase
    .from('groups').select('id, name, color').eq('site_id', siteId)
  const groupMap = Object.fromEntries((groups ?? []).map(g => [g.id, g]))

  const active = (children ?? []).filter(c => c.status === 'active')
  const inactive = (children ?? []).filter(c => c.status !== 'active')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-xs text-brand-600 mb-1 block">← Admin</Link>
          <h1 className="text-2xl font-bold text-gray-900">Kinder</h1>
          <p className="text-sm text-gray-500">{active.length} aktiv · {inactive.length} inaktiv</p>
        </div>
        <Link href="/admin/kinder/neu" className="btn-primary text-sm px-4 py-2">
          <Plus size={16} /> Kind anlegen
        </Link>
      </div>

      <AiKinderUebersicht />

      {/* Active children */}
      {active.length === 0 ? (
        <div className="card p-12 text-center">
          <Baby size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600">Noch keine Kinder angelegt</p>
          <Link href="/admin/kinder/neu" className="btn-primary mt-4 inline-flex">
            <Plus size={16} /> Erstes Kind anlegen
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Aktive Kinder</p>
          <div className="card overflow-hidden p-0">
            {(active as Child[]).map((child, idx) => {
              const group = child.group_id ? groupMap[child.group_id] : null
              const age = child.date_of_birth
                ? Math.floor((Date.now() - new Date(child.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                : null

              return (
                <div
                  key={child.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: group?.color ?? '#3B6CE8' }}
                  >
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">
                      {child.first_name} {child.last_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {group && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: group.color + '20', color: group.color }}
                        >
                          {group.name}
                        </span>
                      )}
                      {age !== null && <span className="text-xs text-gray-400">{age} Jahre</span>}
                      {child.allergies && child.allergies.length > 0 && (
                        <span className="text-xs text-amber-600">⚠️ Allergie</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/kinder/${child.id}/bearbeiten`}
                      className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 size={15} />
                    </Link>
                    <Link href={`/kinder/${child.id}`}>
                      <ChevronRight size={16} className="text-gray-300" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Inaktiv / Warteliste</p>
          <div className="card overflow-hidden p-0">
            {(inactive as Child[]).map((child, idx) => (
              <div
                key={child.id}
                className={`flex items-center gap-3 px-4 py-3.5 opacity-60 ${idx > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
                  {child.first_name[0]}{child.last_name[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-700">{child.first_name} {child.last_name}</p>
                  <span className="text-xs text-gray-400">{child.status === 'waitlist' ? 'Warteliste' : 'Inaktiv'}</span>
                </div>
                <Link
                  href={`/admin/kinder/${child.id}/bearbeiten`}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <Edit3 size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
