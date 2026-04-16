export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { format, subDays } from 'date-fns'
import { de } from 'date-fns/locale'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!
  const since = subDays(new Date(), 30).toISOString()

  const { data: logs } = await supabase
    .from('medication_logs')
    .select('id, child_id, medication_name, dosage, parent_consent, administered_at, children(first_name, last_name)')
    .eq('site_id', siteId)
    .gte('administered_at', since)
    .order('administered_at', { ascending: false })

  if (!logs || logs.length === 0) {
    return NextResponse.json({
      message: 'Keine Medikamentengaben in den letzten 30 Tagen.',
      hinweise: [],
      stats: { total: 0, withConsent: 0, children: 0 },
    })
  }

  const withConsent = (logs as any[]).filter(l => l.parent_consent).length
  const withoutConsent = logs.length - withConsent
  const uniqueChildren = new Set((logs as any[]).map(l => l.child_id)).size

  // Most given medications
  const medCounts: Record<string, number> = {}
  for (const l of logs as any[]) {
    const name = l.medication_name?.toLowerCase() ?? 'unbekannt'
    medCounts[name] = (medCounts[name] ?? 0) + 1
  }
  const topMeds = Object.entries(medCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n, c]) => `${n} (${c}x)`)
    .join(', ')

  // Children with frequent meds
  const childCounts: Record<string, number> = {}
  for (const l of logs as any[]) {
    const name = `${(l.children as any)?.first_name ?? ''} ${(l.children as any)?.last_name ?? ''}`.trim()
    childCounts[name] = (childCounts[name] ?? 0) + 1
  }
  const frequentChildren = Object.entries(childCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .filter(([, c]) => c > 1)
    .map(([n, c]) => `${n}: ${c}x`)
    .join(', ')

  const prompt = `Du bist medizinisch geschulte Kita-Kraft. Analysiere die Medikamentengaben der letzten 30 Tage.

Statistik:
- Gesamt: ${logs.length} Gaben | ${uniqueChildren} betroffene Kinder
- Mit Elterneinwilligung: ${withConsent} | Ohne: ${withoutConsent}
- Häufigste Medikamente: ${topMeds || 'keine Daten'}
- Häufigste Gaben: ${frequentChildren || 'keine Auffälligkeiten'}

Erstelle 2-3 Hinweise zur Sicherheit, Compliance und Handlungsbedarf. Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "sicherheit"|"compliance"|"info", "text": "Konkreter Hinweis"}
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
      stats: { total: logs.length, withConsent, withoutConsent, children: uniqueChildren },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
