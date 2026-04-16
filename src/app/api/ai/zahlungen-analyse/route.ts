export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, site_id').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = (profile as any)?.site_id ?? process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: items }, { data: payments }] = await Promise.all([
    supabase.from('payment_items').select('id, amount, status, due_date, title').eq('site_id', siteId),
    supabase.from('payments').select('payment_item_id, status, amount').eq('status', 'paid'),
  ])

  const itemList = (items ?? []) as any[]
  const paidSet = new Set((payments ?? []).map((p: any) => p.payment_item_id))

  const totalItems = itemList.length
  const openItems = itemList.filter(i => i.status === 'open').length
  const totalOpenAmount = itemList.filter(i => i.status === 'open').reduce((s, i) => s + (i.amount ?? 0), 0)

  const today = new Date().toISOString().split('T')[0]
  const overdue = itemList.filter(i => i.status === 'open' && i.due_date && i.due_date < today).length

  const prompt = `Du bist ein KiTa-Buchhalter. Analysiere die Zahlungssituation:

Zahlungspositionen gesamt: ${totalItems}
Offene Positionen: ${openItems}
Offener Betrag: ${(totalOpenAmount / 100).toFixed(2)} EUR
Überfällige Zahlungen: ${overdue}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"dringend|hinweis|info","text":"..."}],"stats":{"open":${openItems},"overdue":${overdue},"totalOpenEur":${Math.round(totalOpenAmount / 100)}}}
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
