import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import UnfallForm from './unfall-form'
import AiUnfallberichtAnalyse from './ai-unfallbericht-analyse'

export const metadata = { title: 'Unfallberichte' }

const SEVERITY_CONFIG = {
  minor:    { label: 'Leicht',  color: 'bg-yellow-100 text-yellow-700' },
  moderate: { label: 'Mittel',  color: 'bg-orange-100 text-orange-700' },
  serious:  { label: 'Schwer',  color: 'bg-red-100 text-red-700' },
}

export default async function UnfallberichtePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children').select('id, first_name, last_name')
    .eq('site_id', siteId).eq('status', 'active').order('first_name')

  const { data: reports } = await supabase
    .from('incident_reports')
    .select('*, children:child_id(first_name, last_name), profiles:reported_by(full_name)')
    .eq('site_id', siteId)
    .order('occurred_at', { ascending: false })
    .limit(30)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Unfallberichte</h1>
          <p className="text-sm text-gray-400">{(reports ?? []).length} Berichte insgesamt</p>
        </div>
      </div>

      <AiUnfallberichtAnalyse />

      {/* New report */}
      <UnfallForm children={(children ?? []) as any[]} staffId={user.id} siteId={siteId} />

      {/* List */}
      {(!reports || reports.length === 0) ? (
        <div className="card p-10 text-center">
          <AlertTriangle size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Keine Unfallberichte vorhanden</p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Alle Berichte</p>
          <div className="space-y-3">
            {(reports as any[]).map(report => {
              const sev = SEVERITY_CONFIG[report.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.minor
              return (
                <div key={report.id} className="card p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {report.children?.first_name} {report.children?.last_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(report.occurred_at), 'EEEE, d. MMM yyyy · HH:mm', { locale: de })} Uhr
                        {report.location ? ` · ${report.location}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${sev.color}`}>
                      {sev.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
                  {report.first_aid && (
                    <p className="text-xs text-gray-500 mt-2">🩹 {report.first_aid}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {report.parent_notified && (
                      <span className="text-xs text-green-600">✓ Eltern informiert</span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">{report.profiles?.full_name}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
