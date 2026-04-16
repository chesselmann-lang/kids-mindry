export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInDays } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: orders } = await supabase
    .from('material_orders')
    .select('id, item_name, status, quantity, priority, created_at')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })
    .limit(40)

  const list = (orders ?? []) as any[]
  const pending = list.filter(o => o.status === 'pending')
  const ordered = list.filter(o => o.status === 'ordered')
  const delivered = list.filter(o => o.status === 'delivered')
  const highPriority = pending.filter(o => o.priority === 'high' || o.priority === 'urgent')
  const overdue = pending.filter(o => differenceInDays(new Date(), new Date(o.created_at)) > 14)

  const prompt = `Du bist ein KiTa-Verwaltungsassistent. Analysiere die Materialbestellungen:

Gesamt: ${list.length}
Ausstehend (pending): ${pending.length}
Bestellt: ${ordered.length}
Geliefert: ${delivered.length}
Hohe Priorität ausstehend: ${highPriority.length}
Überfällig (>14 Tage): ${overdue.length}
Ausstehende Artikel: ${pending.slice(0, 4).map(o => o.item_name).join(', ')}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"dringend|hinweis|info","text":"..."}],"stats":{"pending":${pending.length},"ordered":${ordered.length},"highPriority":${highPriority.length},"overdue":${overdue.length}}}
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
