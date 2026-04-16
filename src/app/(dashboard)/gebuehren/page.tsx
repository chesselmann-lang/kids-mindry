import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Euro, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import AiGebuehren from './ai-gebuehren'

export const metadata = { title: 'Gebühren' }

const STATUS_CONFIG = {
  paid:    { label: 'Bezahlt',   icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  unpaid:  { label: 'Offen',     icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50' },
  overdue: { label: 'Überfällig', icon: AlertCircle, color: 'text-red-600',   bg: 'bg-red-50' },
}

export default async function GebuehrenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (isStaff) redirect('/admin/gebuehren')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Get parent's children
  const { data: guardianships } = await supabase
    .from('guardians')
    .select('child_id, children(id, first_name, last_name)')
    .eq('user_id', user.id)

  const childIds = (guardianships ?? []).map((g: any) => g.child_id)

  const { data: fees } = childIds.length > 0
    ? await supabase
        .from('fees')
        .select('*, children(first_name, last_name)')
        .in('child_id', childIds)
        .order('period_month', { ascending: false })
    : { data: [] }

  const totalOpen = (fees ?? [])
    .filter((f: any) => f.status !== 'paid')
    .reduce((sum: number, f: any) => sum + (f.amount ?? 0), 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gebühren</h1>
          <p className="text-sm text-gray-400">Ihre Beitragsnachweise</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
          <Euro size={20} className="text-green-600" />
        </div>
      </div>

      <AiGebuehren />

      {totalOpen > 0 && (
        <div className="card p-4 bg-amber-50 border-none flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Offener Betrag: {totalOpen.toFixed(2)} €</p>
            <p className="text-xs text-amber-600">Bitte begleichen Sie die ausstehenden Beiträge</p>
          </div>
        </div>
      )}

      {(!fees || fees.length === 0) ? (
        <div className="card p-10 text-center">
          <Euro size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Keine Gebührennachweise vorhanden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(fees as any[]).map(fee => {
            const status = STATUS_CONFIG[fee.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.unpaid
            const StatusIcon = status.icon
            return (
              <div key={fee.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {fee.children?.first_name} {fee.children?.last_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {format(parseISO(fee.period_month), 'MMMM yyyy', { locale: de })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{Number(fee.amount).toFixed(2)} €</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-1 ${status.bg}`}>
                      <StatusIcon size={10} className={status.color} />
                      <span className={`text-[10px] font-semibold ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                </div>
                {fee.due_date && fee.status !== 'paid' && (
                  <p className="text-xs text-gray-400 mt-2">
                    Fällig: {format(parseISO(fee.due_date), 'd. MMMM yyyy', { locale: de })}
                  </p>
                )}
                {fee.paid_at && (
                  <p className="text-xs text-green-600 mt-1">
                    Bezahlt am {format(new Date(fee.paid_at), 'd. MMM yyyy', { locale: de })}
                  </p>
                )}
                {fee.notes && <p className="text-xs text-gray-500 mt-1">{fee.notes}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
