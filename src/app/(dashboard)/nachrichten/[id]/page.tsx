import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MessageList from './message-list'
import MessageInput from './message-input'
import type { Message } from '@/types/database'
import AiNachrichten from './ai-nachrichten'

export const metadata = { title: 'Nachricht' }

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase as any).from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes(profile?.role ?? '')
  const senderName: string = profile?.full_name ?? ''

  // Prüfen ob Nutzer Teilnehmer ist
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('last_read_at')
    .eq('conversation_id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!participation) return notFound()

  // Konversation laden
  const { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!conv) return notFound()

  // Andere Teilnehmer
  const { data: parts } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', params.id)
    .neq('user_id', user.id)

  const otherUserIds = (parts ?? []).map(p => p.user_id)
  let otherNames: string[] = []
  if (otherUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', otherUserIds)
    otherNames = (profiles ?? []).map(p => p.full_name ?? 'Unbekannt')
  }

  // Nachrichten laden (letzte 100)
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })
    .limit(100)

  // Sender-Profile für Anzeige holen
  const senderIds = [...new Set((messages ?? []).map(m => m.sender_id))]
  let senderProfiles: Record<string, string> = {}
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', senderIds)
    senderProfiles = Object.fromEntries((profiles ?? []).map(p => [p.id, p.full_name ?? 'Unbekannt']))
  }

  // Als gelesen markieren
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', params.id)
    .eq('user_id', user.id)

  const title = conv.subject ?? otherNames.join(', ') ?? 'Konversation'

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <Link href="/nachrichten" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-900 truncate">{title}</h1>
          {otherNames.length > 0 && (
            <p className="text-xs text-gray-400">{otherNames.join(', ')}</p>
          )}
        </div>
      </div>

      {/* AI Zusammenfassung */}
      <div className="flex-shrink-0 pb-2">
        <AiNachrichten conversationId={params.id} />
      </div>

      {/* Nachrichten */}
      <MessageList
        initialMessages={(messages ?? []) as Message[]}
        conversationId={params.id}
        currentUserId={user.id}
        senderProfiles={senderProfiles}
        otherUserIds={otherUserIds}
      />

      {/* Eingabe */}
      <MessageInput conversationId={params.id} currentUserId={user.id} isStaff={isStaff} senderName={senderName} />
    </div>
  )
}
