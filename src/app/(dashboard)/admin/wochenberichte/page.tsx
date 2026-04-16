import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WochenberichtForm from './wochenbericht-form'
import AiWochenberichtEntwurf from './ai-wochenbericht-entwurf'

export const metadata = { title: 'Wochenbericht erstellen' }

export default async function AdminWochenberichtePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: groups } = await supabase
    .from('groups').select('id, name').eq('site_id', siteId).order('name')

  const { data: reports } = await supabase
    .from('weekly_reports')
    .select('id, title, week_start, groups(name)')
    .eq('site_id', siteId)
    .order('week_start', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/wochenberichte" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Wochenberichte</h1>
          <p className="text-sm text-gray-400">Erstellen & verwalten</p>
        </div>
      </div>

      <AiWochenberichtEntwurf />

      <WochenberichtForm siteId={siteId} staffId={user.id} groups={(groups ?? []) as any[]} />

      {reports && reports.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bisherige Berichte</p>
          {(reports as any[]).map(r => (
            <Link key={r.id} href={`/wochenberichte/${r.id}`}
              className="card p-3 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{r.title}</p>
                <p className="text-xs text-gray-400">{new Date(r.week_start).toLocaleDateString('de-DE')}
                  {r.groups?.name && ` · ${r.groups.name}`}</p>
              </div>
              <span className="text-xs text-gray-400">›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
