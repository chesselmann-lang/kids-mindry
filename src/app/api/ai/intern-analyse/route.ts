import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get('groupId')
  if (!groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: group } = await supabase
    .from('groups').select('name').eq('id', groupId).single()

  // Last 30 days of messages
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  const { data: messages } = await supabase
    .from('team_messages')
    .select('user_id, created_at, content')
    .eq('group_id', groupId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100)

  const msgs = (messages ?? []) as any[]
  const totalMessages = msgs.length

  // Unique senders
  const senders = new Set(msgs.map(m => m.user_id)).size

  // Activity by day of week
  const dayFreq: Record<number, number> = {}
  for (const m of msgs) {
    const d = new Date(m.created_at).getDay()
    dayFreq[d] = (dayFreq[d] ?? 0) + 1
  }
  const busiestDay = Object.entries(dayFreq).sort((a, b) => b[1] - a[1])[0]?.[0]
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

  // Last message age
  const lastMsgDate = msgs[0]?.created_at ? new Date(msgs[0].created_at) : null
  const daysSinceLast = lastMsgDate ? Math.floor((Date.now() - lastMsgDate.getTime()) / 86400000) : null

  const stats = { totalMessages, senders, daysSinceLast }

  const client = new Anthropic()
  const prompt = `Du bist ein Assistent für ein Kita-Team. Analysiere die Team-Chat Aktivität der Gruppe "${(group as any)?.name ?? groupId}".

Letzten 30 Tage:
- Nachrichten gesamt: ${totalMessages}
- Aktive Mitglieder: ${senders}
- Aktivster Wochentag: ${busiestDay !== undefined ? dayNames[parseInt(busiestDay)] : 'unbekannt'}
- Tage seit letzter Nachricht: ${daysSinceLast ?? 'unbekannt'}

Gib 2-3 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"hinweis"|"tipp"|"info","text":"..."}]

Fokus: Kommunikationsqualität, Aktivitätsmuster, Teamzusammenarbeit. Nur JSON, kein Markdown.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (msg.content[0] as any).text
  const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const hinweise = JSON.parse(clean)

  return NextResponse.json({ hinweise, stats })
}
