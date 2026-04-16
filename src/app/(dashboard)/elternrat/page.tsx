import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Phone, Mail, Settings } from 'lucide-react'
import AiElternratAnalyse from './ai-elternrat-analyse'

export const metadata = { title: 'Elternrat' }

const POSITIONS: Record<string, string> = {
  chair:     'Vorsitzende/r',
  deputy:    'Stellvertretung',
  treasurer: 'Kassenwart/in',
  member:    'Beisitzer/in',
}

export default async function ElternratPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: members } = await supabase
    .from('council_members')
    .select('*, profiles:user_id(full_name, phone, email)')
    .eq('site_id', siteId)
    .order('position_order')

  const { data: meetings } = await supabase
    .from('council_meetings')
    .select('id, meeting_date, title, summary')
    .eq('site_id', siteId)
    .order('meeting_date', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Elternrat</h1>
          <p className="text-sm text-gray-400">Gewählte Elternvertreter</p>
        </div>
        {isAdmin && (
          <Link href="/admin/elternrat" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Settings size={20} className="text-gray-500" />
          </Link>
        )}
      </div>

      <AiElternratAnalyse />

      {/* Council members */}
      {(!members || members.length === 0) ? (
        <div className="card p-10 text-center">
          <Users size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Mitglieder eingetragen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(members as any[]).map(m => (
            <div key={m.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold text-brand-700">
                  {m.profiles?.full_name?.[0] ?? '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{m.profiles?.full_name}</p>
                <p className="text-xs text-brand-600 font-medium mt-0.5">
                  {POSITIONS[m.position] ?? m.position}
                </p>
                {m.notes && <p className="text-xs text-gray-400 mt-0.5">{m.notes}</p>}
              </div>
              <div className="flex flex-col gap-1">
                {m.profiles?.phone && (
                  <a href={`tel:${m.profiles.phone}`} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Phone size={14} className="text-gray-500" />
                  </a>
                )}
                {m.profiles?.email && (
                  <a href={`mailto:${m.profiles.email}`} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Mail size={14} className="text-gray-500" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent meeting summaries */}
      {meetings && meetings.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Letzte Sitzungen</p>
          <div className="space-y-3">
            {(meetings as any[]).map(m => (
              <div key={m.id} className="border-l-2 border-brand-200 pl-3">
                <p className="text-xs font-medium text-gray-700">{m.title}</p>
                <p className="text-xs text-gray-400">{new Date(m.meeting_date).toLocaleDateString('de-DE')}</p>
                {m.summary && <p className="text-xs text-gray-500 mt-0.5">{m.summary}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
