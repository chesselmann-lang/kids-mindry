import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageCircle, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import NewConversationButton from './new-conversation-button'
import BroadcastButton from './broadcast-button'
import AbwesenheitMeldenButton from './abwesenheit-melden-button'
import AiNachrichtenAnalyse from './ai-nachrichten-analyse'
import AiElternNachricht from './ai-eltern-nachricht'

export const metadata = { title: 'Nachrichten' }

export default async function NachrichtenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  const { data: groups } = isStaff
    ? await supabase.from('groups').select('id, name, color').eq('site_id', siteId).order('name')
    : { data: [] }

  // Kinder für Eltern (für Abwesenheit melden)
  let parentChildren: { id: string; first_name: string; last_name: string }[] = []
  if (!isStaff) {
    const { data: guardians } = await supabase
      .from('guardians')
      .select('child_id, children(id, first_name, last_name)')
      .eq('user_id', user.id)
    parentChildren = (guardians ?? [])
      .filter((g: any) => g.children)
      .map((g: any) => g.children as { id: string; first_name: string; last_name: string })
  }

  // Konversationen des aktuellen Nutzers laden
  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', user.id)

  const conversationIds = (participations ?? []).map(p => p.conversation_id)

  let conversations: ConversationWithMeta[] = []

  if (conversationIds.length > 0) {
    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('updated_at', { ascending: false })

    if (convs && convs.length > 0) {
      // Letzte Nachricht + andere Teilnehmer für jede Konversation laden
      const enriched = await Promise.all(
        convs.map(async (conv) => {
          const [{ data: lastMsg }, { data: parts }] = await Promise.all([
            supabase
              .from('messages')
              .select('body, sender_id, created_at, type')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from('conversation_participants')
              .select('user_id, last_read_at')
              .eq('conversation_id', conv.id),
          ])

          // Ungelesen zählen
          const myParticipation = (participations ?? []).find(p => p.conversation_id === conv.id)
          const lastReadAt = myParticipation?.last_read_at

          let unreadCount = 0
          if (lastReadAt) {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .gt('created_at', lastReadAt)
            unreadCount = count ?? 0
          } else {
            // Noch nie gelesen → alle fremden Nachrichten sind ungelesen
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
            unreadCount = count ?? 0
          }

          // Namen der anderen Teilnehmer
          const otherUserIds = (parts ?? [])
            .map(p => p.user_id)
            .filter(id => id !== user.id)

          let otherNames: string[] = []
          if (otherUserIds.length > 0) {
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, full_name')
              .in('id', otherUserIds)
            otherNames = (profiles ?? []).map(p => p.full_name ?? 'Unbekannt')
          }

          return {
            ...conv,
            lastMessage: lastMsg ?? null,
            unreadCount,
            otherNames,
          }
        })
      )
      conversations = enriched
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nachrichten</h1>
          <p className="text-sm text-gray-500 mt-0.5">Direkte Kommunikation mit dem Kita-Team</p>
        </div>
        <div className="flex items-center gap-2">
          {!isStaff && parentChildren.length > 0 && (
            <AbwesenheitMeldenButton
              currentUserId={user.id}
              children={parentChildren}
              siteId={siteId}
            />
          )}
          {isStaff && groups && groups.length > 0 && (
            <BroadcastButton
              siteId={siteId}
              currentUserId={user.id}
              groups={groups as any[]}
            />
          )}
          <NewConversationButton />
        </div>
      </div>

      {isStaff && <AiNachrichtenAnalyse />}
      {isStaff && <AiElternNachricht />}

      {conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageCircle size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="font-semibold text-gray-700">Noch keine Nachrichten</p>
          <p className="text-sm text-gray-400 mt-1">Starte eine Konversation mit dem Kita-Team</p>
          <NewConversationButton className="mt-6 inline-flex" showLabel />
        </div>
      ) : (
        <div className="divide-y divide-gray-100 card overflow-hidden p-0">
          {conversations.map(conv => (
            <ConversationRow key={conv.id} conv={conv} currentUserId={user.id} />
          ))}
        </div>
      )}
    </div>
  )
}

type ConversationWithMeta = {
  id: string
  subject: string | null
  type: string
  updated_at: string
  lastMessage: { body: string; sender_id: string; created_at: string; type: string } | null
  unreadCount: number
  otherNames: string[]
}

function ConversationRow({ conv, currentUserId }: { conv: ConversationWithMeta; currentUserId: string }) {
  const title = conv.subject ?? conv.otherNames.join(', ') ?? 'Konversation'
  const initials = title.slice(0, 2).toUpperCase()

  const lastMsgPreview = conv.lastMessage
    ? conv.lastMessage.type === 'absence_report'
      ? '🤒 Abwesenheit gemeldet'
      : conv.lastMessage.body.length > 60
        ? conv.lastMessage.body.slice(0, 60) + '…'
        : conv.lastMessage.body
    : 'Noch keine Nachrichten'

  const ago = conv.lastMessage
    ? formatDistanceToNow(new Date(conv.lastMessage.created_at), { locale: de, addSuffix: true })
    : ''

  const isFromMe = conv.lastMessage?.sender_id === currentUserId

  return (
    <Link
      href={`/nachrichten/${conv.id}`}
      className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
            {title}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0">{ago}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
            {isFromMe && <span className="text-gray-400">Du: </span>}
            {lastMsgPreview}
          </p>
          {conv.unreadCount > 0 && (
            <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">
              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
    </Link>
  )
}
