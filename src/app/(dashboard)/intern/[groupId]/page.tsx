import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import ChatClient from './chat-client'
import AiIntern from './ai-intern'

export const metadata = { title: 'Team-Chat' }

export default async function InternChatPage({ params }: { params: { groupId: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) redirect('/feed')

  const { groupId } = params
  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: group } = await supabase
    .from('groups').select('id, name').eq('id', groupId).eq('site_id', siteId).single()
  if (!group) notFound()

  const { data: messages } = await supabase
    .from('team_messages')
    .select('*, profiles:sender_id(full_name, role)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(100)

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 pb-3 flex-shrink-0">
        <Link href="/feed" className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Team-Chat</h1>
          <p className="text-sm text-gray-400">{(group as any).name}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
          <MessageSquare size={20} className="text-brand-600" />
        </div>
      </div>

      <div className="flex-shrink-0 pb-3">
        <AiIntern groupId={groupId} />
      </div>

      <ChatClient
        groupId={groupId}
        userId={user.id}
        userName={(profile as any)?.full_name ?? 'Unbekannt'}
        initialMessages={(messages ?? []) as any[]}
      />
    </div>
  )
}
