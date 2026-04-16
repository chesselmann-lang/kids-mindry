export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { parseAiJson, assertSiteChild, logAiUsage, applyAiRateLimit, validateBody, AiSchemas } from '@/lib/ai-utils'
import { subMonths } from 'date-fns'

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

  const { data: body, error: bodyErr } = await validateBody(req, AiSchemas.GrundschulBericht)
  if (bodyErr) return bodyErr
  const { childId } = body

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  try {
    await assertSiteChild(supabase, childId, siteId)
  } catch {
    return NextResponse.json({ error: 'Kind nicht gefunden oder kein Zugriff.' }, { status: 404 })
  }

  const since12m = subMonths(new Date(), 12).toISOString()

  const [
    { data: child },
    { data: milestones },
    { data: observations },
    { data: sismik },
    { data: reports },
    { data: foerderplaene },
  ] = await Promise.all([
    supabase.from('children').select('first_name, last_name, date_of_birth, gender, medical_notes, allergies, groups(name)')
      .eq('id', childId).single(),
    (supabase as any).from('milestones').select('title, category, achieved_at, description')
      .eq('child_id', childId).gte('achieved_at', since12m).order('achieved_at').limit(20),
    (supabase as any).from('observations').select('content, domain, created_at')
      .eq('child_id', childId).gte('created_at', since12m).order('created_at').limit(15),
    (supabase as any).from('sismik_assessments').select('score_total, completed_at, notes')
      .eq('child_id', childId).order('completed_at', { ascending: false }).limit(3),
    supabase.from('daily_reports').select('mood, notes, activities')
      .eq('child_id', childId).gte('report_date', since12m.split('T')[0]).limit(30),
    (supabase as any).from('foerderplaene').select('title, ziele, status')
      .eq('child_id', childId).order('created_at', { ascending: false }).limit(5),
  ])

  const c = child as any
  if (!c) return NextResponse.json({ error: 'Kind nicht gefunden' }, { status: 404 })

  const childName = `${c.first_name} ${c.last_name}`
  const genderDe = c.gender === 'female' ? 'Mädchen' : c.gender === 'male' ? 'Junge' : 'Kind'
  const age = c.date_of_birth
    ? Math.floor((Date.now() - new Date(c.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  const milestonesText = ((milestones ?? []) as any[])
    .map((m: any) => `${m.category}: ${m.title}`).join(', ') || 'keine dokumentiert'
  const obsText = ((observations ?? []) as any[])
    .map((o: any) => o.content).slice(0, 5).join(' | ') || 'keine Beobachtungen'
  const latestSismik = ((sismik ?? []) as any[])[0]
  const allReports = (reports ?? []) as any[]
  const moods = allReports.map((r: any) => r.mood).filter(Boolean)
  const dominantMood = moods.length > 0
    ? Object.entries(moods.reduce((acc: Record<string, number>, m: string) => { acc[m] = (acc[m] || 0) + 1; return acc }, {})).sort(([, a], [, b]) => b - a)[0]?.[0]
    : 'gut'

  const foerderTitel = ((foerderplaene ?? []) as any[]).map((f: any) => f.title).join(', ')
  const moodDE: Record<string, string> = { great: 'ausgezeichnet', good: 'gut', okay: 'durchschnittlich', sad: 'ruhig', sick: 'haeufig krank' }

  const prompt = `Du bist eine erfahrene Kita-Fachkraft mit Expertise in Schuluebergangsberichten. Erstelle einen professionellen Grundschul-Uebergangsbericht.

KIND: ${childName} (${genderDe}, ${age} Jahre)${c.groups?.name ? `, Gruppe ${c.groups.name}` : ''}
GESCHLECHT: ${c.gender}

ENTWICKLUNGSDATEN (letzte 12 Monate):
Meilensteine: ${milestonesText}
SISMIK: ${latestSismik ? `Score ${latestSismik.score_total} (${latestSismik.notes || 'keine Anmerkungen'})` : 'nicht bewertet'}
Allgemeine Stimmung: ${moodDE[dominantMood] || dominantMood}
Foerderplaene: ${foerderTitel || 'keine'}

BEOBACHTUNGEN:
${obsText}

Erstelle EXAKT dieses JSON ohne Markdown:
{
  "bericht": {
    "personalien": "...",
    "sozialverhalten": "...",
    "sprache": "...",
    "motorik": "...",
    "kognitive_entwicklung": "...",
    "emotionale_entwicklung": "...",
    "besonderheiten": "...",
    "empfehlungen": "...",
    "abschluss": "..."
  },
  "schulfaehigkeit": "gut",
  "staerken": ["...", "...", "..."],
  "empfehlungen_schule": ["...", "...", "..."]
}
Schulfaehigkeit: "gut", "bedingt" oder "foerderbedarf".
Grammatisch korrekte Form fuer ${c.gender === 'female' ? 'Maedchen (sie)' : 'Jungen (er)'}.`

  const t0 = Date.now()
  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }]
  })
  const durationMs = Date.now() - t0

  const result = await parseAiJson<any>((message.content[0] as any).text, prompt)

  logAiUsage(supabase, {
    feature: 'grundschul-bericht',
    siteId,
    userId: user.id,
    inputTokens: message.usage.input_tokens,
    outputTokens: message.usage.output_tokens,
    durationMs,
  })

  return NextResponse.json({ ...result, childName, childAge: age })
}
