import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Mail, ChevronRight, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import AiNewsletterAnalyse from './ai-newsletter-analyse'
import AiMonatsbrief from './ai-monatsbrief'

export const metadata = { title: 'Newsletter' }

export default async function NewsletterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  // Get newsletters visible to this user
  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('id, title, summary, published_at, group_id, groups(name)')
    .eq('site_id', siteId)
    .order('published_at', { ascending: false })

  // Get read status for current user
  const { data: reads } = await supabase
    .from('newsletter_reads')
    .select('newsletter_id')
    .eq('user_id', user.id)

  const readSet = new Set((reads ?? []).map((r: any) => r.newsletter_id))
  const unreadCount = (newsletters ?? []).filter(n => !readSet.has(n.id)).length

  return (
    <div className="space-y-5">
      {isAdmin && <AiNewsletterAnalyse />}
      {isAdmin && <AiMonatsbrief />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-400">
            {unreadCount > 0 ? `${unreadCount} ungelesen` : 'Alles gelesen'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <Mail size={20} className="text-brand-600" />
        </div>
      </div>

      {(!newsletters || newsletters.length === 0) ? (
        <div className="card p-12 text-center">
          <Mail size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Newsletter vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(newsletters as any[]).map(n => {
            const isRead = readSet.has(n.id)
            return (
              <Link key={n.id} href={`/newsletter/${n.id}`} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isRead ? 'bg-gray-100' : 'bg-brand-100'}`}>
                  {isRead
                    ? <CheckCircle2 size={18} className="text-gray-400" />
                    : <Mail size={18} className="text-brand-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                    {n.title}
                    {!isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-brand-500 align-middle" />}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(n.published_at), 'd. MMMM yyyy', { locale: de })}
                    {n.groups?.name && ` · ${n.groups.name}`}
                  </p>
                  {n.summary && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.summary}</p>
                  )}
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
