import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit3, Send, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import AiProtokoll from './ai-protokoll'

export default async function ProtokollDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  const { data: protocol } = await supabase
    .from('protocols')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!protocol) notFound()

  // Parents can only see published
  const p = protocol as any
  if (!isStaff && !p.published_at) redirect('/protokolle')

  const meetingDate = new Date(p.meeting_date + 'T12:00:00')
  const isDraft = !p.published_at

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link href="/protokolle" className="text-xs text-brand-600 mb-2 flex items-center gap-1">
          <ArrowLeft size={12} /> Protokolle
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isDraft && (
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Entwurf
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{p.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {format(meetingDate, 'EEEE, d. MMMM yyyy', { locale: de })}
            </p>
          </div>
          {isAdmin && (
            <Link
              href={`/admin/protokolle/neu?id=${p.id}`}
              className="btn-secondary text-sm px-3 py-2 flex items-center gap-1.5 flex-shrink-0"
            >
              <Edit3 size={14} /> Bearbeiten
            </Link>
          )}
        </div>
      </div>

      <AiProtokoll protocolId={params.id} />

      {/* Content */}
      <div className="card p-6">
        {p.content ? (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {p.content}
          </div>
        ) : (
          <p className="text-gray-400 text-sm italic">Kein Inhalt vorhanden.</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <FileText size={12} />
        {p.published_at
          ? `Veröffentlicht am ${format(new Date(p.published_at), 'd. MMMM yyyy', { locale: de })}`
          : 'Entwurf – noch nicht veröffentlicht'
        }
      </div>
    </div>
  )
}
