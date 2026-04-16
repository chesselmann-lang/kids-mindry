import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import ElterngespraechForm from './form'
import AiVorbereitung from './ai-vorbereitung'

export const metadata = { title: 'Elterngespräche' }

export default async function ElterngespraechePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children').select('id, first_name, last_name')
    .eq('site_id', siteId).eq('status', 'active').order('first_name')

  const { data: meetings } = await supabase
    .from('parent_meetings')
    .select('*, children(first_name, last_name), profiles:conducted_by(full_name)')
    .eq('site_id', siteId)
    .order('meeting_date', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Elterngespräche</h1>
          <p className="text-sm text-gray-400">Protokolle & Vereinbarungen</p>
        </div>
      </div>

      <AiVorbereitung children={(children ?? []) as any[]} />
      <ElterngespraechForm children={(children ?? []) as any[]} staffId={user.id} siteId={siteId} />

      {(!meetings || meetings.length === 0) ? (
        <div className="card p-10 text-center">
          <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Gespräche dokumentiert</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(meetings as any[]).map(m => (
            <div key={m.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {m.children?.first_name} {m.children?.last_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(m.meeting_date), 'EEEE, d. MMMM yyyy', { locale: de })}
                    {m.profiles?.full_name ? ` · ${m.profiles.full_name}` : ''}
                  </p>
                </div>
              </div>
              {m.attendees && (
                <p className="text-xs text-gray-500 mb-1.5">👥 {m.attendees}</p>
              )}
              <div className="bg-gray-50 rounded-xl p-3 mb-2">
                <p className="text-xs font-medium text-gray-500 mb-1">Themen</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{m.topics}</p>
              </div>
              {m.agreements && (
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-green-600 mb-1">Vereinbarungen</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{m.agreements}</p>
                </div>
              )}
              {m.next_meeting && (
                <p className="text-xs text-brand-600 mt-2 font-medium">
                  📅 Nächstes Gespräch: {format(new Date(m.next_meeting), 'd. MMM yyyy', { locale: de })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
