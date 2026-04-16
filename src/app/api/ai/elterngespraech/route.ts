export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role, site_id').eq('id', user.id).single()
  if (!['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { childId } = await req.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  // Gather child data in parallel
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const [
    { data: child },
    { data: reports },
    { data: attendance },
    { data: observations },
    { data: milestones },
    { data: healthRecords },
  ] = await Promise.all([
    supabase.from('children').select('first_name, last_name, date_of_birth, allergies, medical_notes, care_days, care_start_time, care_end_time, groups(name)').eq('id', childId).single(),
    (supabase as any).from('daily_reports').select('report_date, mood, notes, sleep_hours, sleep_mins, breakfast, lunch, snack').eq('child_id', childId).gte('report_date', thirtyDaysAgoStr).order('report_date', { ascending: false }).limit(14),
    supabase.from('attendance').select('date, status').eq('child_id', childId).gte('date', thirtyDaysAgoStr).order('date', { ascending: false }),
    (supabase as any).from('observations').select('content, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(5),
    (supabase as any).from('milestones').select('title, achieved_at').eq('child_id', childId).not('achieved_at', 'is', null).order('achieved_at', { ascending: false }).limit(5),
    (supabase as any).from('health_records').select('type, description, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(5),
  ])

  if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

  // Calculate attendance stats
  const attArr = (attendance ?? []) as any[]
  const presentCount = attArr.filter((a: any) => a.status === 'present').length
  const absentSick = attArr.filter((a: any) => a.status === 'absent_sick').length
  const absentOther = attArr.filter((a: any) => a.status === 'absent_vacation' || a.status === 'absent_other').length
  const totalDays = attArr.length

  // Calculate mood distribution
  const reportsArr = (reports ?? []) as any[]
  const moodCounts: Record<string, number> = {}
  for (const r of reportsArr) {
    if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] ?? 0) + 1
  }
  const moodLabels: Record<string, string> = { great: 'Super', good: 'Gut', okay: 'Ok', sad: 'Traurig', sick: 'Krank' }
  const moodSummary = Object.entries(moodCounts).map(([k, v]) => `${moodLabels[k] ?? k}: ${v}x`).join(', ')

  const age = (child as any).date_of_birth
    ? Math.floor((Date.now() - new Date((child as any).date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  const prompt = `Du bist eine pädagogische Fachkraft und hilfst einer Erzieherin/einem Erzieher, sich auf ein Elterngespräch vorzubereiten.

Kind: ${(child as any).first_name} ${(child as any).last_name}${age ? `, ${age} Jahre` : ''}
Gruppe: ${(child as any).groups?.name ?? '–'}

Anwesenheit letzte 30 Tage (${totalDays} Tage erfasst):
- Anwesend: ${presentCount} Tage
- Krank: ${absentSick} Tage
- Sonstige Abwesenheit: ${absentOther} Tage

Stimmungsbild aus Tagesberichten (letzte 14): ${moodSummary || 'keine Daten'}

Letzte Beobachtungen:
${((observations ?? []) as any[]).slice(0,3).map((o: any) => `• ${o.content?.slice(0,120)}`).join('\n') || '– keine'}

Erreichte Meilensteine (letzte 5):
${((milestones ?? []) as any[]).map((m: any) => `• ${m.title}`).join('\n') || '– keine'}

Gesundheitshinweise:
${(child as any).allergies?.length ? `Allergien: ${(child as any).allergies.join(', ')}` : ''}
${(child as any).medical_notes ? `Medizinisches: ${(child as any).medical_notes}` : ''}
${((healthRecords ?? []) as any[]).slice(0,2).map((h: any) => `• ${h.type}: ${h.description?.slice(0,80)}`).join('\n') || ''}

Erstelle 4-6 konkrete Gesprächspunkte für ein Elterngespräch. Berücksichtige:
- Positive Entwicklungen hervorheben
- Auffälligkeiten sachlich ansprechen
- Konkrete Beobachtungen einbeziehen
- Nächste Schritte/Ziele vorschlagen

Antworte NUR mit JSON-Array:
[{"kategorie":"Entwicklung"|"Soziales"|"Gesundheit"|"Anwesenheit"|"Besonderes"|"Nächste Schritte","titel":"Kurztitel","text":"1-2 Sätze konkreter Gesprächspunkt","positiv":true|false}]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const punkte = JSON.parse(clean)

    // Save to DB
    await (supabase as any).from('elterngespraech_vorbereitung').insert({
      site_id: siteId,
      child_id: childId,
      erstellt_von: user.id,
      ai_punkte: punkte,
    })

    return NextResponse.json({ punkte })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
