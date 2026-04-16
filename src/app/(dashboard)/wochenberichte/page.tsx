import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, ChevronRight, Plus } from 'lucide-react'
import AiWochenberichteZusammenfassung from './ai-wochenberichte-zusammenfassung'
import AiWochenberichtEntwurf from './ai-wochenbericht-entwurf'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Wochenberichte' }

export default async function WochenberichtePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  let query = supabase
    .from('weekly_reports')
    .select('id, title, week_start, summary, group_id, groups(name, color), profiles:author_id(full_name), photo_urls')
    .eq('site_id', siteId)
    .order('week_start', { ascending: false })
    .limit(30)

  // For parents: only show reports for their children's groups
  if (!isStaff) {
    const { data: g } = await supabase
      .from('guardians')
      .select('children(group_id)')
      .eq('user_id', user.id)
    const groupIds = (g ?? []).map((x: any) => x.children?.group_id).filter(Boolean)
    if (groupIds.length > 0) {
      query = query.or(`group_id.is.null,group_id.in.(${groupIds.join(',')})`)
    }
  }

  const { data: reports } = await query

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Wochenberichte</h1>
          <p className="text-sm text-gray-400">Rückblick auf die Kita-Woche</p>
        </div>
        {isStaff && (
          <Link href="/admin/wochenberichte" className="btn-primary flex items-center gap-2 py-2 px-3 text-sm">
            <Plus size={16} /> Neu
          </Link>
        )}
      </div>

      {isStaff && <AiWochenberichteZusammenfassung />}
      {isStaff && <AiWochenberichtEntwurf />}

      {(!reports || reports.length === 0) ? (
        <div className="card p-10 text-center">
          <BookOpen size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Wochenberichte vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(reports as any[]).map(r => (
            <Link key={r.id} href={`/wochenberichte/${r.id}`}
              className="card p-4 block hover:shadow-card-hover transition-shadow">
              <div className="flex items-start gap-3">
                {/* Photo or icon */}
                {r.photo_urls?.[0] ? (
                  <img src={r.photo_urls[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: r.groups?.color ? r.groups.color + '20' : '#EEF2FF' }}>
                    <BookOpen size={22} className="text-brand-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    KW {format(parseISO(r.week_start), 'w', { locale: de })}
                    {' · '}{format(parseISO(r.week_start), 'd. MMM', { locale: de })}
                    {r.groups?.name && ` · ${r.groups.name}`}
                  </p>
                  {r.summary && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.summary}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
