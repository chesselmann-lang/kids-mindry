import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  // Get notifications for this user
  const { data: notifications } = await (supabase as any)
    .from('notifications')
    .select('type, read_at, created_at, title')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const notifs = (notifications ?? []) as any[]
  const total = notifs.length
  const unread = notifs.filter(n => !n.read_at).length
  const typeFreq: Record<string, number> = {}
  for (const n of notifs) {
    const t = n.type ?? 'other'
    typeFreq[t] = (typeFreq[t] ?? 0) + 1
  }

  // Most recent unread
  const recentUnread = notifs.filter(n => !n.read_at).slice(0, 3).map(n => n.title ?? n.type)

  const stats = { total, unread, typeFreq }

  const client = new Anthropic()
  const prompt = `Du bist ein Kita-Assistent. Analysiere die Benachrichtigungen eines Nutzers.

Statistiken:
- Benachrichtigungen gesamt: ${total}
- Ungelesen: ${unread}
- Typen: ${JSON.stringify(typeFreq)}
${recentUnread.length > 0 ? `- Ungelesene: ${recentUnread.join(', ')}` : ''}

Gib 2-3 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"wichtig"|"hinweis"|"info","text":"..."}]

Fokus: Ungelesene Nachrichten, wichtige Themen, Handlungsempfehlungen. Nur JSON, kein Markdown.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as any).text
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const hinweise = JSON.parse(clean)

  return NextResponse.json({ hinweise, stats })
}
