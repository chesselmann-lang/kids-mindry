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
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: plans } = await supabase
    .from('foerderplaene')
    .select('id, title, goals, start_date, end_date, review_date, children(first_name, last_name)')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  if (!plans || plans.length === 0) {
    return NextResponse.json({
      message: 'Keine Förderpläne vorhanden.',
      hinweise: [],
      zusammenfassung: '',
    })
  }

  const today = new Date()
  const overdue = (plans as any[]).filter(p =>
    p.review_date && differenceInDays(new Date(p.review_date), today) < 0
  )
  const dueSoon = (plans as any[]).filter(p =>
    p.review_date && differenceInDays(new Date(p.review_date), today) >= 0 &&
    differenceInDays(new Date(p.review_date), today) <= 30
  )
  const expiring = (plans as any[]).filter(p =>
    p.end_date && differenceInDays(new Date(p.end_date), today) <= 14 &&
    differenceInDays(new Date(p.end_date), today) >= 0
  )

  const planLines = (plans as any[]).slice(0, 8).map(p => {
    const childName = `${p.children?.first_name ?? ''} ${p.children?.last_name ?? ''}`.trim()
    const reviewStr = p.review_date
      ? `Überprüfung: ${format(new Date(p.review_date), 'd. MMM', { locale: de })}`
      : 'keine Überprüfung'
    const goalCount = Array.isArray(p.goals) ? p.goals.length : 0
    return `${childName}: "${p.title}" | ${goalCount} Ziele | ${reviewStr}`
  }).join('\n')

  const prompt = `Du bist pädagogische Fachkraft. Analysiere die aktiven Förderpläne.

Gesamt: ${plans.length} Förderpläne
Überfällige Überprüfungen: ${overdue.length}
Überprüfungen in 30 Tagen: ${dueSoon.length}
Auslaufende Pläne (14 Tage): ${expiring.length}

Aktuelle Pläne:
${planLines}

Erstelle 2-3 pädagogisch sinnvolle Hinweise. Antworte NUR mit JSON:
{
  "zusammenfassung": "1 Satz zum Stand der Förderpläne",
  "hinweise": [
    {"typ": "dringend"|"empfehlung"|"info", "text": "Konkreter Hinweis"}
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
      zusammenfassung: result.zusammenfassung ?? '',
      hinweise: result.hinweise ?? [],
      stats: { total: plans.length, overdue: overdue.length, dueSoon: dueSoon.length, expiring: expiring.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
