import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Thermometer } from 'lucide-react'
import AiKrankmeldungenAnalyse from './ai-krankmeldungen-analyse'
import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Krankmeldungen Team' }

const STATUS_CONFIG: Record<string, { label: string; color: string; fn: (id: string) => string }> = {
  pending:  { label: 'Eingereicht', color: 'bg-amber-100 text-amber-700', fn: () => '' },
  noted:    { label: 'Zur Kenntnis', color: 'bg-green-100 text-green-700', fn: () => '' },
  rejected: { label: 'Zurückgewiesen', color: 'bg-red-100 text-red-700', fn: () => '' },
}

export default async function AdminKrankmeldungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date().toISOString().split('T')[0]

  const { data: reports } = await supabase
    .from('sick_reports')
    .select('*, profiles:staff_id(full_name, role)')
    .eq('site_id', siteId)
    .order('start_date', { ascending: false })
    .limit(50)

  const active = (reports ?? []).filter((r: any) => {
    const end = r.end_date ?? r.start_date
    return end >= today && r.start_date <= today
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Krankmeldungen</h1>
          <p className="text-sm text-gray-400">{active.length} aktuell krank</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
          <Thermometer size={20} className="text-red-500" />
        </div>
      </div>

      <AiKrankmeldungenAnalyse />

      {active.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Heute krank</p>
          <div className="space-y-2">
            {active.map((r: any) => (
              <div key={r.id} className="card p-3 border-l-4 border-red-400 flex items-center gap-3">
                <Thermometer size={16} className="text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{r.profiles?.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {format(parseISO(r.start_date), 'd. MMM', { locale: de })}
                    {r.end_date && ` – ${format(parseISO(r.end_date), 'd. MMM yyyy', { locale: de })}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Alle Meldungen</p>
        {(reports ?? []).length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-sm text-gray-400">Keine Krankmeldungen</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(reports ?? []).map((r: any) => {
              const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending
              return (
                <div key={r.id} className="card p-3 flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{r.profiles?.full_name}</p>
                    <p className="text-[10px] text-gray-400">
                      {format(parseISO(r.start_date), 'd. MMM', { locale: de })}
                      {r.end_date && r.end_date !== r.start_date && ` – ${format(parseISO(r.end_date), 'd. MMM', { locale: de })}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
