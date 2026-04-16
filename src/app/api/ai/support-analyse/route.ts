import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')

  // Load tickets — admin sees all, user sees own
  let tickets: any[] = []
  if (isAdmin) {
    const { data } = await supabase
      .from('support_tickets').select('status, category, created_at, updated_at')
      .order('created_at', { ascending: false }).limit(100)
    tickets = data ?? []
  } else {
    const { data } = await supabase
      .from('support_tickets').select('status, category, created_at, updated_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
    tickets = data ?? []
  }

  const total = tickets.length
  const open = tickets.filter(t => t.status === 'open').length
  const inProgress = tickets.filter(t => t.status === 'in_progress').length
  const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
  const catFreq: Record<string, number> = {}
  for (const t of tickets) {
    catFreq[t.category ?? 'other'] = (catFreq[t.category ?? 'other'] ?? 0) + 1
  }

  const stats = { total, open, inProgress, resolved }

  const client = new Anthropic()
  const prompt = `Du bist ein ${isAdmin ? 'Support-Manager' : 'freundlicher Assistent'} in einer Kita-App. Analysiere die Support-Anfragen.

${isAdmin ? 'Sicht: Admin (alle Anfragen)' : 'Sicht: Nutzer (eigene Anfragen)'}
- Gesamt: ${total}
- Offen: ${open}
- In Bearbeitung: ${inProgress}
- Gelöst: ${resolved}
- Kategorien: ${JSON.stringify(catFreq)}

Gib 2-3 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"dringend"|"hinweis"|"info","text":"..."}]

${isAdmin ? 'Fokus: Bearbeitungsrückstand, häufige Probleme, Priorisierung.' : 'Fokus: Status der Anfragen, empfohlene nächste Schritte.'}
Nur JSON, kein Markdown.`

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
