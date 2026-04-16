import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LifeBuoy, ChevronRight, Clock, CheckCircle2,
  AlertCircle, Loader2, MessageSquare, ArrowLeft,
  User, Tag, Calendar,
} from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import SupportTicketActions from './support-ticket-actions'
import AiSupport from '../../support/ai-support'

export const metadata = { title: 'Support & Hilfe' }

const categoryLabel: Record<string, string> = {
  question: 'Frage',
  bug: 'Fehler',
  feature: 'Funktionswunsch',
  billing: 'Abrechnung',
  other: 'Sonstiges',
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low:    { label: 'Niedrig', color: 'bg-gray-100 text-gray-600' },
  normal: { label: 'Normal',  color: 'bg-blue-100 text-blue-700' },
  high:   { label: 'Hoch',    color: 'bg-orange-100 text-orange-700' },
  urgent: { label: 'Dringend',color: 'bg-red-100 text-red-700' },
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open:        { label: 'Offen',        color: 'bg-yellow-100 text-yellow-700',  icon: Clock },
  in_progress: { label: 'In Bearbeitung',color: 'bg-blue-100 text-blue-700',    icon: Loader2 },
  waiting:     { label: 'Wartet',       color: 'bg-purple-100 text-purple-700', icon: Clock },
  resolved:    { label: 'Gelöst',       color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  closed:      { label: 'Geschlossen',  color: 'bg-gray-100 text-gray-600',     icon: CheckCircle2 },
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; ticket?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) redirect('/feed')

  const siteId = (profile as any)?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const params = await searchParams
  const statusFilter = params.status ?? 'open'
  const ticketId = params.ticket

  // Load tickets
  let query = supabase
    .from('support_tickets')
    .select(`
      *,
      profiles!user_id(full_name, email),
      support_ticket_replies(count)
    `)
    .eq('site_id', siteId)
    .order('updated_at', { ascending: false })

  if (statusFilter !== 'all') {
    if (statusFilter === 'active') {
      query = query.in('status', ['open', 'in_progress', 'waiting'])
    } else {
      query = query.eq('status', statusFilter)
    }
  }

  const { data: tickets } = await query.limit(50)

  // Stats
  const { data: stats } = await supabase
    .from('support_tickets')
    .select('status')
    .eq('site_id', siteId)

  const countByStatus = (stats ?? []).reduce((acc: Record<string, number>, t: any) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  const openCount = (countByStatus.open ?? 0) + (countByStatus.in_progress ?? 0) + (countByStatus.waiting ?? 0)

  // Load selected ticket detail
  let selectedTicket: any = null
  let ticketReplies: any[] = []
  if (ticketId) {
    const { data: t } = await supabase
      .from('support_tickets')
      .select(`*, profiles!user_id(full_name, email)`)
      .eq('id', ticketId)
      .eq('site_id', siteId)
      .single()
    selectedTicket = t

    if (t) {
      const { data: replies } = await supabase
        .from('support_ticket_replies')
        .select(`*, profiles!user_id(full_name, email)`)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
      ticketReplies = replies ?? []
    }
  }

  const filterTabs = [
    { key: 'active', label: `Aktiv (${openCount})` },
    { key: 'resolved', label: `Gelöst (${countByStatus.resolved ?? 0})` },
    { key: 'all', label: 'Alle' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <LifeBuoy size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support & Hilfe</h1>
          <p className="text-sm text-gray-500">Anfragen und Tickets verwalten</p>
        </div>
      </div>

      <AiSupport />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Offen', value: countByStatus.open ?? 0, color: 'text-yellow-600' },
          { label: 'In Bearb.', value: countByStatus.in_progress ?? 0, color: 'text-blue-600' },
          { label: 'Gelöst', value: countByStatus.resolved ?? 0, color: 'text-green-600' },
          { label: 'Gesamt', value: (stats ?? []).length, color: 'text-gray-600' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* New ticket button */}
      <Link
        href="/support/neu"
        className="card p-4 flex items-center gap-3 border-dashed border-2 border-brand-200 hover:border-brand-400 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={16} className="text-brand-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-700">Neues Ticket erstellen</p>
          <p className="text-xs text-gray-400">Technische Frage, Fehler oder Funktionswunsch melden</p>
        </div>
        <ChevronRight size={16} className="text-brand-300" />
      </Link>

      {/* Ticket detail view */}
      {selectedTicket ? (
        <div className="space-y-4">
          <Link
            href={`/admin/support?status=${statusFilter}`}
            className="flex items-center gap-1.5 text-sm text-brand-600 font-medium"
          >
            <ArrowLeft size={14} />
            Zurück zur Übersicht
          </Link>

          <div className="card p-5 space-y-4">
            {/* Ticket header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig[selectedTicket.status]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusConfig[selectedTicket.status]?.label ?? selectedTicket.status}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityConfig[selectedTicket.priority]?.color ?? 'bg-gray-100 text-gray-600'}`}>
                    {priorityConfig[selectedTicket.priority]?.label ?? selectedTicket.priority}
                  </span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                    {categoryLabel[selectedTicket.category] ?? selectedTicket.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h2>
              </div>
            </div>

            {/* Submitter info */}
            <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-50 pt-3">
              <span className="flex items-center gap-1">
                <User size={11} />
                {(selectedTicket as any).profiles?.full_name ?? 'Unbekannt'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {format(new Date(selectedTicket.created_at), "d. MMM yyyy, HH:mm", { locale: de })}
              </span>
            </div>

            {/* Original message */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>
          </div>

          {/* Replies */}
          {ticketReplies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Verlauf</h3>
              {ticketReplies.map((reply: any) => (
                <div key={reply.id} className={`card p-4 ${reply.is_staff_reply ? 'border-l-4 border-brand-400' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">
                      {reply.is_staff_reply ? '🛡️ Support-Team' : ((reply as any).profiles?.full_name ?? 'Nutzer')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(reply.created_at), "d. MMM, HH:mm", { locale: de })}
                    </span>
                  </div>
                  {reply.is_internal && (
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full mb-2 inline-block">
                      Interne Notiz
                    </span>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions: reply, change status */}
          <SupportTicketActions
            ticketId={selectedTicket.id}
            currentStatus={selectedTicket.status}
            siteId={siteId}
            staffId={user.id}
          />
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="flex gap-2">
            {filterTabs.map(tab => (
              <Link
                key={tab.key}
                href={`/admin/support?status=${tab.key}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Ticket list */}
          {!tickets || tickets.length === 0 ? (
            <div className="card p-10 text-center">
              <LifeBuoy size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">Keine Tickets</p>
              <p className="text-xs text-gray-400 mt-1">
                {statusFilter === 'active' ? 'Aktuell keine offenen Anfragen' : 'Keine Einträge in dieser Kategorie'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(tickets as any[]).map((ticket: any) => {
                const sc = statusConfig[ticket.status]
                const pc = priorityConfig[ticket.priority]
                const StatusIcon = sc?.icon ?? Clock
                const replyCount = ticket.support_ticket_replies?.[0]?.count ?? 0

                return (
                  <Link
                    key={ticket.id}
                    href={`/admin/support?status=${statusFilter}&ticket=${ticket.id}`}
                    className="card p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${sc?.color ?? 'bg-gray-100 text-gray-500'}`}>
                      <StatusIcon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
                        {ticket.priority === 'urgent' || ticket.priority === 'high' ? (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${pc?.color}`}>
                            {pc?.label}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{ticket.message}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Tag size={9} />
                          {categoryLabel[ticket.category] ?? ticket.category}
                        </span>
                        {replyCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare size={9} />
                            {replyCount} {replyCount === 1 ? 'Antwort' : 'Antworten'}
                          </span>
                        )}
                        <span>
                          {format(new Date(ticket.created_at), "d. MMM", { locale: de })}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />
                  </Link>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
