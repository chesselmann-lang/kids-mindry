import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  let fees: any[] = []
  if (isStaff) {
    const { data } = await supabase
      .from('fees').select('amount, status, period_month')
      .eq('site_id', siteId).order('period_month', { ascending: false }).limit(100)
    fees = data ?? []
  } else {
    const { data: guardianships } = await supabase
      .from('guardians').select('child_id').eq('user_id', user.id)
    const childIds = (guardianships ?? []).map((g: any) => g.child_id)
    if (childIds.length > 0) {
      const { data } = await supabase
        .from('fees').select('amount, status, period_month')
        .in('child_id', childIds).order('period_month', { ascending: false }).limit(50)
      fees = data ?? []
    }
  }

  const total = fees.length
  const paid = fees.filter(f => f.status === 'paid').length
  const unpaid = fees.filter(f => f.status === 'unpaid').length
  const overdue = fees.filter(f => f.status === 'overdue').length
  const openAmount = fees.filter(f => f.status !== 'paid').reduce((s, f) => s + (f.amount ?? 0), 0)

  const stats = { total, paid, unpaid, overdue, openAmount }

  const client = new Anthropic()
  const prompt = `Du bist ein Verwaltungsassistent für eine Kita. Analysiere die Gebührendaten.

${isStaff ? 'Sicht: Kitaleitung (alle Familien)' : 'Sicht: Elternteil (eigene Kinder)'}
- Gebühreneinträge gesamt: ${total}
- Bezahlt: ${paid}
- Offen: ${unpaid}
- Überfällig: ${overdue}
- Offener Betrag: ${(openAmount / 100).toFixed(2)} €

Gib 2-3 kurze Hinweise auf Deutsch zurück als JSON-Array:
[{"typ":"dringend"|"hinweis"|"info","text":"..."}]

${isStaff ? 'Fokus: Zahlungsrückstände, Mahnbedarf.' : 'Fokus: Zahlungsstatus, offene Beträge.'}
Nur JSON, kein Markdown.`

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
