import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LifeBuoy, ChevronRight, Plus, Clock, CheckCircle2, Loader2, MessageSquare
} from 'lucide-react'
import AiSupport from './ai-support'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

export const metadata = { title: 'Support & Hilfe' }

const statusConfig: Record<string, { label: string; color: string }> = {
  open:        { label: 'Offen',         color: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'In Bearbeitung',color: 'bg-blue-100 text-blue-700' },
  waiting:     { label: 'Wartet',        color: 'bg-purple-100 text-purple-700' },
  resolved:    { label: 'Gelöst',        color: 'bg-green-100 text-green-700' },
  closed:      { label: 'Geschlossen',   color: 'bg-gray-100 text-gray-500' },
}

const categoryLabel: Record<string, string> = {
  question: '❓ Frage',
  bug: '🐛 Fehler',
  feature: '💡 Funktionswunsch',
  billing: '💳 Abrechnung',
  other: '📝 Sonstiges',
}

export default async function SupportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()

  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  // Redirect admins to admin support view
  if (isAdmin) redirect('/admin/support')

  // Load this user's tickets
  const { data: tickets } = await supabase
    .from('support_tickets')
    .select(`*, support_ticket_replies(count)`)
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <LifeBuoy size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support & Hilfe</h1>
            <p className="text-sm text-gray-500">Fragen & Anfragen an die Kita</p>
          </div>
        </div>
        <Link
          href="/support/neu"
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
        >
          <Plus size={15} />
          Neue Anfrage
        </Link>
      </div>

      <AiSupport />

      {/* FAQ shortcuts */}
      <div className="card p-4 space-y-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Schnellhilfe</h2>
        {[
          { question: 'Wie melde ich mein Kind krank?', href: '/abwesenheit-melden' },
          { question: 'Wie ändere ich meine Benachrichtigungen?', href: '/benachrichtigungen/einstellungen' },
          { question: 'Wo finde ich das Kita-Handbuch?', href: '/handbuch' },
          { question: 'Wie bearbeite ich mein Profil?', href: '/profil' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:text-brand-600 transition-colors">
            <span className="text-sm text-gray-700">{item.question}</span>
            <ChevronRight size={14} className="text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Ticket list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Meine Anfragen</h2>
        </div>

        {!tickets || tickets.length === 0 ? (
          <div className="card p-10 text-center">
            <MessageSquare size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 text-sm">Noch keine Anfragen</p>
            <p className="text-xs text-gray-400 mt-1">Bei Fragen oder Problemen einfach eine Anfrage stellen</p>
            <Link
              href="/support/neu"
              className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              <Plus size={14} />
              Jetzt Anfrage stellen
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {(tickets as any[]).map(ticket => {
              const sc = statusConfig[ticket.status]
              const replyCount = ticket.support_ticket_replies?.[0]?.count ?? 0

              return (
                <div key={ticket.id} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{categoryLabel[ticket.category] ?? ticket.category}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${sc?.color ?? 'bg-gray-100 text-gray-500'}`}>
                      {sc?.label ?? ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span>{format(new Date(ticket.created_at), "d. MMM yyyy", { locale: de })}</span>
                    {replyCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare size={9} />
                        {replyCount} {replyCount === 1 ? 'Antwort' : 'Antworten'}
                      </span>
                    )}
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
