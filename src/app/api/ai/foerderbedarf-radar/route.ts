export const revalidate = 900

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { anthropic, AI_MODEL } from '@/lib/anthropic'
import { subMonths } from 'date-fns'



export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['admin', 'group_lead', 'educator'].includes((profile as any)?.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const since3m = subMonths(new Date(), 3).toISOString()

  const [
    { data: children },
    { data: milestones },
    { data: observations },
    { data: sismik },
  ] = await Promise.all([
    supabase.from('children').select('id').eq('site_id', siteId).eq('status', 'active'),
    (supabase as any).from('milestones').select('child_id, category').eq('site_id', siteId)
      .gte('achieved_at', since3m),
    (supabase as any).from('observations').select('child_id, domain').eq('site_id', siteId)
      .gte('created_at', since3m),
    (supabase as any).from('sismik_assessments').select('child_id, score_total').eq('site_id', siteId)
      .gte('completed_at', since3m),
  ])

  const total = (children ?? []).length
  if (total === 0) return NextResponse.json({ error: 'Keine Kinder' }, { status: 400 })

  const DOMAINS = ['social', 'language', 'motor', 'cognitive', 'creative', 'emotional']
  const DOMAIN_LABELS: Record<string, string> = {
    social: 'Sozial', language: 'Sprache', motor: 'Motorik',
    cognitive: 'Kognitiv', creative: 'Kreativität', emotional: 'Emotional'
  }

  // Count milestones and observations per domain
  const milestoneDomains: Record<string, number> = {}
  for (const m of (milestones ?? []) as any[]) {
    const cat = m.category || 'general'
    milestoneDomains[cat] = (milestoneDomains[cat] ?? 0) + 1
  }

  const obsDomains: Record<string, number> = {}
  for (const o of (observations ?? []) as any[]) {
    const dom = o.domain || 'general'
    obsDomains[dom] = (obsDomains[dom] ?? 0) + 1
  }

  const domainData = DOMAINS.map(d => ({
    domain: d,
    label: DOMAIN_LABELS[d],
    meilensteine: milestoneDomains[d] ?? 0,
    beobachtungen: obsDomains[d] ?? 0,
    total: (milestoneDomains[d] ?? 0) + (obsDomains[d] ?? 0),
  }))

  const maxTotal = Math.max(...domainData.map(d => d.total), 1)
  const withScores = domainData.map(d => ({
    ...d,
    abdeckung: Math.min(100, Math.round(d.total / maxTotal * 100))
  }))

  const sismikCount = (sismik ?? []).length
  const schwachsteBereich = withScores.slice().sort((a, b) => a.total - b.total)[0]
  const staerksterBereich = withScores.slice().sort((a, b) => b.total - a.total)[0]

  const prompt = `Du bist Kita-Pädagogin und Entwicklungsexpertin. Analysiere den Förderbedarf der Kita auf Gruppen-Ebene.

DATEN (Letzten 3 Monate, ${total} Kinder):
${withScores.map(d => `- ${d.label}: ${d.meilensteine} Meilensteine + ${d.beobachtungen} Beobachtungen = ${d.total} gesamt (${d.abdeckung}%)`).join('\n')}
SISMIK-Auswertungen: ${sismikCount}

Schwächster Bereich: ${schwachsteBereich.label} (${schwachsteBereich.total} Einträge)
Stärkster Bereich: ${staerksterBereich.label} (${staerksterBereich.total} Einträge)

Erstelle EXAKT dieses JSON:
{
  "bereiche": [
    {
      "domain": "social"|"language"|"motor"|"cognitive"|"creative"|"emotional",
      "label": "...",
      "abdeckung": [0-100],
      "status": "gut"|"ausbaufähig"|"unterversorgt",
      "empfehlung": "..."
    }
  ],
  "gesamtbild": "...",
  "schwerpunkt_monat": "...",
  "aktivitaets_ideen": ["...", "...", "..."],
  "hinweis_eltern": "..."
}

- Abdeckung aus den Daten übernehmen
- Status: 70%+ = gut, 40-69% = ausbaufähig, <40% = unterversorgt
- Empfehlung je Bereich: konkrete Aktivität (1 Satz)
- Gesamtbild: 1 Satz zur pädagogischen Situation
- Schwerpunkt_Monat: welchen Bereich als Monatsschwerpunkt setzen
- 3 konkrete Aktivitätsideen für den Schwerpunkt
- Eltern-Hinweis: kurzer Tipp für Eltern zum Thema`

  const message = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 900,
    messages: [{ role: 'user', content: prompt }]
  })

  const raw = (message.content[0] as { type: string; text: string }).text
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const result = JSON.parse(raw)
  return NextResponse.json({ ...result, meta: { total, sismikCount } })
}
