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
  const today = new Date().toISOString().split('T')[0]
  const until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data: substitutions } = await supabase
    .from('substitutions')
    .select('id, date, absent_staff_id, substitute_staff_id, reason, profiles:absent_staff_id(full_name), sub:substitute_staff_id(full_name)')
    .eq('site_id', siteId)
    .gte('date', today)
    .lte('date', until)
    .order('date', { ascending: true })

  const list = (substitutions ?? []) as any[]

  if (list.length === 0) {
    return NextResponse.json({ message: 'Keine Vertretungen in den nächsten 30 Tagen geplant.', hinweise: [], stats: { total: 0, uncovered: 0, today: 0 } })
  }

  const uncovered = list.filter(s => !s.substitute_staff_id)
  const todayEntries = list.filter(s => s.date === today)

  // Date density: count entries per date to find busy periods
  const dateCounts: Record<string, number> = {}
  for (const s of list) {
    dateCounts[s.date] = (dateCounts[s.date] ?? 0) + 1
  }
  const busyDays = Object.entries(dateCounts)
    .filter(([, count]) => count >= 2)
    .map(([date, count]) => `${format(new Date(date + 'T12:00:00'), 'd. MMM', { locale: de })} (${count}x)`)
    .slice(0, 3)

  const lines = list.slice(0, 8).map((s: any) => {
    const absent = s.profiles?.full_name ?? 'k.A.'
    const sub = s.sub?.full_name ?? '⚠️ unbesetzt'
    return `${s.date}: ${absent} → ${sub}${s.reason ? ` (${s.reason})` : ''}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere den Vertretungsplan für die nächsten 30 Tage.

Statistiken:
- Vertretungen gesamt: ${list.length}
- Unbesetzte Ausfälle: ${uncovered.length}
- Heute betroffene Einträge: ${todayEntries.length}
- Häufige Ausfalltage: ${busyDays.join(', ') || 'keine'}

Einträge:
${lines}

Gib kurze, praxisnahe Hinweise zu dringenden Lücken und Handlungsbedarf.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "dringend"|"hinweis"|"info", "text": "Konkreter Hinweis"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      hinweise: result.hinweise ?? [],
      stats: { total: list.length, uncovered: uncovered.length, today: todayEntries.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
