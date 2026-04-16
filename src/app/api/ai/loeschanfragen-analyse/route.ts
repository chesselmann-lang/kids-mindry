import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: requests } = await (supabase as any)
    .from('deletion_requests')
    .select('status, scheduled_deletion_at, created_at')
    .order('created_at', { ascending: false })

  const reqs = (requests ?? []) as any[]
  const pending = reqs.filter(r => r.status === 'pending')
  const completed = reqs.filter(r => r.status === 'completed')
  const rejected = reqs.filter(r => r.status === 'rejected')

  // Find urgent requests (scheduled in < 7 days)
  const now = Date.now()
  const urgentCount = pending.filter(r => {
    if (!r.scheduled_deletion_at) return false
    const daysLeft = (new Date(r.scheduled_deletion_at).getTime() - now) / (1000 * 60 * 60 * 24)
    return daysLeft < 7
  }).length

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 450,
    messages: [{
      role: 'user',
      content: `Du bist ein DSGVO-Compliance-Assistent fuer eine Kita. Gib 3 kurze Hinweise zum Bearbeitungsstand der Loeschanfragen auf Deutsch.

Ausstehende Anfragen: ${pending.length}
Dringende Anfragen (< 7 Tage): ${urgentCount}
Abgeschlossene Loeschungen: ${completed.length}
Abgelehnte Anfragen: ${rejected.length}
Gesamt: ${reqs.length}

Art. 17 DSGVO: 30 Tage Bearbeitungsfrist.

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "dringend"|"hinweis"|"info", "text": "..."}
  ],
  "stats": {
    "pending": ${pending.length},
    "urgent": ${urgentCount},
    "total": ${reqs.length}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
