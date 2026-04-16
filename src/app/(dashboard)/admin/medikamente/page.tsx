import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pill, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import MedikamentForm from './medikament-form'
import AiMedikamenteAnalyse from './ai-medikamente-analyse'

export const metadata = { title: 'Medikamentengabe' }

export default async function MedikamentePage() {
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

  // Last 30 days logs
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: logs } = await supabase
    .from('medication_logs')
    .select('*, children(first_name, last_name), profiles(full_name)')
    .eq('site_id', siteId)
    .gte('administered_at', thirtyDaysAgo.toISOString())
    .order('administered_at', { ascending: false })
    .limit(50)

  const childMap = Object.fromEntries((children ?? []).map(c => [c.id, c]))

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Medikamentengabe</h1>
          <p className="text-sm text-gray-400">Protokoll der letzten 30 Tage</p>
        </div>
      </div>

      <AiMedikamenteAnalyse />

      {/* New entry form */}
      <MedikamentForm
        children={(children ?? []) as any[]}
        staffId={user.id}
        staffName={(profile as any)?.full_name ?? ''}
        siteId={siteId}
      />

      {/* Log list */}
      {(!logs || logs.length === 0) ? (
        <div className="card p-10 text-center">
          <Pill size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Einträge</p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Protokoll</p>
          <div className="card overflow-hidden p-0">
            {(logs as any[]).map((log, idx) => (
              <div key={log.id} className={`px-4 py-3.5 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Pill size={14} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {log.children?.first_name} {log.children?.last_name}
                      </p>
                      <p className="text-sm text-gray-700">{log.medication_name} · {log.dosage}</p>
                      {log.notes && <p className="text-xs text-gray-400 mt-0.5 italic">{log.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {format(new Date(log.administered_at), 'd. MMM HH:mm', { locale: de })}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{log.profiles?.full_name ?? 'Unbekannt'}</p>
                    {log.parent_consent && (
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Einwilligung</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
