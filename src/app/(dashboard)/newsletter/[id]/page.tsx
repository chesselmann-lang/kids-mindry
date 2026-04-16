import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Users } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import ReadTracker from './read-tracker'
import AiNewsletter from './ai-newsletter'

export const metadata = { title: 'Newsletter' }

export default async function NewsletterDetailPage({
  params,
}: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: newsletter } = await supabase
    .from('newsletters')
    .select('*, groups(name), profiles:author_id(full_name)')
    .eq('id', params.id)
    .single()

  if (!newsletter) notFound()

  const { data: readEntry } = await supabase
    .from('newsletter_reads')
    .select('newsletter_id')
    .eq('newsletter_id', params.id)
    .eq('user_id', user.id)
    .maybeSingle()

  // Read count for admins/staff
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  let readCount = 0
  if (isStaff) {
    const { count } = await supabase
      .from('newsletter_reads')
      .select('*', { count: 'exact', head: true })
      .eq('newsletter_id', params.id)
    readCount = count ?? 0
  }

  const n = newsletter as any

  return (
    <>
      <ReadTracker newsletterId={params.id} userId={user.id} alreadyRead={!!readEntry} />
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/newsletter" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{n.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(new Date(n.published_at), 'EEEE, d. MMMM yyyy', { locale: de })}
              {n.profiles?.full_name && ` · ${n.profiles.full_name}`}
            </p>
          </div>
        </div>

        <AiNewsletter newsletterId={params.id} />

        {/* Group badge */}
        {n.groups?.name && (
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full">
              <Users size={12} className="text-brand-600" />
              <span className="text-xs font-medium text-brand-700">{n.groups.name}</span>
            </div>
          </div>
        )}

        {/* Summary */}
        {n.summary && (
          <div className="card p-4 bg-brand-50 border-none">
            <p className="text-sm font-medium text-brand-800">{n.summary}</p>
          </div>
        )}

        {/* Content */}
        <div className="card p-4">
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{n.content}</p>
        </div>

        {/* Attachments placeholder */}
        {n.attachment_url && (
          <a href={n.attachment_url} target="_blank" rel="noopener noreferrer"
            className="card p-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Mail size={14} className="text-gray-500" />
            </div>
            <span className="text-sm text-brand-600 font-medium">Anhang öffnen</span>
          </a>
        )}

        {/* Read count for staff */}
        {isStaff && (
          <p className="text-xs text-gray-400 text-center">
            {readCount} {readCount === 1 ? 'Person hat' : 'Personen haben'} diesen Newsletter gelesen
          </p>
        )}
      </div>
    </>
  )
}
