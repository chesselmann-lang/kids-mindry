import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import LoeschanfrageActions from './loeschanfrage-actions'
import AiLoeschanfragen from './ai-loeschanfragen'

export const metadata = { title: 'DSGVO Löschanfragen | Admin' }

export default async function LoeschanfragenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') redirect('/feed')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Get all deletion requests for users of this site
  const { data: requests } = await (supabase as any)
    .from('deletion_requests')
    .select(`
      id, reason, status, scheduled_deletion_at, completed_at, rejection_reason, created_at,
      profiles:user_id(full_name, email)
    `)
    .order('created_at', { ascending: false })

  const reqs = (requests ?? []) as any[]
  const pending = reqs.filter(r => r.status === 'pending')
  const completed = reqs.filter(r => r.status === 'completed' || r.status === 'rejected')

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/admin/datenschutz" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Datenlöschanfragen</h1>
          <p className="text-sm text-gray-400">DSGVO Art. 17 – Recht auf Löschung</p>
        </div>
      </div>

      <AiLoeschanfragen />

      {/* Legal info */}
      <div className="flex gap-3 p-4 bg-amber-50 rounded-2xl text-xs text-amber-800">
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
        <span>
          Gemäß Art. 17 DSGVO haben betroffene Personen das Recht, die Löschung ihrer personenbezogenen Daten
          zu verlangen. Anfragen müssen innerhalb von 30 Tagen bearbeitet werden. Nach Bestätigung werden
          Profildaten anonymisiert und Verbindungen zu Kindern getrennt.
        </span>
      </div>

      {/* Pending requests */}
      {pending.length > 0 ? (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Clock size={12} />
            Offene Anfragen ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((req: any) => (
              <div key={req.id} className="card p-4 border-l-4 border-amber-400">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {req.profiles?.full_name ?? req.profiles?.email ?? 'Unbekannt'}
                    </p>
                    <p className="text-xs text-gray-400">{req.profiles?.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Eingegangen: {format(new Date(req.created_at), 'd. MMMM yyyy', { locale: de })}
                    </p>
                    {req.scheduled_deletion_at && (
                      <p className="text-xs text-amber-600 font-medium mt-0.5">
                        Automatische Löschung: {format(new Date(req.scheduled_deletion_at), 'd. MMMM yyyy', { locale: de })}
                      </p>
                    )}
                  </div>
                  <span className="badge bg-amber-50 text-amber-700 flex-shrink-0">Ausstehend</span>
                </div>

                {req.reason && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Begründung</p>
                    <p className="text-xs text-gray-700">{req.reason}</p>
                  </div>
                )}

                <LoeschanfrageActions requestId={req.id} userName={req.profiles?.full_name ?? req.profiles?.email ?? 'Nutzer'} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <CheckCircle2 size={36} className="text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">Keine offenen Löschanfragen</p>
        </div>
      )}

      {/* Completed requests */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Abgeschlossen ({completed.length})
          </h2>
          <div className="card overflow-hidden p-0">
            {completed.map((req: any, idx: number) => (
              <div key={req.id} className={`px-4 py-3 flex items-center justify-between gap-3 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {req.profiles?.full_name ?? req.profiles?.email ?? 'Unbekannt'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {req.status === 'completed' ? 'Gelöscht' : 'Abgelehnt'} ·{' '}
                    {req.completed_at ? format(new Date(req.completed_at), 'd. MMM yyyy', { locale: de }) : ''}
                  </p>
                </div>
                {req.status === 'completed'
                  ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  : <XCircle size={16} className="text-gray-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {reqs.length === 0 && (
        <div className="card p-8 text-center">
          <Trash2 size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Noch keine Löschanfragen eingegangen</p>
        </div>
      )}
    </div>
  )
}
