export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function getNextBirthday(dobStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const dob = new Date(dobStr + 'T12:00:00')
  const thisYear = today.getFullYear()
  let next = new Date(thisYear, dob.getMonth(), dob.getDate())
  if (next < today) next = new Date(thisYear + 1, dob.getMonth(), dob.getDate())
  const daysUntil = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const turnsAge = next.getFullYear() - dob.getFullYear()
  return { daysUntil, turnsAge }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children')
    .select('id, first_name, date_of_birth')
    .eq('site_id', siteId)
    .eq('status', 'active')
    .not('date_of_birth', 'is', null)

  const list = (children ?? []) as any[]
  const annotated = list.map(c => ({ ...c, ...getNextBirthday(c.date_of_birth) }))
  const today = annotated.filter(c => c.daysUntil === 0)
  const week = annotated.filter(c => c.daysUntil > 0 && c.daysUntil <= 7)
  const month = annotated.filter(c => c.daysUntil > 7 && c.daysUntil <= 30)

  const nextKind = annotated.sort((a, b) => a.daysUntil - b.daysUntil)[0]

  const prompt = `Du bist ein KiTa-Assistent. Analysiere die anstehenden Kindergeburtstage:

Heute: ${today.map(c => `${c.first_name} (wird ${c.turnsAge})`).join(', ') || 'keiner'}
Diese Woche: ${week.map(c => `${c.first_name} in ${c.daysUntil} Tagen (wird ${c.turnsAge})`).join(', ') || 'keiner'}
Diesen Monat: ${month.length} Geburtstage
Nächster: ${nextKind ? `${nextKind.first_name} in ${nextKind.daysUntil} Tagen` : 'unbekannt'}

Antworte NUR mit JSON:
{"hinweise":[{"typ":"heute|bald|info","text":"..."}],"stats":{"today":${today.length},"thisWeek":${week.length},"thisMonth":${month.length}}}
Maximal 2 hinweise. Sei fröhlich und praktisch.`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 280,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (msg.content[0] as any).text
  const json = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return NextResponse.json(JSON.parse(json))
}
