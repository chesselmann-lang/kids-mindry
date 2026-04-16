import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, MessageCircle, CalendarDays, Info, CheckCircle2, ChevronRight, Settings } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import Link from 'next/link'
import MarkAllRead from './mark-all-read'
import AiBenachrichtigungen from './ai-benachrichtigungen'

export const metadata = { title: 'Benachrichtigungen' }

const typeIcons: Record<string, React.ElementType> = {
  message:      MessageCircle,
  announcement: Info,
  event:        CalendarDays,
  default:      Bell,
}

const typeColors: Record<string, string> = {
  message:      'bg-blue-100 text-blue-600',
  announcement: 'bg-brand-100 text-brand-600',
  event:        'bg-purple-100 text-purple-600',
  default:      'bg-gray-100 text-gray-500',
}

export default async function BenachrichtigungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Mark all as read when visiting the page
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unread = (notifications ?? []).filter(n => !n.read_at).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benachrichtigungen</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unread > 0 ? `${unread} ungelesene` : 'Alle gelesen'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notifications && notifications.length > 0 && (
            <MarkAllRead userId={user.id} />
          )}
          <Link href="/benachrichtigungen/einstellungen" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Settings size={18} className="text-gray-500" />
          </Link>
        </div>
      </div>

      <AiBenachrichtigungen />

      {!notifications || notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-600">Keine Benachrichtigungen</p>
          <p className="text-sm text-gray-400 mt-1">Neue Nachrichten und Updates erscheinen hier</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(notifications as any[]).map((n, idx) => {
            const Icon = typeIcons[n.type] ?? typeIcons.default
            const iconColor = typeColors[n.type] ?? typeColors.default
            const isUnread = !n.read_at
            const ago = formatDistanceToNow(new Date(n.created_at), { locale: de, addSuffix: true })

            const url = (n.data as any)?.url ?? null
            const inner = (
              <div className={`flex items-start gap-4 px-5 py-4 ${idx > 0 ? 'border-t border-gray-50' : ''} ${isUnread ? 'bg-brand-50/30' : ''} ${url ? 'hover:bg-gray-50 transition-colors' : ''}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{ago}</p>
                </div>
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                )}
                {!isUnread && !url && (
                  <CheckCircle2 size={16} className="text-gray-200 mt-1 flex-shrink-0" />
                )}
                {url && (
                  <ChevronRight size={16} className="text-gray-300 mt-1 flex-shrink-0" />
                )}
              </div>
            )

            return url
              ? <Link key={n.id} href={url}>{inner}</Link>
              : <div key={n.id}>{inner}</div>
          })}
        </div>
      )}
    </div>
  )
}
