export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInMonths } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: groups }, { data: children }] = await Promise.all([
    supabase.from('groups').select('id, name, max_children').eq('site_id', siteId).order('name'),
    supabase.from('children').select('id, group_id, date_of_birth').eq('site_id', siteId).eq('status', 'active'),
  ])

  const groupList = (groups ?? []) as any[]
  const childList = (children ?? []) as any[]

  if (groupList.length === 0) {
    return NextResponse.json({ message: 'Keine Gruppen vorhanden.', hinweise: [], stats: { groups: 0, children: 0 } })
  }

  // Build group stats
  const groupStats = groupList.map((g: any) => {
    const kids = childList.filter(c => c.group_id === g.id)
    const avgAge = kids.length > 0
      ? Math.round(kids.filter(c => c.date_of_birth).reduce((s, c) => s + differenceInMonths(new Date(), new Date(c.date_of_birth)), 0) / kids.length)
      : null
    const capacity = g.max_children ?? 0
    const utilization = capacity > 0 ? Math.round((kids.length / capacity) * 100) : null
    return { name: g.name, count: kids.length, capacity, avgAgeMonths: avgAge, utilization }
  })

  const noGroup = childList.filter(c => !c.group_id).length

  const lines = groupStats.map(g => {
    const util = g.utilization !== null ? ` (${g.utilization}% Auslastung)` : ''
    const age = g.avgAgeMonths !== null ? `, Ø ${g.avgAgeMonths} Mo.` : ''
    return `${g.name}: ${g.count} Kinder${g.capacity > 0 ? '/' + g.capacity : ''}${util}${age}`
  }).join('\n')

  const prompt = `Du bist Kita-Leiterin. Analysiere die Gruppenstruktur.

Gruppen:
${lines}
${noGroup > 0 ? `Keiner Gruppe zugeordnet: ${noGroup} Kinder` : ''}

Identifiziere Ungleichgewichte, Über-/Unterbelegung und Handlungsbedarf.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "dringend"|"empfehlung"|"info", "text": "Konkreter Hinweis"}
  ]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '{}'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(clean)
    return NextResponse.json({
      hinweise: result.hinweise ?? [],
      stats: { groups: groupList.length, children: childList.length, noGroup },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
