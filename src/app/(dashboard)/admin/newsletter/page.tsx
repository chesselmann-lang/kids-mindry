import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Users, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import NewsletterForm from './newsletter-form'
import AiNewsletterAnalyse from './ai-newsletter-analyse'

export const metadata = { title: 'Newsletter verwalten' }

export default async function AdminNewsletterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: groups } = await supabase
    .from('groups').select('id, name').eq('site_id', siteId).order('name')

  const { data: newsletters } = await supabase
    .from('newsletters')
    .select('*, groups(name), profiles:author_id(full_name)')
    .eq('site_id', siteId)
    .order('published_at', { ascending: false })

  // Read counts per newsletter
  const newsletterIds = (newsletters ?? []).map((n: any) => n.id)
  const { data: reads } = newsletterIds.length > 0
    ? await supabase.from('newsletter_reads').select('newsletter_id').in('newsletter_id', newsletterIds)
    : { data: [] }

  const readCountMap: Record<string, number> = {}
  for (const r of reads ?? []) {
    readCountMap[(r as any).newsletter_id] = (readCountMap[(r as any).newsletter_id] ?? 0) + 1
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-400">Eltern informieren</p>
        </div>
      </div>

      <AiNewsletterAnalyse />

      <NewsletterForm staffId={user.id} siteId={siteId} groups={(groups ?? []) as any[]} />

      {(!newsletters || newsletters.length === 0) ? (
        <div className="card p-10 text-center">
          <Mail size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Newsletter erstellt</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(newsletters as any[]).map(n => (
            <div key={n.id} className="card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {format(new Date(n.published_at), 'd. MMM yyyy', { locale: de })}
                    {n.profiles?.full_name && ` · ${n.profiles.full_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Eye size={12} />
                  <span>{readCountMap[n.id] ?? 0}</span>
                </div>
              </div>
              {n.summary && <p className="text-xs text-gray-500 mb-2">{n.summary}</p>}
              {n.groups?.name && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 rounded-full">
                  <Users size={10} className="text-brand-600" />
                  <span className="text-[10px] font-medium text-brand-700">{n.groups.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
