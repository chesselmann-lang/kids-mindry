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
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { childId, planTitle } = await req.json()
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 60)

  const [
    { data: child },
    { data: observations },
    { data: milestones },
    { data: existingPlans },
    { data: reports },
  ] = await Promise.all([
    supabase.from('children').select('first_name, last_name, date_of_birth, groups(name)').eq('id', childId).single(),
    (supabase as any).from('observations').select('content, created_at').eq('child_id', childId).order('created_at', { ascending: false }).limit(8),
    (supabase as any).from('milestones').select('title, achieved_at, category').eq('child_id', childId).order('achieved_at', { ascending: false }).limit(10),
    (supabase as any).from('foerderplaene').select('title, goals, is_active').eq('child_id', childId).order('created_at', { ascending: false }).limit(3),
    (supabase as any).from('daily_reports').select('mood, notes').eq('child_id', childId).gte('report_date', thirtyDaysAgo.toISOString().split('T')[0]).order('report_date', { ascending: false }).limit(10),
  ])

  if (!child) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const age = (child as any).date_of_birth
    ? Math.floor((Date.now() - new Date((child as any).date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null

  const prompt = `Du bist eine pädagogische Fachkraft und erstellst Förderziele für einen Entwicklungsplan.

Kind: ${(child as any).first_name}${age ? `, ${age} Jahre` : ''}
Gruppe: ${(child as any).groups?.name ?? '–'}
Förderplan-Titel: ${planTitle || 'Allgemeiner Entwicklungsplan'}

Aktuelle Beobachtungen (letzte 60 Tage):
${((observations ?? []) as any[]).slice(0, 5).map((o: any) => `• ${o.content?.slice(0, 150)}`).join('\n') || '– keine Beobachtungen'}

Erreichte Meilensteine:
${((milestones ?? []) as any[]).slice(0, 7).map((m: any) => `• ${m.title}${m.category ? ` (${m.category})` : ''}`).join('\n') || '– keine'}

Bestehende Förderpläne:
${((existingPlans ?? []) as any[]).map((p: any) => `• ${p.title}: ${Array.isArray(p.goals) ? p.goals.join(', ') : ''}`).join('\n') || '– keine'}

Stimmungsbild aus Berichten:
${((reports ?? []) as any[]).filter((r: any) => r.notes).slice(0, 3).map((r: any) => `• ${r.notes?.slice(0, 100)}`).join('\n') || '– keine Notizen'}

Erstelle 5-7 konkrete, entwicklungsgerechte Förderziele. Diese sollen:
- SMART-Kriterien erfüllen (spezifisch, messbar, erreichbar, relevant, terminiert)
- Dem Entwicklungsstand des Kindes entsprechen
- Verschiedene Entwicklungsbereiche abdecken (Sprache, Motorik, Soziales, Kognition, Kreativität)
- Positiv formuliert sein ("kann", "zeigt", "entwickelt")
- Nicht bereits in bestehenden Plänen vorhanden sein

Antworte NUR mit JSON-Array von Strings (die Förderziele):
["Förderziel 1", "Förderziel 2", ...]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const goals = JSON.parse(clean)
    return NextResponse.json({ goals: Array.isArray(goals) ? goals : [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
