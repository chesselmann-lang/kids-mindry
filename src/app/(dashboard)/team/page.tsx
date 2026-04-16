import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Phone, Mail } from 'lucide-react'
import AiTeamAnalyse from './ai-team-analyse'

export const metadata = { title: 'Team' }

const ROLE_LABELS: Record<string, string> = {
  educator:   'Erzieherin / Erzieher',
  group_lead: 'Gruppenleitung',
  admin:      'Leitung',
  caretaker:  'Betreuung',
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: staffMembers } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, avatar_url')
    .eq('site_id', siteId)
    .in('role', ['educator', 'group_lead', 'admin', 'caretaker'])
    .order('role')
    .order('full_name')

  // Group by role
  const grouped: Record<string, typeof staffMembers> = {}
  for (const member of staffMembers ?? []) {
    const role = (member as any).role
    if (!grouped[role]) grouped[role] = []
    grouped[role]!.push(member as any)
  }

  const roleOrder = ['admin', 'group_lead', 'educator', 'caretaker']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Unser Team</h1>
        <p className="text-sm text-gray-500 mt-0.5">{(staffMembers ?? []).length} Mitarbeiterinnen & Mitarbeiter</p>
      </div>

      <AiTeamAnalyse />

      {roleOrder.filter(r => grouped[r]?.length).map(role => (
        <div key={role}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            {ROLE_LABELS[role] ?? role}
          </p>
          <div className="space-y-2">
            {(grouped[role] ?? []).map((member: any) => (
              <div key={member.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-700 font-bold text-lg flex-shrink-0">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    (member.full_name ?? '?')[0]
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{member.full_name ?? 'Unbekannt'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ROLE_LABELS[member.role] ?? member.role}</p>
                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="text-xs text-brand-600 flex items-center gap-1 mt-1">
                      <Phone size={10} /> {member.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {(!staffMembers || staffMembers.length === 0) && (
        <div className="card p-12 text-center">
          <Users size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Noch keine Teammitglieder eingetragen</p>
        </div>
      )}
    </div>
  )
}
