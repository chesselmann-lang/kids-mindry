export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { subDays } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CHECKLIST_ITEMS: Record<string, string> = {
  floors_clean: 'Böden gereinigt',
  toilets_clean: 'Toiletten desinfiziert',
  sinks_clean: 'Waschbecken gereinigt',
  soap_filled: 'Seife aufgefüllt',
  towels_ready: 'Handtücher bereit',
  windows_open: 'Gelüftet',
  kitchen_clean: 'Küche gereinigt',
  tables_disinfected: 'Tische desinfiziert',
  food_stored: 'Lebensmittel korrekt gelagert',
  waste_emptied: 'Mülleimer geleert',
  toys_cleaned: 'Spielzeug gereinigt',
  outdoor_area: 'Außenbereich geprüft',
  final_sweep: 'Abschlusskontrolle Räume',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const since = subDays(new Date(), 14).toISOString().split('T')[0]

  const { data: checks } = await supabase
    .from('hygiene_checks')
    .select('id, section, item_id, checked, check_date')
    .eq('site_id', siteId)
    .gte('check_date', since)
    .order('check_date', { ascending: false })

  if (!checks || checks.length === 0) {
    return NextResponse.json({
      message: 'Keine Hygiene-Daten der letzten 14 Tage.',
      hinweise: [],
      stats: { compliance: 100, days: 0 },
    })
  }

  // Compute per-item compliance
  const itemStats: Record<string, { checked: number; total: number }> = {}
  for (const c of checks as any[]) {
    if (!itemStats[c.item_id]) itemStats[c.item_id] = { checked: 0, total: 0 }
    itemStats[c.item_id].total++
    if (c.checked) itemStats[c.item_id].checked++
  }

  const totalChecked = (checks as any[]).filter(c => c.checked).length
  const compliance = Math.round((totalChecked / checks.length) * 100)

  // Find items with low compliance
  const lowItems = Object.entries(itemStats)
    .map(([id, s]) => ({ id, label: CHECKLIST_ITEMS[id] ?? id, rate: Math.round((s.checked / s.total) * 100) }))
    .filter(x => x.rate < 80)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 4)

  // Section compliance
  const sectionStats: Record<string, { checked: number; total: number }> = {}
  for (const c of checks as any[]) {
    if (!sectionStats[c.section]) sectionStats[c.section] = { checked: 0, total: 0 }
    sectionStats[c.section].total++
    if (c.checked) sectionStats[c.section].checked++
  }
  const sectionLines = Object.entries(sectionStats)
    .map(([s, v]) => `${s}: ${Math.round((v.checked / v.total) * 100)}%`)
    .join(', ')

  const lowLines = lowItems.map(x => `${x.label}: ${x.rate}% erfüllt`).join('\n')

  const uniqueDays = new Set((checks as any[]).map(c => c.check_date)).size

  const prompt = `Du bist Hygieneverantwortliche einer Kita. Analysiere die Hygiene-Compliance der letzten 14 Tage.

Gesamtcompliance: ${compliance}%
Tage mit Daten: ${uniqueDays}
Abschnitte: ${sectionLines}
${lowLines ? `Punkte unter 80%:\n${lowLines}` : 'Alle Punkte über 80% Compliance.'}

Erstelle 2-3 gezielte Handlungsempfehlungen. Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "gut"|"verbesserung"|"achtung", "text": "Konkreter Hinweis oder Lob"}
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
      stats: { compliance, days: uniqueDays, total: checks.length },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
