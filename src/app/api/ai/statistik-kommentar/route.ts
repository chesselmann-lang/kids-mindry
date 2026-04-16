export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const now = new Date()
  const monthsData: { label: string; presentRate: number; sickDays: number; childCount: number }[] = []

  for (let i = 2; i >= 0; i--) {
    const d = subMonths(now, i)
    const start = format(startOfMonth(d), 'yyyy-MM-dd')
    const end = format(endOfMonth(d), 'yyyy-MM-dd')
    const label = format(d, 'MMM yyyy')

    const { data: att } = await supabase
      .from('attendance')
      .select('child_id, status')
      .gte('date', start)
      .lte('date', end)

    const records = att ?? []
    const present = records.filter((r: any) => r.status === 'present').length
    const sick = records.filter((r: any) => r.status === 'absent_sick').length
    const total = records.length
    const childCount = new Set(records.map((r: any) => r.child_id)).size

    monthsData.push({ label, presentRate: total > 0 ? Math.round(present / total * 100) : 0, sickDays: sick, childCount })
  }

  const trend = monthsData.length >= 2 ? monthsData[2].presentRate - monthsData[0].presentRate : 0

  const prompt = `Du bist ein KiTa-Verwaltungsassistent. Analysiere diese Anwesenheitsstatistik der letzten 3 Monate.

Daten:
${monthsData.map(m => `${m.label}: ${m.presentRate}% anwesend, ${m.sickDays} Krankmeldungen, ${m.childCount} Kinder`).join('\n')}
Trend: ${trend > 0 ? '+' : ''}${trend}%

Antworte NUR mit JSON:
{"kommentar":"...","hinweise":[{"typ":"positiv|hinweis|info","text":"..."}],"stats":{"aktuelleRate":${monthsData[2]?.presentRate ?? 0},"trend":${trend},"letzterMonatSick":${monthsData[2]?.sickDays ?? 0}}}
Maximal 2 hinweise.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
