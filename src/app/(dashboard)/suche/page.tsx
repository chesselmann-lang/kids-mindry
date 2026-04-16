import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Search, Baby, Megaphone, FileText, FolderOpen, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Suspense } from 'react'
import SearchInput from './search-input'
import AiSuche from './ai-suche'

export const metadata = { title: 'Suche' }

export default async function SuchePage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const q = (searchParams.q ?? '').trim()

  let children: any[] = []
  let announcements: any[] = []
  let protocols: any[] = []
  let documents: any[] = []
  let events: any[] = []

  if (q.length >= 2) {
    const search = `%${q}%`

    const [childRes, annRes, protRes, docRes, evRes] = await Promise.all([
      // Children — staff only
      isStaff
        ? supabase.from('children')
            .select('id, first_name, last_name, date_of_birth, groups(name, color)')
            .eq('site_id', siteId).eq('status', 'active')
            .or(`first_name.ilike.${search},last_name.ilike.${search}`)
            .limit(8)
        : Promise.resolve({ data: [] }),

      // Announcements
      supabase.from('announcements')
        .select('id, title, body, type, published_at')
        .eq('site_id', siteId)
        .not('published_at', 'is', null)
        .or(`title.ilike.${search},body.ilike.${search}`)
        .order('published_at', { ascending: false }).limit(5),

      // Protocols
      supabase.from('protocols')
        .select('id, title, meeting_date, published_at')
        .eq('site_id', siteId)
        .not('published_at', 'is', null)
        .ilike('title', search)
        .order('meeting_date', { ascending: false }).limit(5),

      // Documents
      supabase.from('kita_documents')
        .select('id, title, description, category, file_name')
        .eq('site_id', siteId)
        .or(`title.ilike.${search},description.ilike.${search},file_name.ilike.${search}`)
        .limit(5),

      // Events
      supabase.from('events')
        .select('id, title, start_date, start_time, all_day, type')
        .eq('site_id', siteId)
        .or(`title.ilike.${search},description.ilike.${search},location.ilike.${search}`)
        .order('start_date', { ascending: false }).limit(5),
    ])

    children = childRes.data ?? []
    announcements = annRes.data ?? []
    protocols = protRes.data ?? []
    documents = docRes.data ?? []
    events = evRes.data ?? []
  }

  const totalResults = children.length + announcements.length + protocols.length + documents.length + events.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suche</h1>
      </div>

      {/* Search input — debounced client component */}
      <Suspense fallback={
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <div className="w-full pl-10 py-3 rounded-xl border border-gray-200 bg-white h-[46px]" />
        </div>
      }>
        <SearchInput />
      </Suspense>

      {!q && <AiSuche />}

      {q.length > 0 && q.length < 2 && (
        <p className="text-sm text-gray-400 text-center">Mindestens 2 Zeichen eingeben</p>
      )}

      {q.length >= 2 && totalResults === 0 && (
        <div className="card p-10 text-center">
          <Search size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">Keine Ergebnisse für „{q}"</p>
          <p className="text-sm text-gray-400 mt-1">Versuche einen anderen Suchbegriff</p>
        </div>
      )}

      {/* Children */}
      {children.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Baby size={13} /> Kinder ({children.length})
          </h2>
          <div className="card overflow-hidden p-0">
            {children.map((c: any, idx: number) => {
              const age = c.date_of_birth
                ? Math.floor((Date.now() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
                : null
              return (
                <Link key={c.id} href={`/kinder/${c.id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: c.groups?.color ?? '#3B6CE8' }}>
                    {c.first_name[0]}{c.last_name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-400">
                      {age !== null ? `${age} Jahre` : ''}{c.groups ? ` · ${c.groups.name}` : ''}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Megaphone size={13} /> Ankündigungen ({announcements.length})
          </h2>
          <div className="card overflow-hidden p-0">
            {announcements.map((a: any, idx: number) => (
              <Link key={a.id} href="/feed"
                className={`flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{a.body}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {format(new Date(a.published_at), 'd. MMM', { locale: de })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarDays size={13} /> Termine ({events.length})
          </h2>
          <div className="card overflow-hidden p-0">
            {events.map((e: any, idx: number) => (
              <Link key={e.id} href={`/kalender/${e.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={15} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{e.title}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(e.start_date + 'T12:00:00'), 'd. MMM yyyy', { locale: de })}
                    {!e.all_day && e.start_time ? ` · ${e.start_time.slice(0, 5)}` : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Protocols */}
      {protocols.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText size={13} /> Protokolle ({protocols.length})
          </h2>
          <div className="card overflow-hidden p-0">
            {protocols.map((p: any, idx: number) => (
              <Link key={p.id} href={`/protokolle/${p.id}`}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <FileText size={16} className="text-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(p.meeting_date + 'T12:00:00'), 'd. MMMM yyyy', { locale: de })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FolderOpen size={13} /> Dokumente ({documents.length})
          </h2>
          <div className="card overflow-hidden p-0">
            {documents.map((d: any, idx: number) => (
              <Link key={d.id} href="/dokumente"
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <FolderOpen size={16} className="text-gray-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{d.title}</p>
                  <p className="text-xs text-gray-400">{d.category} · {d.file_name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
