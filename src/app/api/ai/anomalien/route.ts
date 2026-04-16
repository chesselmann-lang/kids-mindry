export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: attendance } = await (supabase as any)
    .from('attendance')
    .select('child_id, date, status, children(first_name, last_name)')
    .eq('site_id', siteId)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(200)

  const { data: overduePayments } = await (supabase as any)
    .from('payment_items')
    .select('id, description, amount_cents, due_date, children(first_name, last_name)')
    .eq('site_id', siteId)
    .lt('due_date', new Date().toISOString().split('T')[0])
    .is('paid_at', null)
    .limit(20)

  const absenceCounts: Record<string, { name: string; count: number; mondayCount: number }> = {}
  for (const a of (attendance ?? []) as any[]) {
    if (a.status === 'absent') {
      const childId = a.child_id
      if (!absenceCounts[childId]) {
        absenceCounts[childId] = { name: `${a.children?.first_name} ${a.children?.last_name}`, count: 0, mondayCount: 0 }
      }
      absenceCounts[childId].count++
      if (new Date(a.date).getDay() === 1) absenceCounts[childId].mondayCount++
    }
  }

  const topAbsences = Object.values(absenceCounts).sort((a, b) => b.count - a.count).slice(0, 5)
  const overdueAmount = ((overduePayments ?? []) as any[]).reduce((sum, p) => sum + (p.amount_cents ?? 0), 0) / 100

  const prompt = `Analysiere diese Kita-Daten und gib 2-4 konkrete Handlungsempfehlungen.

Kinder mit hoher Fehlquote (≥5 Fehlzeiten): ${topAbsences.filter(a => a.count >= 5).map(a => `${a.name} (${a.count}x)`).join(', ') || 'keine'}
Montags-Muster (≥3x montags): ${topAbsences.filter(a => a.mondayCount >= 3).map(a => a.name).join(', ') || 'keines'}
Offene Zahlungen: ${(overduePayments ?? []).length} (${overdueAmount.toFixed(2)} €)

Antworte NUR mit einem JSON-Array: [{"type":"warning"|"info"|"success","title":"Kurztitel","text":"1-2 Sätze"}]`

  let insights: any[] = []
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    insights = JSON.parse(clean)
  } catch { insights = [] }

  return NextResponse.json({ insights })
}
