export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { subDays } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['admin', 'group_lead', 'educator', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

  const { data: observations } = await (supabase as any)
    .from('observations')
    .select('content, category, child_id, children(first_name)')
    .eq('site_id', siteId)
    .gte('created_at', thirtyDaysAgo)
    .order('created_at', { ascending: false })
    .limit(80)

  if (!observations || observations.length === 0) {
    return NextResponse.json({ error: 'no_data' }, { status: 404 })
  }

  // Group by category for summary
  const byCategory: Record<string, number> = {}
  const byChild: Record<string, { name: string; count: number }> = {}

  for (const obs of observations as any[]) {
    const cat = obs.category ?? 'allgemein'
    byCategory[cat] = (byCategory[cat] ?? 0) + 1

    const cid = obs.child_id
    if (cid) {
      if (!byChild[cid]) byChild[cid] = { name: obs.children?.first_name ?? 'Unbekannt', count: 0 }
      byChild[cid].count++
    }
  }

  const topChildren = Object.values(byChild).sort((a, b) => b.count - a.count).slice(0, 5)
  const obsTexts = (observations as any[]).map((o: any) =>
    `[${o.category ?? 'allgemein'}] ${o.content?.slice(0, 120)}`
  ).join('\n')

  const prompt = `Analysiere diese pädagogischen Beobachtungen aus einer Kita (letzte 30 Tage, ${observations.length} Beobachtungen).

Beobachtungen:
${obsTexts}

Häufigkeit nach Bereich:
${Object.entries(byCategory).map(([k, v]) => `${k}: ${v}×`).join(', ')}

Meistbeobachtete Kinder: ${topChildren.map(c => `${c.name} (${c.count}×)`).join(', ')}

Analysiere und gib strukturiertes Feedback auf Deutsch. Antworte NUR mit einem JSON-Array:
[
  {"typ": "thema", "titel": "Entwicklungsschwerpunkt", "text": "Beschreibung des Musters (1-2 Sätze)", "kategorie": "sprache|motorik|sozial|kognition|kreativitaet|emotion|allgemein"},
  {"typ": "empfehlung", "titel": "Handlungsempfehlung", "text": "Konkrete pädagogische Maßnahme (1 Satz)", "kategorie": "..."},
  ...
]
Maximal 5 Einträge. Mischung aus 2-3 Themen/Mustern und 2 Empfehlungen.`

  let results: any[] = []
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (response.content[0] as any).text?.trim() ?? '[]'
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    results = JSON.parse(clean)
  } catch {
    results = []
  }

  return NextResponse.json({
    results,
    totalObservations: observations.length,
    topChildren,
    byCategory,
  })
}
