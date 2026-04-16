import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarChart2, Plus, Clock, CheckCircle2 } from 'lucide-react'
import AiUmfragenAnalyse from './ai-umfragen-analyse'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Umfragen' }

export default async function UmfragenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const now = new Date().toISOString()

  const { data: polls } = await supabase
    .from('polls')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(30)

  // Get user's votes
  const pollIds = (polls ?? []).map((p: any) => p.id)
  let userVotes: Record<string, number[]> = {}
  if (pollIds.length > 0) {
    const { data: votes } = await supabase
      .from('poll_votes')
      .select('poll_id, option_indexes')
      .eq('user_id', user.id)
      .in('poll_id', pollIds)
    for (const v of votes ?? []) {
      userVotes[(v as any).poll_id] = (v as any).option_indexes
    }
  }

  // Get vote counts per poll
  let voteCounts: Record<string, number> = {}
  if (pollIds.length > 0) {
    const { data: allVotes } = await supabase
      .from('poll_votes')
      .select('poll_id')
      .in('poll_id', pollIds)
    for (const v of allVotes ?? []) {
      const pid = (v as any).poll_id
      voteCounts[pid] = (voteCounts[pid] ?? 0) + 1
    }
  }

  const active = (polls ?? []).filter((p: any) => !p.closes_at || p.closes_at > now)
  const closed = (polls ?? []).filter((p: any) => p.closes_at && p.closes_at <= now)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Umfragen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Beteiligen Sie sich</p>
        </div>
        {isStaff && (
          <Link href="/umfragen/neu" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Neue Umfrage
          </Link>
        )}
      </div>

      {isStaff && <AiUmfragenAnalyse />}

      {/* Active polls */}
      {active.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aktive Umfragen</h2>
          {active.map((poll: any) => {
            const hasVoted = !!userVotes[poll.id]
            const totalVotes = voteCounts[poll.id] ?? 0
            const options: string[] = poll.options ?? []
            const closesAt = poll.closes_at ? new Date(poll.closes_at) : null

            return (
              <Link key={poll.id} href={`/umfragen/${poll.id}`}
                className="card p-5 block hover:shadow-card-hover transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{poll.title}</p>
                    {poll.description && (
                      <p className="text-sm text-gray-500 mt-1">{poll.description}</p>
                    )}
                  </div>
                  {hasVoted && <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400">{options.length} Optionen · {totalVotes} Stimmen</span>
                  {closesAt && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                      <Clock size={11} /> bis {format(closesAt, 'd. MMM', { locale: de })}
                    </span>
                  )}
                  {hasVoted && <span className="text-xs text-green-600 font-medium">Abgestimmt ✓</span>}
                  {!hasVoted && <span className="text-xs text-brand-600 font-medium">Jetzt abstimmen →</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Closed polls */}
      {closed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Abgeschlossene Umfragen</h2>
          {closed.map((poll: any) => {
            const totalVotes = voteCounts[poll.id] ?? 0
            return (
              <Link key={poll.id} href={`/umfragen/${poll.id}`}
                className="card p-4 block hover:shadow-card-hover transition-shadow opacity-70">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-700">{poll.title}</p>
                  <span className="text-xs text-gray-400">{totalVotes} Stimmen</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {(!polls || polls.length === 0) && (
        <div className="card p-12 text-center">
          <BarChart2 size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Noch keine Umfragen</p>
          {isStaff && (
            <Link href="/umfragen/neu" className="btn-primary mt-4 inline-flex">
              Erste Umfrage erstellen
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
