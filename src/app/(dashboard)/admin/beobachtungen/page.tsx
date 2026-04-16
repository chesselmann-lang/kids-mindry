import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import BeobachtungForm from './beobachtung-form'
import BeobachtungsAnalyse from './beobachtungs-analyse'

export const metadata = { title: 'Entwicklungsbeobachtungen' }

const DOMAIN_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  general:      { label: 'Allgemein',     color: 'bg-gray-100 text-gray-700',    emoji: '📝' },
  social:       { label: 'Sozial',        color: 'bg-green-100 text-green-700',  emoji: '🤝' },
  language:     { label: 'Sprache',       color: 'bg-blue-100 text-blue-700',    emoji: '💬' },
  motor:        { label: 'Motorik',       color: 'bg-orange-100 text-orange-700',emoji: '🏃' },
  cognitive:    { label: 'Kognitiv',      color: 'bg-purple-100 text-purple-700',emoji: '🧠' },
  creative:     { label: 'Kreativität',   color: 'bg-pink-100 text-pink-700',    emoji: '🎨' },
  emotional:    { label: 'Emotional',     color: 'bg-rose-100 text-rose-700',    emoji: '❤️' },
}

export default async function BeobachtungenPage({
  searchParams
}: { searchParams: { child?: string } }) {
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

  const selectedChildId = searchParams.child ?? ''

  let query = supabase
    .from('observations')
    .select('*, children(first_name, last_name), profiles(full_name)')
    .eq('site_id', siteId)
    .order('observed_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (selectedChildId) query = query.eq('child_id', selectedChildId)

  const { data: observations } = await query

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Beobachtungen</h1>
          <p className="text-sm text-gray-400">Entwicklungsdokumentation</p>
        </div>
      </div>

      {/* New observation */}
      <BeobachtungForm
        children={(children ?? []) as any[]}
        staffId={user.id}
        siteId={siteId}
        preselectedChildId={selectedChildId}
        domainConfig={DOMAIN_CONFIG}
      />

      {/* AI Analysis */}
      {observations && observations.length > 3 && (
        <BeobachtungsAnalyse observationCount={observations.length} />
      )}

      {/* Filter by child */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link href="/admin/beobachtungen"
          className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${!selectedChildId ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
          Alle
        </Link>
        {(children ?? []).map((c: any) => (
          <Link key={c.id} href={`/admin/beobachtungen?child=${c.id}`}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${selectedChildId === c.id ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {c.first_name}
          </Link>
        ))}
      </div>

      {/* Observations list */}
      {(!observations || observations.length === 0) ? (
        <div className="card p-10 text-center">
          <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Beobachtungen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(observations as any[]).map(obs => {
            const dom = DOMAIN_CONFIG[obs.domain] ?? DOMAIN_CONFIG.general
            return (
              <div key={obs.id} className="card p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dom.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {obs.children?.first_name} {obs.children?.last_name}
                        </p>
                        {obs.is_highlight && <span className="text-amber-500">⭐</span>}
                      </div>
                      <p className="text-xs text-gray-400">
                        {format(new Date(obs.observed_at), 'EEE, d. MMM yyyy', { locale: de })}
                        {' · '}{obs.profiles?.full_name ?? 'Unbekannt'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${dom.color}`}>{dom.label}</span>
                    {obs.shared_with_parents && (
                      <span className="text-[10px] bg-brand-50 text-brand-600 px-2 py-0.5 rounded-full font-medium">Geteilt</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{obs.content}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
