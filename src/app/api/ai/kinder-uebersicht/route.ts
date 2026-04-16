export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { differenceInMonths, differenceInYears } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = ['admin', 'group_lead'].includes((profile as any)?.role ?? '')
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const [{ data: children }, { data: groups }] = await Promise.all([
    supabase.from('children').select('id, date_of_birth, group_id, status, allergies').eq('site_id', siteId),
    supabase.from('groups').select('id, name, max_children').eq('site_id', siteId),
  ])

  const all = (children ?? []) as any[]
  const active = all.filter(c => c.status === 'active')
  const waitlist = all.filter(c => c.status === 'waitlist')
  const inactive = all.filter(c => c.status === 'inactive')

  if (active.length === 0) {
    return NextResponse.json({ message: 'Noch keine aktiven Kinder.', hinweise: [], stats: { active: 0, total: 0 } })
  }

  // Age distribution
  const now = new Date()
  const ageGroups = { under1: 0, u3: 0, u6: 0, older: 0 }
  const noGroup: number[] = []

  for (const c of active) {
    if (!c.date_of_birth) continue
    const ageMonths = differenceInMonths(now, new Date(c.date_of_birth))
    if (ageMonths < 12) ageGroups.under1++
    else if (ageMonths < 36) ageGroups.u3++
    else if (ageMonths < 72) ageGroups.u6++
    else ageGroups.older++
    if (!c.group_id) noGroup.push(c.id)
  }

  const withAllergies = active.filter(c => c.allergies && (Array.isArray(c.allergies) ? c.allergies.length > 0 : true)).length
  const avgAgeMonths = active.filter(c => c.date_of_birth).length > 0
    ? Math.round(active.filter(c => c.date_of_birth).reduce((s, c) => s + differenceInMonths(now, new Date(c.date_of_birth)), 0) / active.filter(c => c.date_of_birth).length)
    : 0

  const groupList = (groups ?? []) as any[]

  const prompt = `Du bist Kita-Leiterin. Analysiere die Zusammensetzung der Kinder.

Aktive Kinder: ${active.length}
Warteliste: ${waitlist.length}
Inaktiv: ${inactive.length}
Ø Alter: ${avgAgeMonths} Monate
Altersgruppen: <1 Jahr: ${ageGroups.under1}, 1-3 J.: ${ageGroups.u3}, 3-6 J.: ${ageGroups.u6}, >6 J.: ${ageGroups.older}
Ohne Gruppenzu­ordnung: ${noGroup.length}
Mit Allergien/Unverträglichkeiten: ${withAllergies}
Gruppen: ${groupList.length}

Gib kurze Hinweise zu Altersstruktur, fehlenden Zuordnungen und Handlungsbedarf.
Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "hinweis"|"info"|"positiv", "text": "Konkreter Hinweis"}
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
      stats: { active: active.length, waitlist: waitlist.length, noGroup: noGroup.length, withAllergies, avgAgeMonths },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
