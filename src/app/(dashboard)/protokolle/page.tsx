import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, Plus, ChevronRight, Lock } from 'lucide-react'
import AiProtokolleAnalyse from './ai-protokolle-analyse'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Protokolle' }

export default async function ProtokolleListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const { data: protocols } = await supabase
    .from('protocols')
    .select('id, title, meeting_date, published_at, author_id')
    .order('meeting_date', { ascending: false })

  const published = (protocols ?? []).filter((p: any) => p.published_at)
  const drafts    = (protocols ?? []).filter((p: any) => !p.published_at)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Protokolle</h1>
          <p className="text-sm text-gray-500 mt-0.5">Elternabend-Mitschriften</p>
        </div>
        {isAdmin && (
          <Link href="/admin/protokolle/neu" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Neu
          </Link>
        )}
      </div>

      {isStaff && <AiProtokolleAnalyse />}

      {/* Entwürfe (nur Staff) */}
      {isStaff && drafts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            Entwürfe ({drafts.length})
          </p>
          <div className="card overflow-hidden p-0">
            {(drafts as any[]).map((p, idx) => (
              <Link
                key={p.id}
                href={`/protokolle/${p.id}`}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Lock size={15} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-700 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(p.meeting_date + 'T12:00:00'), 'd. MMMM yyyy', { locale: de })}
                    {' · '}Entwurf
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Veröffentlichte Protokolle */}
      <div className="space-y-2">
        {isStaff && published.length > 0 && (
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            Veröffentlicht ({published.length})
          </p>
        )}
        {published.length === 0 && drafts.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Noch keine Protokolle</p>
            {isAdmin && (
              <Link href="/admin/protokolle/neu" className="btn-primary mt-4 inline-flex">
                Erstes Protokoll erstellen
              </Link>
            )}
          </div>
        ) : published.length === 0 ? (
          <div className="card p-10 text-center">
            <FileText size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Noch keine veröffentlichten Protokolle</p>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            {(published as any[]).map((p, idx) => (
              <Link
                key={p.id}
                href={`/protokolle/${p.id}`}
                className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${idx > 0 ? 'border-t border-gray-100' : ''}`}
              >
                <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(p.meeting_date + 'T12:00:00'), 'EEEE, d. MMMM yyyy', { locale: de })}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
