export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = ['educator', 'group_lead', 'admin', 'caretaker'].includes((profile as any)?.role ?? '')
  if (!isStaff) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const siteId = process.env.NEXT_PUBLIC_DEFAULT_SITE_ID!

  const { data: children } = await supabase
    .from('children').select('id, first_name').eq('site_id', siteId).eq('status', 'active')

  const childIds = (children ?? []).map((c: any) => c.id)

  if (childIds.length === 0) {
    return NextResponse.json({
      message: 'Keine aktiven Kinder gefunden.',
      hinweise: [],
    })
  }

  const [{ data: allergies }, { data: medications }, { data: emergencyContacts }] = await Promise.all([
    supabase.from('health_records')
      .select('child_id, title, description, record_type')
      .in('child_id', childIds)
      .eq('record_type', 'allergy'),
    supabase.from('health_records')
      .select('child_id, title, record_type')
      .in('child_id', childIds)
      .eq('record_type', 'medication'),
    supabase.from('emergency_contacts')
      .select('child_id, is_primary')
      .in('child_id', childIds),
  ])

  const childrenWithAllergies = new Set((allergies ?? []).map((a: any) => a.child_id)).size
  const childrenWithMeds = new Set((medications ?? []).map((m: any) => m.child_id)).size
  const childrenWithEmergencyContact = new Set((emergencyContacts ?? []).map((e: any) => e.child_id)).size
  const childrenWithoutContact = childIds.length - childrenWithEmergencyContact

  // Top allergy types
  const allergyTypes: Record<string, number> = {}
  for (const a of allergies ?? []) {
    const key = (a as any).title?.toLowerCase() ?? 'unbekannt'
    allergyTypes[key] = (allergyTypes[key] ?? 0) + 1
  }
  const topAllergies = Object.entries(allergyTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t, n]) => `${t} (${n}x)`)
    .join(', ')

  const prompt = `Du bist medizinisch geschulte Kita-Fachkraft. Analysiere den Gesundheitsstand der Einrichtung.

Aktive Kinder: ${childIds.length}
Kinder mit Allergien: ${childrenWithAllergies} (${Math.round(childrenWithAllergies / childIds.length * 100)}%)
Kinder mit Dauermedikation: ${childrenWithMeds}
Kinder ohne Notfallkontakt: ${childrenWithoutContact}
Häufige Allergien: ${topAllergies || 'keine Daten'}

Erstelle 2-3 prägnante Sicherheitshinweise. Antworte NUR mit JSON:
{
  "hinweise": [
    {"typ": "alert"|"wichtig"|"info", "text": "Konkreter Hinweis zur Sicherheit oder Dokumentation"}
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
      stats: {
        total: childIds.length,
        withAllergies: childrenWithAllergies,
        withMeds: childrenWithMeds,
        withoutContact: childrenWithoutContact,
      },
    })
  } catch {
    return NextResponse.json({ error: 'generation failed' }, { status: 500 })
  }
}
