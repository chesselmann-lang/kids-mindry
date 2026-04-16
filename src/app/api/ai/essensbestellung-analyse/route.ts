export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, startOfWeek, addDays } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const dayLabels = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')

  // Count active children
  const { count: totalChildren } = await supabase
    .from('children').select('id', { count: 'exact', head: true })
    .eq('site_id', siteId).eq('status', 'active')

  // Get all orders for current week
  const { data: orders } = await supabase
    .from('meal_orders')
    .select('child_id, orders')
    .eq('week_start', weekStart)

  const list = (orders ?? []) as any[]
  const dayCounts: Record<string, number> = {}
  for (const day of dayKeys) dayCounts[day] = 0
  for (const o of list) {
    const ord = o.orders ?? {}
    for (const day of dayKeys) {
      if (ord[day]) dayCounts[day]++
    }
  }

  const maxDay = dayKeys.reduce((a, b) => dayCounts[a] >= dayCounts[b] ? a : b)
  const minDay = dayKeys.reduce((a, b) => dayCounts[a] <= dayCounts[b] ? a : b)
  const totalOrders = list.length
  const children = totalChildren ?? 0

  const prompt = `Du bist ein KiTa-Assistent. Analysiere die Essensbestellungen für diese Woche:

Aktive Kinder: ${children}
Bestellungen eingegangen: ${totalOrders}
Ausstehende Bestellungen: ${Math.max(0, children - totalOrders)}
Bestellungen pro Tag: ${dayKeys.map((d, i) => `${dayLabels[i]}: ${dayCounts[d]}`).join(', ')}
Tag mit meisten Bestellungen: ${dayLabels[dayKeys.indexOf(maxDay)]}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"hinweis|info|ok","text":"..."}],"stats":{"totalOrders":${totalOrders},"totalChildren":${children},"missing":${Math.max(0, children - totalOrders)},"peakDay":"${dayLabels[dayKeys.indexOf(maxDay)]}"}}
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
