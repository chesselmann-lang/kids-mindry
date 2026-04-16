import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const yearParam = req.nextUrl.searchParams.get('year')
  const year = parseInt(yearParam ?? String(new Date().getFullYear() - 1))

  const { data: payments } = await supabase
    .from('payments')
    .select('*, payment_items(title, amount_cents)')
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .gte('created_at', `${year}-01-01`)
    .lt('created_at', `${year + 1}-01-01`)

  const paymentList = (payments ?? []) as any[]
  const totalCents = paymentList.reduce((sum, p) => sum + (p.payment_items?.amount_cents ?? 0), 0)
  const totalEuro = (totalCents / 100).toFixed(2)
  const paymentCount = paymentList.length

  const { data: guardians } = await supabase
    .from('guardians').select('children(first_name, last_name)').eq('user_id', user.id)
  const children = ((guardians ?? []) as any[]).flatMap(g => g.children ? [g.children] : [])
  const childrenNames = children.map(c => `${c.first_name} ${c.last_name}`).join(', ')

  const client = new Anthropic()
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 450,
    messages: [{
      role: 'user',
      content: `Du bist ein Kita-Assistent. Gib 3 kurze, hilfreiche Hinweise zur steuerlichen Bescheinigung auf Deutsch.

Jahr: ${year}
Gesamtbetrag: ${totalEuro} Euro
Anzahl Zahlungen: ${paymentCount}
Kinder: ${childrenNames || '(keine)'}

Hinweis: Kita-Gebuehren koennen als Kinderbetreuungskosten nach § 10 Abs. 1 Nr. 5 EStG abgesetzt werden (2/3 der Kosten, max. 4.000 Euro pro Kind und Jahr).

Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "steuer"|"hinweis"|"info", "text": "..."}
  ],
  "stats": {
    "totalEuro": "${totalEuro}",
    "paymentCount": ${paymentCount},
    "year": ${year}
  }
}`
    }]
  })

  const raw = (message.content[0] as any).text
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return NextResponse.json(parsed)
}
