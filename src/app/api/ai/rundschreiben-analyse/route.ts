export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInDays, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ count: parentCount }, { count: pushCount }, { data: broadcasts }] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('site_id', siteId).eq('role', 'parent'),
    supabase.from('push_subscriptions').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    supabase.from('notifications').select('id, title, body, created_at').eq('type', 'broadcast').order('created_at', { ascending: false }).limit(15),
  ])

  const list = (broadcasts ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Noch keine Rundschreiben gesendet.', hinweise: [], stats: { total: 0, pushCount: pushCount ?? 0, parentCount: parentCount ?? 0 } })
  }

  const daysSinceLast = list[0]?.created_at
    ? differenceInDays(new Date(), new Date(list[0].created_at))
    : null

  const pushRate = (parentCount ?? 0) > 0
    ? Math.round(((pushCount ?? 0) / (parentCount ?? 1)) * 100)
    : 0

  const lines = list.slice(0, 6).map((n: any) => {
    const date = format(new Date(n.created_at), 'd. MMM yyyy', { locale: de })
    return `${date}: ${n.title ?? 'k.T.'}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die Kommunikation per Rundschreiben/Push-Nachrichten.

Statistiken:
- Gesendete Rundschreiben: ${list.length}
- Letztes vor: ${daysSinceLast ?? '?'} Tagen
- Eltern mit Push-Abo: ${pushCount ?? 0} von ${parentCount ?? 0} (${pushRate}%)

Letzte Nachrichten:
${lines}

Gib kurze Hinweise zur Kommunikationsfrequenz und Push-Abonnement-Rate.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "hinweis"|"positiv"|"info", "text": "Konkreter Hinweis"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      hinweise: result.hinweise ?? [],
      stats: { total: list.length, pushCount: pushCount ?? 0, parentCount: parentCount ?? 0, pushRate },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
