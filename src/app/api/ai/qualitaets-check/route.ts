export const revalidate = 900

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { subDays, subMonths } from 'date-fns'



export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const since30 = subDays(today, 30).toISOString().split('T')[0]
  const since90 = subMonths(today, 3).toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  const [
    { data: children },
    { data: reports30 },
    { data: observations90 },
    { data: milestones90 },
    { data: portfolios90 },
    { data: incompleteChildren },
  ] = await Promise.all([
    supabase.from('children').select('id, first_name, last_name, group_id, date_of_birth, allergies, medical_notes')
      .eq('site_id', siteId).eq('status', 'active'),
    supabase.from('daily_reports').select('child_id, report_date').eq('site_id', siteId)
      .gte('report_date', since30).lte('report_date', todayStr),
    (supabase as any).from('observations').select('child_id, created_at').eq('site_id', siteId)
      .gte('created_at', since90),
    (supabase as any).from('milestones').select('child_id, achieved_at').eq('site_id', siteId)
      .gte('achieved_at', since90),
    (supabase as any).from('portfolio_items').select('child_id, created_at').eq('site_id', siteId)
      .gte('created_at', since90),
    supabase.from('children').select('id, first_name, last_name')
      .eq('site_id', siteId).eq('status', 'active')
      .or('date_of_birth.is.null,group_id.is.null'),
  ])

  const allChildren = (children ?? []) as any[]
  const total = allChildren.length
  if (total === 0) return NextResponse.json({ error: 'Keine Kinder' }, { status: 400 })

  const reportsByChild = new Set((reports30 ?? []).map((r: any) => r.child_id))
  const observByChild = new Set((observations90 ?? []).map((o: any) => o.child_id))
  const milestonesByChild = new Set((milestones90 ?? []).map((m: any) => m.child_id))
  const portfolioByChild = new Set((portfolios90 ?? []).map((p: any) => p.child_id))

  const withoutReports = allChildren.filter(c => !reportsByChild.has(c.id))
  const withoutObservations = allChildren.filter(c => !observByChild.has(c.id))
  const withoutMilestones = allChildren.filter(c => !milestonesByChild.has(c.id))
  const withoutPortfolio = allChildren.filter(c => !portfolioByChild.has(c.id))
  const withoutBasicData = (incompleteChildren ?? []) as any[]

  const reportCoverage = Math.round((total - withoutReports.length) / total * 100)
  const observCoverage = Math.round((total - withoutObservations.length) / total * 100)
  const milestoneCoverage = Math.round((total - withoutMilestones.length) / total * 100)

  const prompt = `Du bist ein Qualitätssicherungsexperte für Kindertagesstätten. Analysiere die Dokumentationsqualität und gib Empfehlungen.

KITA-DATEN (${total} aktive Kinder):
- Tagesbericht-Abdeckung (30 Tage): ${reportCoverage}% (${withoutReports.length} Kinder ohne Berichte: ${withoutReports.slice(0, 3).map((c: any) => c.first_name).join(', ')}${withoutReports.length > 3 ? ` +${withoutReports.length - 3}` : ''})
- Beobachtungs-Abdeckung (90 Tage): ${observCoverage}% (${withoutObservations.length} ohne Beobachtungen)
- Meilenstein-Abdeckung (90 Tage): ${milestoneCoverage}% (${withoutMilestones.length} ohne Meilensteine)
- Portfolio-Lücken: ${withoutPortfolio.length} Kinder ohne Portfolio-Einträge (90 Tage)
- Unvollständige Stammdaten: ${withoutBasicData.length} Kinder (fehlendes Geburtsdatum oder Gruppe)

Erstelle EXAKT dieses JSON:
{
  "score": [Gesamtscore 0-100],
  "level": "sehr_gut"|"gut"|"ausbaufähig"|"kritisch",
  "bereiche": [
    {
      "name": "...",
      "score": [0-100],
      "status": "ok"|"warn"|"kritisch",
      "aktion": "..."
    }
  ],
  "prioritaet": "...",
  "naechste_schritte": ["...", "...", "..."]
}

- 4 Bereiche: Tagesberichte, Entwicklungsbeobachtungen, Meilensteine, Stammdaten
- score 80+: sehr_gut, 60-79: gut, 40-59: ausbaufähig, <40: kritisch
- Aktion je Bereich: konkrete, umsetzbare Empfehlung (1 Satz)
- prioritaet: wichtigste Maßnahme (1 Satz)
- naechste_schritte: 3 konkrete Schritte für heute/diese Woche`

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const result = JSON.parse(raw)
  return NextResponse.json({ ...result, meta: { total, reportCoverage, observCoverage, milestoneCoverage } })
}
