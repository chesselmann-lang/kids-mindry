export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInMonths, startOfMonth, format } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead'].includes((profile as any)?.role ?? ''))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const today = new Date()
  const monthStart = startOfMonth(today).toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]
  const monthLabel = format(today, 'MMMM yyyy', { locale: de })

  const [
    { data: groups },
    { data: children },
    { data: monthAtt },
    { data: monthObs },
    { data: monthIncidents },
    { data: staff },
  ] = await Promise.all([
    supabase.from('groups').select('id, name, color').eq('site_id', siteId).order('name'),
    supabase.from('children').select('id, group_id, date_of_birth, gender').eq('site_id', siteId).eq('status', 'active'),
    supabase.from('attendance').select('child_id, status, date')
      .eq('site_id', siteId).gte('date', monthStart).lte('date', todayStr),
    supabase.from('observations').select('child_id')
      .eq('site_id', siteId).gte('created_at', new Date(monthStart).toISOString()),
    supabase.from('incidents').select('child_id, severity')
      .eq('site_id', siteId).gte('created_at', new Date(monthStart).toISOString()),
    supabase.from('profiles').select('id, role')
      .eq('site_id', siteId).in('role', ['educator', 'group_lead', 'caretaker']),
  ])

  // Build per-group stats
  const groupMap: Record<string, {
    name: string; childCount: number; avgAgeMonths: number;
    present: number; sick: number; totalAtt: number;
    observations: number; incidents: number; highIncidents: number;
  }> = {}

  for (const g of (groups ?? []) as any[]) {
    groupMap[g.id] = { name: g.name, childCount: 0, avgAgeMonths: 0, present: 0, sick: 0, totalAtt: 0, observations: 0, incidents: 0, highIncidents: 0 }
  }

  const childGroupMap: Record<string, string> = {}
  for (const c of (children ?? []) as any[]) {
    if (!c.group_id || !groupMap[c.group_id]) continue
    childGroupMap[c.id] = c.group_id
    groupMap[c.group_id].childCount++
    if (c.date_of_birth) {
      const months = differenceInMonths(today, new Date(c.date_of_birth))
      groupMap[c.group_id].avgAgeMonths += months
    }
  }
  Object.values(groupMap).forEach(g => {
    if (g.childCount > 0) g.avgAgeMonths = Math.round(g.avgAgeMonths / g.childCount)
  })

  for (const a of (monthAtt ?? []) as any[]) {
    const gid = childGroupMap[a.child_id]
    if (!gid || !groupMap[gid]) continue
    groupMap[gid].totalAtt++
    if (a.status === 'present') groupMap[gid].present++
    if (a.status === 'absent_sick') groupMap[gid].sick++
  }
  for (const o of (monthObs ?? []) as any[]) {
    const gid = childGroupMap[o.child_id]
    if (gid && groupMap[gid]) groupMap[gid].observations++
  }
  for (const i of (monthIncidents ?? []) as any[]) {
    const gid = childGroupMap[i.child_id]
    if (!gid || !groupMap[gid]) continue
    groupMap[gid].incidents++
    if (i.severity === 'high') groupMap[gid].highIncidents++
  }

  const totalChildren = (children ?? []).length
  const staffCount = (staff ?? []).length
  const ratio = staffCount > 0 ? (totalChildren / staffCount).toFixed(1) : 'unbekannt'

  const groupLines = Object.values(groupMap).map(g => {
    const attRate = g.totalAtt > 0 ? Math.round((g.present / g.totalAtt) * 100) : 0
    const ageYears = Math.floor(g.avgAgeMonths / 12)
    const ageMons = g.avgAgeMonths % 12
    return `${g.name}: ${g.childCount} Kinder, Ø-Alter ${ageYears}J${ageMons}M, Anwesenheit ${attRate}%, ${g.sick} Kranktage, ${g.observations} Beobachtungen, ${g.incidents} Vorfälle${g.highIncidents > 0 ? ` (${g.highIncidents} ernst)` : ''}`
  }).join('\n')

  const prompt = `Analysiere die Kita-Gruppenstatistik und gib pädagogische Handlungsempfehlungen.

Monat: ${monthLabel}
Kinder gesamt: ${totalChildren}, Personal: ${staffCount}, Kind-Betreuungsschlüssel: 1:${ratio}

Gruppen:
${groupLines}

Erstelle 3-5 datenbasierte Erkenntnisse und Empfehlungen. Fokus auf:
- Auffälligkeiten bei Anwesenheit / Krankenquote
- Gruppen mit vielen Vorfällen (Sicherheit, Betreuungsqualität)
- Beobachtungsqualität (Gruppen mit wenig Dokumentation)
- Empfehlungen für Ressourcenverteilung / Personalplanung
- Positive Entwicklungen hervorheben

Antworte NUR mit JSON-Array:
[
  {"typ": "positiv"|"hinweis"|"handlung", "titel": "Kurztitel", "text": "2-3 Sätze Analyse + konkrete Empfehlung", "gruppe": "Gruppenname oder null wenn übergreifend"},
  ...
]`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const erkenntnisse = JSON.parse(clean)
    return NextResponse.json({ erkenntnisse: Array.isArray(erkenntnisse) ? erkenntnisse : [], monthLabel })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
