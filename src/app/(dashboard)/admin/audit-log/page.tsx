import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Activity, Shield, Download, LogIn, Trash2, Edit3, Plus } from 'lucide-react'
import AiAuditAnalyse from './ai-audit-analyse'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Audit-Log' }

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  create:       { label: 'Erstellt',    color: 'text-green-700',  bg: 'bg-green-100',  icon: Plus },
  update:       { label: 'Geändert',    color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Edit3 },
  delete:       { label: 'Gelöscht',    color: 'text-red-700',    bg: 'bg-red-100',    icon: Trash2 },
  login:        { label: 'Anmeldung',   color: 'text-gray-700',   bg: 'bg-gray-100',   icon: LogIn },
  dsgvo_export: { label: 'Datenexport', color: 'text-purple-700', bg: 'bg-purple-100', icon: Download },
  consent:      { label: 'Einwilligung', color: 'text-teal-700',  bg: 'bg-teal-100',   icon: Shield },
}

const TABLE_LABELS: Record<string, string> = {
  children: 'Kind',
  profiles: 'Profil',
  attendance: 'Anwesenheit',
  daily_reports: 'Tagesbericht',
  groups: 'Gruppe',
  medication_logs: 'Medikament',
  incident_reports: 'Unfall',
  parent_meetings: 'Elterngespräch',
  fees: 'Gebühr',
}

export default async function AuditLogPage({
  searchParams,
}: { searchParams: { page?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const page = parseInt(searchParams.page ?? '1')
  const pageSize = 50
  const offset = (page - 1) * pageSize

  const { data: logs, count } = await supabase
    .from('audit_logs')
    .select('*, profiles:user_id(full_name, role)', { count: 'exact' })
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit-Log</h1>
          <p className="text-sm text-gray-400">{count ?? 0} Einträge · Seite {page}/{totalPages || 1}</p>
        </div>
      </div>

      <AiAuditAnalyse />

      {(!logs || logs.length === 0) ? (
        <div className="card p-10 text-center">
          <Activity size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Noch keine Einträge vorhanden</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(logs as any[]).map(log => {
            const action = ACTION_CONFIG[log.action] ?? ACTION_CONFIG.update
            const ActionIcon = action.icon
            const tableLabel = TABLE_LABELS[log.table_name] ?? log.table_name
            return (
              <div key={log.id} className="card p-3 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${action.bg}`}>
                  <ActionIcon size={14} className={action.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${action.bg} ${action.color}`}>
                      {action.label}
                    </span>
                    <span className="text-xs font-medium text-gray-700">{tableLabel}</span>
                    {log.profiles?.full_name && (
                      <span className="text-xs text-gray-400">· {log.profiles.full_name}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    {log.record_id && ` · ID: ${log.record_id.slice(0, 8)}…`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          {page > 1
            ? <Link href={`/admin/audit-log?page=${page - 1}`} className="text-sm text-brand-600 font-medium">‹ Zurück</Link>
            : <div />}
          {page < totalPages
            ? <Link href={`/admin/audit-log?page=${page + 1}`} className="text-sm text-brand-600 font-medium">Weiter ›</Link>
            : <div />}
        </div>
      )}
    </div>
  )
}
