export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { parseAiJson, assertSiteChild, logAiUsage, applyAiRateLimit, validateBody, AiSchemas } from '@/lib/ai-utils'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = applyAiRateLimit(user.id)
  if (rl) return rl

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead', 'educator'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: body, error: bodyErr } = await validateBody(req, AiSchemas.Jahresrueckblick)
  if (bodyErr) return bodyErr
  const { childId, year } = body

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  try {
    await assertSiteChild(supabase, childId, siteId)
  } catch {
    return NextResponse.json({ error: 'Kind nicht gefunden oder kein Zugriff.' }, { status: 404 })
  }

  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`

  const [
    { data: child },
    { data: attendance },
    { data: milestones },
    { data: reports },
    { data: observations },
  ] = await Promise.all([
    supabase.from('children').select('first_name, last_name, date_of_birth, gender, groups(name)')
      .eq('id', childId).single(),
    supabase.from('attendance').select('date, status')
      .eq('child_id', childId).gte('date', yearStart).lte('date', yearEnd),
    (supabase as any).from('milestones').select('title, category, achieved_at')
      .eq('child_id', childId).gte('achieved_at', yearStart).lte('achieved_at', yearEnd)
      .order('achieved_at').limit(30),
    supabase.from('daily_reports').select('report_date, mood, notes, activities')
      .eq('child_id', childId).gte('report_date', yearStart).lte('report_date', yearEnd).limit(50),
    (supabase as any).from('observations').select('content, domain, created_at')
      .eq('child_id', childId).gte('created_at', yearStart).lte('created_at', yearEnd + 'T23:59:59').limit(20),
  ])

  const c = child as any
  if (!c) return NextResponse.json({ error: 'Kind nicht gefunden' }, { status: 404 })

  const att = attendance ?? []
  const presentDays = att.filter((a: any) => a.status === 'present').length
  const sickDays = att.filter((a: any) => a.status === 'absent_sick').length
  const totalDays = att.length
  const anwesenheitsrate = totalDays > 0 ? Math.round(presentDays / totalDays * 100) : 0

  const mileList = ((milestones ?? []) as any[]).map((m: any) => `${m.category}: ${m.title}`).join(', ') || 'keine'
  const obsSnippets = ((observations ?? []) as any[]).slice(0, 8).map((o: any) => o.content?.slice(0, 100)).filter(Boolean).join(' | ')
  const allReports = (reports ?? []) as any[]
  const notizSample = allReports.slice(0, 5).map((r: any) => r.notes).filter(Boolean).join(' | ')

  const age = c.date_of_birth
    ? Math.floor((Date.now() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  const prompt = `Du bist eine erfahrene Kita-Fachkraft. Erstelle einen emotionalen Jahresrueckblick fuer ${year}.

KIND: ${c.first_name} ${c.last_name}${age ? ` (${age} Jahre)` : ''}${c.groups?.name ? `, Gruppe ${c.groups.name}` : ''}

DATEN ${year}:
Anwesenheit: ${presentDays} Tage anwesend, ${sickDays} Tage krank (${anwesenheitsrate}% Anwesenheitsrate)
Meilensteine: ${mileList}
Beobachtungen: ${obsSnippets || 'keine'}
Tagesnotizen (Auszug): ${notizSample || 'keine'}

Erstelle EXAKT dieses JSON ohne Markdown:
{
  "jahresrueckblick": {
    "einleitung": "...",
    "entwicklung": "...",
    "highlights": "...",
    "staerken": "...",
    "ausblick": "...",
    "abschluss": "..."
  },
  "stats": {
    "anwesenheitsrate": ${anwesenheitsrate},
    "meilensteine": ${((milestones ?? []) as any[]).length},
    "berichte": ${allReports.length},
    "jahr": ${year}
  }
}
Jeder Abschnitt: 2-3 Saetze, herzlich und paedagogisch wertvoll.`

  const t0 = Date.now()
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 900,
    messages: [{ role: 'user', content: prompt }]
  })
  const durationMs = Date.now() - t0

  const result = await parseAiJson<any>((message.content[0] as any).text, prompt)

  logAiUsage(supabase, {
    feature: 'jahresrueckblick',
    siteId,
    userId: user.id,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    durationMs,
  })

  return NextResponse.json({ ...result, childName: `${c.first_name} ${c.last_name}`, year })
}
