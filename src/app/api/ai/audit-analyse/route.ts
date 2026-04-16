export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { subDays } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const since = subDays(new Date(), 7).toISOString()

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('action, table_name, user_id, created_at')
    .eq('site_id', siteId)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100)

  const list = (logs ?? []) as any[]
  const deletes = list.filter(l => l.action === 'delete').length
  const creates = list.filter(l => l.action === 'create').length
  const uniqueUsers = new Set(list.map(l => l.user_id)).size
  const tableFreq: Record<string, number> = {}
  for (const l of list) {
    tableFreq[l.table_name] = (tableFreq[l.table_name] ?? 0) + 1
  }
  const topTable = Object.entries(tableFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unbekannt'

  const prompt = `Du bist ein KiTa-Sicherheitsanalyst. Analysiere das Audit-Log der letzten 7 Tage:

Einträge gesamt: ${list.length}
Löschungen: ${deletes}
Neueinträge: ${creates}
Aktive Nutzer: ${uniqueUsers}
Meistgeändertes Objekt: ${topTable}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"achtung|info|sicher","text":"..."}],"stats":{"total":${list.length},"deletes":${deletes},"uniqueUsers":${uniqueUsers}}}
Maximal 2 hinweise.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
