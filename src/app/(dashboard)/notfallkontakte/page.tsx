import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone } from 'lucide-react'
import AiNotfallkontakteCheck from './ai-notfallkontakte-check'

export const metadata = { title: 'Notfallkontakte' }

export default async function NotfallkontaktePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: groups }] = await Promise.all([
    supabase
      .from('children')
      .select('id, first_name, last_name, group_id, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, allergies')
      .eq('site_id', siteId)
      .eq('status', 'active')
      .order('first_name'),
    supabase
      .from('groups')
      .select('id, name, color')
      .eq('site_id', siteId),
  ])

  const groupMap = Object.fromEntries((groups ?? []).map((g: any) => [g.id, g]))

  // Group children by group
  const byGroup: Record<string, { group: any; children: any[] }> = {}
  const ungrouped: any[] = []

  ;(children ?? []).forEach((c: any) => {
    if (c.group_id && groupMap[c.group_id]) {
      if (!byGroup[c.group_id]) byGroup[c.group_id] = { group: groupMap[c.group_id], children: [] }
      byGroup[c.group_id].children.push(c)
    } else {
      ungrouped.push(c)
    }
  })

  const sections = Object.values(byGroup).sort((a, b) => a.group.name.localeCompare(b.group.name))
  if (ungrouped.length > 0) sections.push({ group: { id: 'none', name: 'Ohne Gruppe', color: '#9CA3AF' }, children: ungrouped })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Notfallkontakte</h1>
          <p className="text-sm text-gray-400">{(children ?? []).length} Kinder</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
          <Phone size={20} className="text-red-600" />
        </div>
      </div>

      <AiNotfallkontakteCheck />

      {(children ?? []).length === 0 ? (
        <div className="card p-8 text-center">
          <Phone size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Keine Kinder mit Kontaktdaten</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sections.map(({ group, children: kids }) => (
            <div key={group.id}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color }} />
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.name}</p>
              </div>
              <div className="space-y-2">
                {kids.map((child: any) => (
                  <div key={child.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: group.color }}>
                        {child.first_name[0]}{child.last_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/kinder/${child.id}`}
                          className="font-semibold text-gray-900 hover:text-brand-600 text-sm">
                          {child.first_name} {child.last_name}
                        </Link>
                        {child.allergies && child.allergies.length > 0 && (
                          <p className="text-[10px] text-amber-600 mt-0.5">
                            ⚠️ Allergien: {Array.isArray(child.allergies) ? child.allergies.join(', ') : child.allergies}
                          </p>
                        )}
                        {child.emergency_contact_name ? (
                          <div className="mt-2 p-2.5 bg-red-50 rounded-xl">
                            <p className="text-xs font-semibold text-red-700">
                              {child.emergency_contact_name}
                              {child.emergency_contact_relation && (
                                <span className="font-normal text-red-500"> · {child.emergency_contact_relation}</span>
                              )}
                            </p>
                            {child.emergency_contact_phone && (
                              <a
                                href={`tel:${child.emergency_contact_phone}`}
                                className="flex items-center gap-1.5 mt-1 text-red-700 font-bold text-sm">
                                <Phone size={13} />
                                {child.emergency_contact_phone}
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 mt-2 italic">Kein Notfallkontakt hinterlegt</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pb-2">
        Kontaktdaten werden aus den Kinderprofilen geladen.
        Änderungen im Admin-Bereich vornehmen.
      </p>
    </div>
  )
}
